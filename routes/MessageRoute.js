import {Router} from 'express';
import {verifyToken} from "../middlewares/AuthMiddleware.js";
import { getMessages, uploadFile } from '../controllers/MessageController.js';
import { upload } from '../middlewares/multerMiddleware.js';


const messageRoutes = new Router();
messageRoutes.route("/upload-file").post(verifyToken, upload.single("file"), uploadFile);
messageRoutes.route("/get-messages").post(verifyToken, getMessages);

export default messageRoutes;