import multer from "multer";
import fs from 'fs'


// export const upload = multer({dest:"uploads/profiles/"})
// export const upload = multer({
//   dest
// })


const date = Date.now()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/profiles/';

    // Create the directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true }); // Ensures parent directories are created if they don't exist
    }

    cb(null, dir); // Proceed with saving to the directory
  },
    filename: function (req, file, cb) {
      cb(null,date+ file.originalname)
    }
  })
  
  export const upload = multer({
    storage
  })