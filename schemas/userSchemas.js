import Joi from "joi";

export const signInSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required().min(6),
});

export const signUpSchema = Joi.object ({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required().min(6),
    
});

export const updateSchema = Joi.object({
    oldPassword: Joi.string().required().min(6),
    newPassword: Joi.string().min(6),
    avatarURL: Joi.string().regex(/\.(jpg|jpeg|png)$/i)
});

export const emailSchema = Joi.object ({
    email: Joi.string().required(),
    
});