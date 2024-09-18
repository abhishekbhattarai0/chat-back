import multer from "multer";


// export const upload = multer({dest:"uploads/profiles/"})
// export const upload = multer({
//   dest
// })


const date = Date.now()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/profiles/')
    },
    filename: function (req, file, cb) {
      cb(null,date+ file.originalname)
    }
  })
  
  export const upload = multer({
    storage
  })