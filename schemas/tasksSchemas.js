import Joi from "joi";

export const createTaskSchema = Joi.object({
  text: Joi.string().required(),
  date: Joi.string().required(),
  subLevel: Joi.number(),
  parentId: Joi.string().required(),
 
});

export const updateTaskSchema = Joi.object({
  text: Joi.string().required(),
  
 });

