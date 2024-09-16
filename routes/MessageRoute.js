import {Router} from 'express';
import {verifyToken} from "../middlewares/AuthMiddleware.js";
import { getMessages, uploadFile } from '../controllers/MessageController.js';
import multer from "multer";


const messageRoutes = new Router();
const upload = multer({ dest: "uploads/files" });
messageRoutes.route("/upload-file").post(verifyToken, upload.single("file"), uploadFile);
messageRoutes.route("/get-messages").post(verifyToken, getMessages);

export default messageRoutes;