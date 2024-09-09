import { Schema, model } from "mongoose";
import { handleSaveError, setUpdateSettings } from "./hooks.js";

const taskSchema = new Schema(
  {
    text: {
      type: String,
      required: [true, "Set task text"],
    },
    date: {
      type: String,
      required: true,
    },
    subLevel:{
      type: Number,
      required: true,
    },
    parentId: {
      type: String,
      required: true,
    },
    owner:{
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    }
   

    
  },
  { versionKey: false, timestamps: true }
);
taskSchema.post("save", handleSaveError);

taskSchema.pre("findOneAndUpdate", setUpdateSettings);

taskSchema.post("findOneAndUpdate", handleSaveError);

const Task = model("task", taskSchema);

export default Task;
