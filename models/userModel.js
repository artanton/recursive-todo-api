import { Schema, model } from "mongoose";
import { handleSaveError, setUpdateSettings } from "./hooks.js";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },

    avatarURL: {
      type: String,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    verify: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    refreshToken:{
      type: String,
      default: "",
    }
  },
  { versionKey: false, timestamps: true }
);
userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate", setUpdateSettings);

userSchema.post("findOneAndUpdate", handleSaveError);

const User = model("user", userSchema);

export default User;
