import Joi from "joi";

export const createTaskSchema = Joi.object({
  done: Joi.boolean().required(),
  title: Joi.string().required(),
  date: Joi.string().required(),
  subLevel: Joi.number(),
  parentId: Joi.string().required(),
  text: Joi.string().allow(""),
 
});

export const updateTaskSchema = Joi.object({
  title: Joi.string(),
  text: Joi.string(),
  date: Joi.string(),
  done: Joi.boolean(),
 });

