import User from "../models/userModel.js";
import bcrypt from "bcrypt";

export const findUser = (data) => User.findOne(data);
export const signup = async (data) => {
  const hashPassword = await bcrypt.hash(data.password, 10);
  return User.create({ ...data, password: hashPassword });
};

export const validatePassword = async (password, hashPassword) =>
  await bcrypt.compare(password, hashPassword);

export const updateUser = (filter, data) => User.findOneAndUpdate(filter, data);
