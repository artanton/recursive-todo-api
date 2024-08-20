import groupTasksByParentId from "../helpers/taskMap.js";
import Task from "../models/task.js";

export const listTasks = () => Task.find();

export const addTask = async (data) => {
  const newTask = await Task.create(data);
  return newTask;
};

export const updateTaskById = (filter, data) =>
  Task.findOneAndUpdate(filter, data);


export const removeTask = async (id) => {
  const allTasks = await listTasks();
  const taskMap = groupTasksByParentId(allTasks);

  const deleteTaskChain = async (id) => {
    if (taskMap[id]) {
      taskMap[id].forEach((subtask) => deleteTaskChain(subtask.id));
    }
    const result = await Task.findOneAndDelete({ _id: id });
    return result;
  };

  return deleteTaskChain(id);
};
