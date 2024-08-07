import HttpError from "../helpers/HttpError.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { findUser } from "../services/authServices.js";

dotenv.config()


const {JWT_SECRET}=process.env;

const authentificate = async (req, res, next)=>{
const {authorization}= req.headers;
if(!authorization){
return next(HttpError(401,"Not authorized"));
}
const [bearer ,token]= authorization.split(" ");
if(bearer !=="Bearer"){
    return next (HttpError(401,"Not authorized"));
}
try {
    const {id}= jwt.verify(token, JWT_SECRET);
    const user= await findUser ({_id:id});
    if(!user){
        return next (HttpError(401,"Not authorized"));
    }
    if(!user.token) {
        return next(HttpError(401, "Not authorized"));
    }
    req.user=user;
    next();
    
} catch (error) {
    next (HttpError(401,error.message));
}
};

export default authentificate; 