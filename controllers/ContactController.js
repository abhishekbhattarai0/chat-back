import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Message from "../models/MessageModel.js";
import {ApiError} from "../utils/ApiError.js"


export const searchContacts = async (req, res, next) => {
    try {
        const { searchTerm } = req.body;
        console.log("searchTerm",searchTerm)

        if(searchTerm === undefined || searchTerm === null) {
            throw new ApiError(400, "Search Term is required.");
        }

        const sanitizedSearchTerm = searchTerm.replace(
            /[.*+?^$()[\]{}\\]/g
        );

        const regex = new RegExp(sanitizedSearchTerm,"i");

        const contacts = await User.find({
            $and: [
                { _id: { $ne: req.userId}},
                {
                    $or: [{ firstName: regex}, { lastName: regex }, { email: regex}],
                },
            ],
        },"firstName lastName email image");

        return res.status(200).json({contacts});
    } catch (error) {
        throw new ApiError(500, "Internal server error while searching contacts.");
    }
}

export const getContactsForDmList = async(req, res, next ) => {
    try {
        let { userId } = req;
        userId = new mongoose.Types.ObjectId(userId);


        const contacts = await Message.aggregate([
            {
                $match: {
                    $or:[{sender: userId}, {recipient: userId}]
                },
            },
            {
                $sort:{ timestamp: -1}
            },
            {
                $group:{
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", userId] },
                            then: "$recipient",
                            else: "$sender"
                        }
                    },
                    lastMessageTime:{ $first : "$timestamp"}
                }
            },
            { 
                $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "contactInfo"
            }
        },
        {
            $unwind: "$contactInfo"
        },
        {
            $project: {
                _id: 1,
                lastMessageTime: 1,
                email: "$contactInfo.email",
                firstName: "$contactInfo.firstName",
                lastName: "$contactInfo.lastName",
                image: "$contactInfo.image",
                color: "$contactInfo.color",
            }
        },
        {
            $sort: { lastMessageTime: -1}
        }
        ]);


        return res.status(200).json({ contacts});
    } catch (error) {
            throw new ApiError(500, "Internal Server Error while getting dm list.");
    }
}

export const getAllContacts = async (req, res, next) => {
    try {
        const users = await User.find(
            { _id: { $ne: req.userId }},
            "firstName lastName _id email"
        );

        const contacts = users.map( (user) => ({
            label: user.firstName ? `${user.firstName} ${user.lastName}` : user.email,
            value: user._id,
        }));

        return res.status(200).json({ contacts });
    } catch (error) {
            throw new ApiError(500, "Internal Server Error while getting all contacts.");
    }
}