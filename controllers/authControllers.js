import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";
import gravatar from "gravatar-url";
import bcrypt from "bcrypt";

import * as authService from "../services/authServices.js";
import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import sendEmail from "../helpers/sendEmail.js";
import { nanoid } from "nanoid";

const avatarsPath = path.resolve("public", "avatars");
const toDelPath = path.resolve("public");

dotenv.config();
const { JWT_SECRET, BASE_URL } = process.env;

const signUp = async (req, res) => {
  const { email } = req.body;

  const isUserExist = await authService.findUser({ email });
  if (isUserExist) {
    throw HttpError(409, "Email in use");
  }

  const verificationCode = nanoid();
  const newUser = await authService.signup({ ...req.body, verificationCode });

  const verifyEmail = {
    from: "ToDo List App",
    to: email,
    subject: "Verification",
    html: `You just registred in the ToDo List App <a href = "${BASE_URL}/api/users/verify/${verificationCode}">"Click this link to verify"</a> or ignor it if you are not.`,
  };

  await sendEmail(verifyEmail);

  const avatarURL = gravatar(email, { s: 250 });
  await authService.updateUser({ email }, { avatarURL });

  res.status(201).json({
    email: newUser.email,
    name: newUser.name,
    avatar: newUser.avatarURL,
    verify: newUser.verify,
  });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  const isUserExist = await authService.findUser({ email });
  if (!isUserExist) {
    throw HttpError(401, "Email or password is wrong");
  }

  const comparePassword = await authService.validatePassword(
    password,
    isUserExist.password
  );
  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
  }
  if (!isUserExist.verify) {
    throw HttpError(401, "Email is not verified");
  }
  const { _id: id } = isUserExist;
  const payload = {
    id,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  await authService.updateUser({ _id: id }, { token });

  res.json({
    user: {
      name: isUserExist.name,
      email: isUserExist.email,
      avatarURL: isUserExist.avatarURL,
      verify: isUserExist.verify,
    },
    token: token,
  });
};

const verify = async (req, res) => {
  const { verificationCode } = req.params;
  const user = await authService.findUser({ verificationCode });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  await authService.updateUser(
    { _id: user._id },
    { verify: true, verificationCode: "" }
  );

  res
    .status(200)
    .json({ message: "Verification successful. You can Login now" });
};

const resendVerify = async (req, res) => {
  const { email } = req.body;
  const user = await authService.findUser({ email });
  if (!user) {
    throw HttpError(404, "User not found");
  }
  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }
  const verifyEmail = {
    from: "ToDo List App",
    to: email,
    subject: "Verification",
    html: `You just registred in the ToDo List App <a href = "${BASE_URL}/api/users/verify/${user.verificationCode}">"Click this link verify"</a> or ignor it if you are not.`,
  };

  await sendEmail(verifyEmail);

  res.json({ message: "Verification email sent" });
};

const updatePassword = async (req, res) => {
  const { _id, password,} = req.user;
  const { oldPassword, newPassword } = req.body;
  
  
  if(!oldPassword || !newPassword){
    throw HttpError(401, 'There is no data to update');
  }
  if(oldPassword === newPassword){
    throw HttpError(401, 'There is no data to update');
  }
  console.log(oldPassword);
  console.log(password);
  const comparePassword = await authService.validatePassword(
    oldPassword,
    password
  );
  console.log(comparePassword);
  if (!comparePassword) {
    throw HttpError(400, "Invalid password");
  }
  
    const hashPassword = await bcrypt.hash(newPassword, 10);
    await authService.updateUser({ _id },{password: hashPassword});
  

  res.status(200).json({message: "User password update success"});
};

const updateAvatar = async (req, res) => {
  const { _id, avatarURL } = req.user;
  const { path: oldPath, filename } = req.file;
  
  const data={};

  if (!req.file) {
    throw HttpError(401, "There is no data to update");
  }

    const image = await Jimp.read(oldPath);
    image.resize(250, 250).write(oldPath);

    const newPath = path.join(avatarsPath, filename);

    await fs.rename(oldPath, newPath);
    const newAvatar = path.join("avatars", filename);

    data.avatarURL = newAvatar;

    // const isGravatar = avatarURL.split('/').includes("gravatar.com")
    // if(!isGravatar){
    // const toDelAvatar = path.join(toDelPath, avatarURL);

    // await fs.rm(toDelAvatar);}
  
  await authService.updateUser({ _id }, data);

  res.status(200).json(data.avatarURL);
};

const getCurrent = (req, res) => {
  const { name, email, avatarURL, verify } = req.user;

  res.json({ name, email, avatarURL, verify });
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
  updateAvatar: ctrlWrapper(updateAvatar),
  updatePassword: ctrlWrapper(updatePassword),
  getCurrent: ctrlWrapper(getCurrent),
  logout: ctrlWrapper(logout),
};

// const update = async (req, res) => {
//   const { _id, password, avatarURL } = req.user;
//   const { oldPassword, newPassword } = req.body;
//   const data = {};

//   const comparePassword = await authService.validatePassword(
//     oldPassword,
//     password
//   );

//   if (!comparePassword) {
//     throw HttpError(400, "Invalid password");
//   }
//   if (newPassword) {
//     const hashPassword = await bcrypt.hash(newPassword, 10);
//     data.password = hashPassword;
//   }

//   if (req.file) {
//     const { path: oldPath, filename } = req.file;

//     const image = await Jimp.read(oldPath);
//     image.resize(250, 250).write(oldPath);

//     const newPath = path.join(avatarsPath, filename);

//     await fs.rename(oldPath, newPath);
//     const newAvatar = path.join("avatars", filename);

//     data.avatarURL = newAvatar;

//     const isGravatar = avatarURL.split('/').includes("gravatar.com")
//     if(!isGravatar){
//     const toDelAvatar = path.join(toDelPath, avatarURL);

//     await fs.rm(toDelAvatar);}
//   }
//   if (!data.password && !data.avatarURL) {
//     throw HttpError(401, "There is no data to update");
//   }
//   await authService.updateUser({ _id }, data);

//   res.status(200).json(data.avatarURL);
// };
