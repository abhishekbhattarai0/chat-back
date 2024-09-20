import Message from "../models/MessageModel.js"
import {mkdirSync, renameSync} from 'fs'
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const getMessages = async (req, res, next) => {
    try {
        const user1 = req.userId;
        const user2 = req.body.id;

        if ( !user1 || !user2) {
            throw new ApiError(400, "Both user id are required..");
        }

        const messages = await Message.find({
            $or: [
                {sender: user1, recipient: user2},
                {sender: user2, recipient: user1},
            ]
        }).sort({timestamp: 1});

        return res.status(200).json({ messages })


    } catch (error) {
            throw new ApiError(500, "Something went wrong while getting all the messages.");
    }
}

export const uploadFile = async( req, res, next) => {
    try {
        const localFilePath = req.file.path;
        if(!localFilePath){
            throw new ApiError(400, "File is required.");
        }

        const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

        if(!cloudinaryResponse.secure_url){
            throw new ApiError(400, "file cannot be uploaded .");
        }



        return res.status(200).json({filePath: cloudinaryResponse.secure_url})
    } catch (error) {
            throw new ApiError(400, "Internal Server Error while uploading file.");
    }
}