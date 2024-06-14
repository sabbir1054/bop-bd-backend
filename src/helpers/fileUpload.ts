import multer from 'multer';
import fs from 'fs';
import path from 'path';

//multer
const storage = multer.diskStorage({
  //   destination: function (req, file, cb) {
  //     cb(null, 'uploads/');
  //   },
  //*For multiple upload
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  //   filename: function (req, file, cb) {
  //     cb(null, file.originalname);
  //   },
  filename: (req, file, cb) => {
    // Use a unique name for each file to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

export const FileUploadHelper = {
  upload,
};
