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
import HttpError from "../helpers/HttpError.js";

dotenv.config();
const { JWT_SECRET, JWT_REFRESH_SECRET, BASE_URL } = process.env;
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

export const findUser = async (data) => await User.findOne(data);

export const validateValue = async (value, hashValue) =>
  await bcrypt.compare(value, hashValue);

export const signup = async (data) => {
  const { email } = data;

  const avatarURL = gravatar(email, { s: 250 });
  const verificationCode = nanoid();

  const registredUser = await User.findOne({ email });
  if (registredUser) {
    throw HttpError(409, "Email in use");
  }

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
  const comparePassword = await validateValue(password, loggingInUser.password);
  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
  }
  if (!loggingInUser.verify) {
    throw HttpError(401, "Email is not verified");
  }

  // if(loggingInUser.refreshToken){
  //   tokenRefresh(loggingInUser.refreshToken)
  // }

  const { _id: id } = loggingInUser;
  const payload = { id };

  const tokens = await generateTokens(payload);

  await updateUser({ _id: id }, { refreshToken: tokens.hashRefreshToken });
  return {
    user: {
      name: loggingInUser.name,
      email: loggingInUser.email,
      avatarURL: loggingInUser.avatarURL,
      verify: loggingInUser.verify,
    },
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

const generateTokens = async (payload) => {
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "15s" });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: "1000s",
  });
  const hashRefreshToken = await bcrypt.hash(refreshToken, 10);
  return { accessToken, refreshToken, hashRefreshToken };
};

export const tokenRefresh = async (token) => {
  const payload = jwt.decode(token);

  const userToUpdate = await User.findOne({ _id: payload.id });
  if(!userToUpdate){
    throw new HttpError(401, "Not authorized");
  };

  const storedToken = userToUpdate.refreshToken;

  if (!storedToken) {
    throw  HttpError(401, "Not authorized");
  }
  const compareRefreshTokens = await validateValue(token, storedToken);

  if (!compareRefreshTokens) {
    throw HttpError(401, "Not authorized");
  }

  const refreshedTokens = await generateTokens({ id: userToUpdate.id });

  const updatedUser = await updateUser(
    { _id: payload.id },
    { refreshToken: refreshedTokens.hashRefreshToken }
  );
  
  return {
    user: {
      email: updatedUser.email,
      name: updatedUser.name,
      avatarURL: updatedUser.avatarURL,
      verify: updatedUser.verify,
    },
    accessToken: refreshedTokens.accessToken,
    refreshToken: refreshedTokens.refreshToken,
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

  const comparePassword = await validateValue(oldPassword, password);
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
    if (avatarURL) {
      const oldAvatar = path.join(toDelPath, avatarURL);
      await fs.rm(oldAvatar);
    }
  }
  await updateUser({ _id }, { avatarURL: newAvatar });

  return { newAvatar };
};

export const updateUser = (filter, data) =>
  User.findOneAndUpdate(filter, { ...data }, { new: true });
