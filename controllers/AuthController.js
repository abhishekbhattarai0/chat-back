import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bycrypt from "bcrypt";
import fs from 'fs'

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
            secure: true,
            sameSite: "None"
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
        if( !email || !password ) {
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
            sameSite: "None"
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

export const addProfileImage = async( req, res, next ) => {
   try {
    if(!req.file){
        res.status(400).send("Image is required")
    };

    const date = Date.now();
    let fileName = "uploads/profiles/"+ date + req.file.originalname;
    fs.renameSync(req.file.path, fileName);
    console.log("first")

    const updatedUser = await User.findByIdAndUpdate(
        req.userId,
        {image: fileName},
        {new:true, runValidators:true}
    ) ;

    
    console.log("updatedUser :", updatedUser)

    return res.status(200).json({image: updatedUser.image})
   } catch (error) {
    return res.status(500).send("Internal Server Error occured while adding profile");
   } 
}

export const deleteProfileImage = async( req, res, next ) => {
    try {
        const { userId } = req
        const user = await User.findById(userId);
        console.log(user.image)
        if(!user) {
            return res.status(404).send("User not found.");
        }

        if(user.image){
            console.log("there is image")
            console.log(user.image)
            fs.unlink(user.image, (err)=> {
                if (err) {
                    return res.status(500).json({
                        message: "Something went wrong while deleting the image",
                        error: err
                    })
                }
            })
        }
        
        user.image = null;
        await user.save();

        return res.status(200).send("Profile image deleted successfully");
    } catch (error) {
        return res.status(500).send("Internal Server Error while deleting the Profile image.")
    }
}

export const logout = async(req, res, next) => {
    try {
        res.cookie("jwt","", {maxAge:1, secure:true, sameSite: "None"});
        return res.status(200).send("Logout successfull.");
    } catch (error) {
        return res.status(500).send("Internal Server Error while logout.")
    }
}