import express from "express";
import tasksController from "../controllers/taskControllers.js";
import {
  createTaskSchema,
  updateTaskSchema,
 
} from "../schemas/tasksSchemas.js";
import validateBody from "../decorators/validateBody.js";
import isValidId from "../middlewares/isValidId.js";

const tasksRouter = express.Router();



tasksRouter.get("/", tasksController.getAllTasks);



tasksRouter.post(
  "/",
  validateBody(createTaskSchema),
  tasksController.createTask
);

tasksRouter.put(
  "/:id",
  isValidId,
  validateBody(updateTaskSchema),
  tasksController.updateTask
);

tasksRouter.delete("/:id", isValidId, tasksController.deleteTask);


export default tasksRouter;
