import express from "express";
import contactsController from "../controllers/contactsControllers.js";
import {
  createContactSchema,
  updateContactSchema,
  updateStatusSchema,
} from "../schemas/contactsSchemas.js";
import validateBody from "../decorators/validateBody.js";
import isValidId from "../middlewares/isValidId.js";
import authentificate from "../middlewares/authentificate.js";

const contactsRouter = express.Router();

contactsRouter.use(authentificate);

contactsRouter.get("/", contactsController.getAllContacts);

contactsRouter.get("/:id", isValidId, contactsController.getOneContact);

contactsRouter.post(
  "/",
  validateBody(createContactSchema),
  contactsController.createContact
);

contactsRouter.put(
  "/:id",
  isValidId,
  validateBody(updateContactSchema),
  contactsController.updateContact
);

contactsRouter.delete("/:id", isValidId, contactsController.deleteContact);

contactsRouter.patch(
  "/:id",
  isValidId,
  validateBody(updateStatusSchema),
  contactsController.updateStatus
);

export default contactsRouter;
