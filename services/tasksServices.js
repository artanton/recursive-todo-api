import groupTasksByParentId from "../helpers/taskMap.js";
import Task from "../models/task.js";

export const listTasks = (owner = {}) => Task.find({ owner });

export const addTask = async (data) => {
  const newTask = await Task.create(data);
  return newTask;
};

export const updateTaskById = (filter, data) =>{
 const result =Task.findOneAndUpdate(filter, data);
 return result;}

export const removeTask = async (props) => {
  const allTasks = await listTasks(props.owner);
  const taskMap = groupTasksByParentId(allTasks);

  const id = props._id;
  const deleteTaskChain = async (id) => {
    if (taskMap[id]) {
      taskMap[id].forEach((subtask) => deleteTaskChain(subtask.id));
    }

    const result = await Task.findByIdAndDelete(id);
    return result;
  };

  return deleteTaskChain(id);
};
