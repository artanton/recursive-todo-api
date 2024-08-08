import Task from "../models/task.js";

export const listTasks = ( ) =>
  Task.find();



export const addTask = async (data) => {
  const newTask = await Task.create(data);
  return newTask;
};

export const updateTaskById = (filter, data) =>
  Task.findOneAndUpdate(filter, data);

export const removeTask = (filter) => Task.findOneAndDelete(filter);


