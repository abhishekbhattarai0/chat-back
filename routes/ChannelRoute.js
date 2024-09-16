import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { createChannel, getChannelMessages, getUserChannels } from "../controllers/ChannelController.js";

const channelRoutes = new Router();

channelRoutes.route("/create-channel").post(verifyToken, createChannel);
channelRoutes.route("/get-user-channels").get(verifyToken, getUserChannels);
channelRoutes.route("/get-channel-messages/:channelId").get(verifyToken, getChannelMessages);

export default channelRoutes;