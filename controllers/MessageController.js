import Message from "../models/MessageModel.js"
import {mkdirSync, renameSync} from 'fs'

export const getMessages = async (req, res, next) => {
    try {
        const user1 = req.userId;
        const user2 = req.body.id;

        if ( !user1 || !user2) {
            return res.status(400).send("Both user id are required.");
        }

        const messages = await Message.find({
            $or: [
                {sender: user1, recipient: user2},
                {sender: user2, recipient: user1},
            ]
        }).sort({timestamp: 1});

        return res.status(200).json({ messages })


    } catch (error) {
        return res.status(500).send("Something went wrong while getting all the messages");
    }
}

export const uploadFile = async( req, res, next) => {
    try {
        if(!req.file){
            return res.status(400).send("File is required.")
        }
        const date = Date.now();
        let fileDir = `uploads/files/${date}`;
        let fileName = `${fileDir}/${req.file.originalname}`;

        mkdirSync(fileDir, { recursive: true});
        const rees = renameSync(req.file.path, fileName)



        return res.status(200).json({filePath: fileName})
    } catch (error) {
        return res.status(500).send("Internal Server Error while uploading file")
    }
}