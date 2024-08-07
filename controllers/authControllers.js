import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";
import gravatar from "gravatar-url";



import * as authService from "../services/authServices.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import sendEmail from "../helpers/sendEmail.js";
import { nanoid } from "nanoid";


const avatarsPath = path.resolve("public", "avatars");


dotenv.config();
const { JWT_SECRET, BASE_URL } = process.env;

const signUp = async (req, res) => {
  const { email } = req.body;

  const isUserExist = await authService.findUser({ email });
  if (isUserExist) {
    throw HttpError(409, "Email in use");
  }

  const verificationCode =  nanoid();
  const newUser = await authService.signup({...req.body, verificationCode});

  const verifyEmail = {
    to: email,
    subj: "verification",
    html:` <a href = "${BASE_URL}/api/users/verify/${verificationCode}">"Click to verify"</a>`
  }

  await sendEmail(verifyEmail);

  const avatarURL = gravatar(email, {s:250});
  await authService.updateUser({ email }, { avatarURL });

  res.status(201).json({
    email: newUser.email,
    subscription: newUser.subscription,
    avatar: newUser.avatarURL,
  });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  const isUserExist = await authService.findUser({ email });
  if (!isUserExist) {
    throw HttpError(401, "Email or password is wrong");
  }   
  if (!isUserExist.verify){
    throw HttpError(401, "email is not verify");
  }
  const comparePassword = await authService.validatePassword(
    password,
    isUserExist.password
  );
  if (!comparePassword) {
    throw HttpError(401,  "Email or password is wrong");
  }
  const { _id: id } = isUserExist;
  const payload = {
    id,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  await authService.updateUser({ _id: id }, { token });

  res.json({ token });
};

const verify = async (req, res) => {
const {verificationCode}= req.params;
const user = await authService.findUser({verificationCode});
if (!user){
  throw HttpError(404, "User not found");
}
await authService.updateUser({_id: user._id},{verify: true, verificationCode: ""});

res.status(200).json({
  message:"Verification successful"
})
};

const resendVerify = async (req, res)=>{
 const {email}=req.body;
 const user = await authService.findUser ({email});
 if (!user){
  throw HttpError(404,"User not found")
 }
 if (user.verify){
  throw HttpError(400, "Verification has already been passed")
 }
 const verifyEmail = {
  to: email,
  subj: "verification",
  html:` <a href = "${BASE_URL}/api/users/verify/${user.verificationCode}">"Click to verify"</a>`
}

await sendEmail(verifyEmail);

res.json({"message": "Verification email sent"})
};

const update = async (req, res) => {
  const { _id } = req.user;
  if (!req.file) {
    throw HttpError(401, "No file uploaded");;
  }
  const { path: oldPath, filename} = req.file;


  const image = await Jimp.read(oldPath);
  image.resize(250, 250).write(oldPath);

  const newPath = path.join(avatarsPath, filename);

  await fs.rename(oldPath, newPath);
  const avatarURL = path.join("avatars", filename);

  await authService.updateUser({ _id }, { avatarURL });

  res.status(200).json({
    avatarURL,
  });
};

const getCurrent = (req, res) => {
  const { email, subscription } = req.user;
  res.json({ email, subscription });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  await authService.updateUser({ _id }, { token: "" });

  res.status(204).json("No Content");
};

export default {
  signUp: ctrlWrapper(signUp),
  signIn: ctrlWrapper(signIn),
  verify: ctrlWrapper(verify),
  resendVerify: ctrlWrapper(resendVerify),
  update: ctrlWrapper(update),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
};
