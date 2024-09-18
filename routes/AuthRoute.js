import { Router } from "express";
import { login, signup, getUserInfo, updateProfile, addProfileImage, deleteProfileImage, logout } from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";
import { upload } from "../middlewares/multerMiddleware.js";


const authRoutes = Router()
// const upload = multer({dest:"uploads/profiles/"})

authRoutes.route("/signup").post(signup);
authRoutes.route("/login").post(login);
authRoutes.route("/user-info").get(verifyToken,getUserInfo);
authRoutes.route("/update-profile").post(verifyToken, updateProfile);
authRoutes.route("/add-profile-image")
          .post(
            verifyToken,
            upload.single("profile-image"),
            addProfileImage
            )

authRoutes.route("/remove-profile-image").delete(verifyToken, deleteProfileImage)
authRoutes.route("/logout").post(logout);
export default authRoutes