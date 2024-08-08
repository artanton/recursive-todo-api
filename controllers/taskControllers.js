import * as tasksService from "../services/tasksServices.js";

import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import groupTasksByParentId from "../helpers/taskMap.js";

const getAllTasks = async (req, res) => {
  const result = await tasksService.listTasks();
  res.json(result);
};

const createTask = async (req, res) => {
  const result = await tasksService.addTask({ ...req.body });

  res.status(201).json(result);
};

const updateTask = async (req, res) => {
  const data = req.body;
  if (!data.text) {
    throw HttpError(400, "Body must have updated text");
  }
  const { id } = req.params;

  const result = await tasksService.updateTaskById({ _id: id }, req.body);
  if (!result) {
    throw HttpError(404, `Not found`);
  }
  res.json(result);
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  
  const allTasks = await tasksService.listTasks();
  
  const taskMap = groupTasksByParentId(allTasks);

  const deleteTaskChain = async (id )=> {
    if (taskMap[id]) {
      taskMap[id].forEach(subtask => deleteTaskChain(subtask.id));
    }

    const result = await tasksService.removeTask({ _id: id });
    return result;
  };

  const result = await deleteTaskChain(id);
  
    
    if (!result) {
      throw HttpError(404, `Not found`);
    }
    res.json({ message: "Delete success" });
  
  
};

export default {
  getAllTasks: ctrlWrapper(getAllTasks),

  createTask: ctrlWrapper(createTask),
  updateTask: ctrlWrapper(updateTask),
  deleteTask: ctrlWrapper(deleteTask),
};
