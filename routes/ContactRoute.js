import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { getAllContacts, getContactsForDmList, searchContacts } from "../controllers/ContactController.js";


const contactsRoutes = Router()
contactsRoutes.route("/search").post( verifyToken, searchContacts)
contactsRoutes.route("/get-contacts-for-dm").get(verifyToken, getContactsForDmList)
contactsRoutes.route("/get-all-contacts").get(verifyToken, getAllContacts);
export default contactsRoutes;