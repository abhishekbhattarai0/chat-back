import {v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

import { configDotenv } from 'dotenv';
configDotenv()

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        console.log("i am here")
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type:'auto',
        })
        // files have been uploaded succesfully
        // console.log("file is uploaded on cloudinary",response.url )
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        console.log("error while uploading to cloudinary :",error)
        fs.unlinkSync(localFilePath) // remove the locally saved temporary as upload operation got failed
    }
}

const deleteFromCloudinary = async(filePath) => {
    try {
        if (!filePath) {
            return null;
        }
        const publicId = filePath.split("/")[7].split(".")[0]

        if(!publicId) return null;
        const response = await cloudinary.uploader.destroy(publicId, ()=>{
            console.log("DEleted successfully")
        })

        return response;
    } catch (error) {
        console.log( "Error while deleting:",error)
    }

}





export {
    uploadOnCloudinary,
    deleteFromCloudinary
}