import fs from 'fs';
import multer from 'multer';

//multer
const storage = multer.diskStorage({
  //*For multiple upload
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    // Use a unique name for each file to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

const profilePhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/userPhoto/');
  },
  filename: (req, file, cb) => {
    // Use a unique name for each file to avoid conflicts
    const uniqueSuffix = Date.now() + '--' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const uploadProfile = multer({ storage: profilePhotoStorage });

export const FileUploadHelper = {
  upload,
  uploadProfile,
};
