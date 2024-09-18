import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bycrypt from "bcrypt";
import fs from 'fs'
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const maxAge = 3 *24 *60 *60 *1000;

const createToken = (email, userId) => {
    return jwt.sign({email, userId}, process.env.JWT_KEY, {expiresIn:maxAge})
};

export const signup = async( req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).send("Email and password is required.")
        }

        let user = await User.findOne({email:email})
        if(user){
            return res.status(502).send({message: "User with email alredy exists"})
        }
        user = await User.create({email,password});
        res.cookie("jwt",createToken(email,user.id), {
            maxAge,
        });


        return res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                profileSetup: user.profileSetup
            }
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error.")
    }
}

export const login = async( req, res, next) => {
    try {
        const { email, password } = req.body;
        if( !email && !password ) {
            res.status(400).send("Email and Passwords are required");
        }
        const user = await User.findOne({ email });
        if(!user){
            res.status(404).send("User with the given email and password not found.");
        }
        const auth = await bycrypt.compare(password, user.password);
        if(!auth){
            return res.status(400).send("Password is incorrect.");
        }

        res.cookie("jwt", createToken(email, user.id),{
            maxAge,
            secure: true,
            sameSite: "None",
            httpOnly: true
        });
        return res.status(200).json({
            user: {
                id: user._id,
                email: user.email,
                profileSetup: user.profileSetup,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color
            }
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error.")
    }
}

export const getUserInfo = async (req, res, next) => {
    try {
        const { userId } = req;
        const userData = await User.findById(userId);

        
        if(!userData){
            return res.status(404).send("User with the given Id not found.")
        }
        return res.status(200).json({
                id: userData.id,
                email: userData.email,
                profileSetup: userData.profileSetup,
                firstName: userData.firstName,
                lastName: userData.lastName,
                image: userData.image,
                color: userData.color,
        })
    } catch (error) {
        return res.status(500).send("Internal Server Error.")
    }
}

export const updateProfile = async( req, res, next) => {
    try {
        const {userId} = req;
        const {firstName, lastName, color} = req.body;
        if(!firstName || !lastName ){
            return res.status(400).send("firstname, lastname and color are required.")
        }
        const userData = await  User.findByIdAndUpdate(
        userId,
            {
                firstName,
                lastName, 
                color, 
                profileSetup:true
            }, 
            {new:true, runValidators:true}
        );

        return res.status(200).json({
            id: userData.id,
            email: userData.email,
            profileSetup: userData.profileSetup,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
    })
    } catch (error) {
        return res.status(500).send("Internal Server Error occured while updating profile")
    }
}



export const addProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("Image is required.");
        }

        // Define file paths
        const date = Date.now();
        const fileName = `${date}-${req.file.originalname}`;
        const localFilePath = req.file.path;
      

        const cloudinaryResponse = await uploadOnCloudinary(localFilePath);


        if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
            throw new Error("Cloudinary upload response missing secure_url.");
        }

        // Update the user's profile image with the Cloudinary URL
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { image: cloudinaryResponse.secure_url },
            { new: true, runValidators: true }
        );

        

        return res.status(200).json({ image: updatedUser.image });
    } catch (error) {
        return res.status(500).send("Internal Server Error occurred while adding profile.");
    }
};




export const deleteProfileImage = async( req, res, next ) => {
    try {
        const { userId } = req;
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).send("User not found.");
        }

        const response = deleteFromCloudinary(user?.image);
        // if(user.image){
        //     fs.unlink(user.image, (err)=> {
        //         if (err) {
        //             return res.status(500).json({
        //                 message: "Something went wrong while deleting the image",
        //                 error: err
        //             })
        //         }
        //     })
        // }
        console.log("respose after delete request ", response)
       if (response) {
         user.image = null;
         await user.save();
         return res.status(200).send("Profile image deleted successfully");
        }

        throw Error("Image doesnot exist");

    } catch (error) {
        return res.status(500).send("Internal Server Error while deleting the Profile image.")
    }
}

export const logout = async(req, res, next) => {
    try {
        res.cookie("jwt","", {secure:true, sameSite: "None" });
        return res.status(200).send("Logout successfull.");
    } catch (error) {
        return res.status(500).send("Internal Server Error while logout.")
    }
}
