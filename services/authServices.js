import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import sendEmail from "../helpers/sendEmail.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import Jimp from "jimp";
import gravatar from "gravatar-url";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import exp from "constants";

dotenv.config();
const { JWT_SECRET, BASE_URL } = process.env;
const avatarsPath = path.resolve("public", "avatars");
const toDelPath = path.resolve("public");

export const emailSender = async (email, verificationCode) => {
  const verifyEmail = {
    from: "ToDo List App",
    to: email,
    subject: "Verification",
    html: `You just registred in the ToDo List App <a href = "${BASE_URL}/api/users/verify/${verificationCode}">"Click this link to verify"</a> or ignor it if you are not.`,
  };

  await sendEmail(verifyEmail);
};

export const findUser = (data) => User.findOne(data);

export const validatePassword = async (password, hashPassword) =>
  await bcrypt.compare(password, hashPassword);

export const signup = async (data) => {
  const { email } = data;

  const avatarURL = gravatar(email, { s: 250 });
  const verificationCode = nanoid();

  const registredUser = await User.findOne({ email });
  if (registredUser) {
    throw HttpError(409, "Email in use");
  }
  console.log(email);

  await emailSender(email, verificationCode);

  const hashPassword = await bcrypt.hash(data.password, 10);
  User.create({
    ...data,
    password: hashPassword,
    verificationCode: verificationCode,
  });
  const newUser = await updateUser({ email }, { avatarURL });

  return newUser;
};

export const signin = async (data) => {
  const { email, password } = data;

  const loggingInUser = await User.findOne({ email });
  if (!loggingInUser) {
    throw HttpError(401, "Email or password is wrong");
  }
  const comparePassword = await validatePassword(
    password,
    loggingInUser.password
  );
  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
  }
  if (!loggingInUser.verify) {
    throw HttpError(401, "Email is not verified");
  }

  const { _id: id } = loggingInUser;
  const payload = {
    id,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
  await updateUser({ _id: id }, {authinticate: true});
  return {
    user: {
      name: loggingInUser.name,
      email: loggingInUser.email,
      avatarURL: loggingInUser.avatarURL,
      verify: loggingInUser.verify,
    },
    token: token,
  };
};

export const passwordUpdate = async (user, data) => {
  const { _id, password } = user;
  const { oldPassword, newPassword } = data;

  if (!oldPassword || !newPassword) {
    throw HttpError(401, "There is no data to update");
  }
  if (oldPassword === newPassword) {
    throw HttpError(401, "There is no data to update");
  }

  const comparePassword = await validatePassword(oldPassword, password);
  if (!comparePassword) {
    throw HttpError(400, "Invalid password");
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);
  const responce = await updateUser({ _id }, { password: hashPassword });
  return responce;
};

export const avatarUpdate = async (data) => {
  const { _id, avatarURL, oldPath, filename } = data;

  const image = await Jimp.read(oldPath);
  image.resize(250, 250).write(oldPath);

  const newPath = path.join(avatarsPath, filename);

  await fs.rename(oldPath, newPath);
  const newAvatar = path.join("avatars", filename);

  const isGravatar = avatarURL.split("/").includes("gravatar.com");
  if (!isGravatar) {
    const oldAvatar = path.join(toDelPath, avatarURL);

    await fs.rm(oldAvatar);
  }

  await updateUser({ _id }, { newAvatar });

  return { newAvatar };
};

export const updateUser = (filter, data) =>
  User.findOneAndUpdate(filter, { ...data }, { new: true });
