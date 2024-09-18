import * as tasksService from "../services/tasksServices.js";

import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import groupTasksByParentId from "../helpers/taskMap.js";

const getAllTasks = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await tasksService.listTasks( owner );
  res.json(result);
};

const createTask = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await tasksService.addTask({ ...req.body, owner });

  res.status(201).json(result);
};

const updateTask = async (req, res) => {
  const { _id: owner } = req.user;
  const data = req.body;
  if (!data.text) {
    throw HttpError(400, "Body must have updated text");
  }
  const { id } = req.params;

  const result = await tasksService.updateTaskById(
    { _id: id, owner },
    req.body
  );
  if (!result) {
    throw HttpError(404, `Not found`);
  }
  res.json(result);
};

const deleteTask = async (req, res) => {
  const { id } = req.params;
  const {_id: owner}= req.user;

  const result = await tasksService.removeTask({_id:id, owner});

  if (!result) {
    throw HttpError(404, `Not found`);
  }
  res.json({ _id: id, message: "Delete success" });
};

export default {
  getAllTasks: ctrlWrapper(getAllTasks),

  createTask: ctrlWrapper(createTask),
  updateTask: ctrlWrapper(updateTask),
  deleteTask: ctrlWrapper(deleteTask),
};
