import Contact from "../models/contact.js";

export const listContacts = (filter = {}, query = {}) =>
  Contact.find(filter, "-createdAt -updatedAt", query);

export const getContactById = (filter) => Contact.findOne(filter);

export const addContact = async (data) => {
  const newContact = await Contact.create(data);
  return newContact;
};

export const updateContactById = (filter, data) =>
  Contact.findOneAndUpdate(filter, data);

export const removeContact = (filter) => Contact.findOneAndDelete(filter);

export const updateStatusContact = (filter, data) =>
  Contact.findOneAndUpdate(filter, data);
