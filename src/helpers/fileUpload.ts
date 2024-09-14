import fs from 'fs';
import multer from 'multer';

//multer
const storage = multer.diskStorage({
  //*For multiple upload ==> product
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
//* profile photo
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
//* category
const categoryPhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/categoryPhoto/');
  },
  filename: (req, file, cb) => {
    // Use a unique name for each file to avoid conflicts
    const uniqueSuffix = Date.now() + '--' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const uploadCategoryPhoto = multer({ storage: categoryPhotoStorage });

//* organization
const organizationPhotoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/organizationPhoto/');
  },
  filename: (req, file, cb) => {
    // Use a unique name for each file to avoid conflicts
    const uniqueSuffix = Date.now() + '--' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const uploadOrganizationPhoto = multer({ storage: organizationPhotoStorage });

export const FileUploadHelper = {
  upload,
  uploadProfile,
  uploadCategoryPhoto,
  uploadOrganizationPhoto,
};
