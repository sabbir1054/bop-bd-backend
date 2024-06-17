"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadHelper = void 0;
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
//multer
const storage = multer_1.default.diskStorage({
    //*For multiple upload
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Use a unique name for each file to avoid conflicts
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
const profilePhotoStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/userPhoto/');
    },
    filename: (req, file, cb) => {
        // Use a unique name for each file to avoid conflicts
        const uniqueSuffix = Date.now() + '--' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    },
});
const uploadProfile = (0, multer_1.default)({ storage: profilePhotoStorage });
exports.FileUploadHelper = {
    upload,
    uploadProfile,
};
