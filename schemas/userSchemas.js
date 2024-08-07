import Joi from "joi";

export const signInSchema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
});

export const signUpSchema = Joi.object ({
    email: Joi.string().required(),
    password: Joi.string().required(),
    subscription: Joi.string(),  
});

export const updateSchema = Joi.object({
    avatarURL: Joi.string().regex(/\.(jpg|jpeg|png)$/i)
});

export const emailSchema = Joi.object ({
    email: Joi.string().required(),
    
});
