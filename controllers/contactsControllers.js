import * as contactsService from "../services/contactsServices.js";

import HttpError from "../helpers/HttpError.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

const getAllContacts = async (req, res) => {
  const{_id:owner}=req.user;
  const {page=1, limit=5}=req.query;
  const skip = (page-1)*limit;
  const result = await contactsService.listContacts({owner},{skip, limit});
  res.json(result);
};

const getOneContact = async (req, res) => {
  const { id } = req.params;
  const {_id: owner}=req.user;
  const result = await contactsService.getContactById({_id:id, owner});
  if (!result) {
    throw HttpError(404, `Not found`);
  }

  res.json(result);
};

const createContact = async (req, res) => {
  const{_id:owner}=req.user;
  const result = await contactsService.addContact({...req.body,owner});
  console.log(req.body);
  res.status(201).json(result);
};

const updateContact = async (req, res) => {
  const data = req.body;
  if (!data.name && !data.email && !data.phone && !data.favorite) {
    throw HttpError(400, "Body must have at least one field");
  }
  const { id } = req.params;
  const {_id: owner}=req.user;
  const result = await contactsService.updateContactById({_id:id, owner}, req.body);
  if (!result) {
    throw HttpError(404, `Not found`);
  }
  res.json(result);
};

const deleteContact = async (req, res) => {
  const { id } = req.params;
  const {_id: owner}=req.user;
  const result = await contactsService.removeContact({_id:id, owner});
  if (!result) {
    throw HttpError(404, `Not found`);
  }
  res.json({ message: "Delete success" });
};

const updateStatus = async (req, res)=>{
  const {id}= req.params;
  const {_id: owner}=req.user;
  const result= await contactsService.updateStatusContact({_id:id, owner}, req.body);
  if(!result){
    throw HttpError(404, 'Not found');
    }
    res.json(result)
}

export default {
  getAllContacts: ctrlWrapper(getAllContacts),
  getOneContact: ctrlWrapper(getOneContact),
  createContact: ctrlWrapper(createContact),
  updateContact: ctrlWrapper(updateContact),
  deleteContact: ctrlWrapper(deleteContact),
  updateStatus: ctrlWrapper(updateStatus),
};
