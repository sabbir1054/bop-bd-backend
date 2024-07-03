import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import { ENUM_USER_ROLE } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { FileUploadHelper } from '../../../helpers/fileUpload';
import auth from '../../middlewares/auth';
import { UsersValidation } from './user.validation';
import { UserController } from './users.controller';
import config from '../../../config';
const router = express.Router();

router.patch(
  '/updateProfile',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  FileUploadHelper.uploadProfile.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body?.data) {
      req.body = UsersValidation?.updateUserProfileValidation?.parse(
        JSON?.parse(req.body?.data),
      );
    }

    if (req.file) {
      req.body.photo = `${config.api_link_Image}/api/v1/users/profile/image/${req.file.filename}`;
    }
    return UserController.updateUserProfile(req, res, next);
  },
);

router.delete(
  '/removeProfilePicture',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  UserController.removeProfilePicture,
);

router.get(
  '/:profileId',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  UserController.getSingle,
);
router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserController.getAll,
);

router.get('/profile/image/:fileName', (req: Request, res: Response) => {
  const filePath = path.join(
    process.cwd(),
    'uploads/userPhoto',
    path.basename(req.params.fileName),
  );
  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Image not found');
    }
    // Send the image file
    res.sendFile(filePath);
  });
});

router.delete('/deleteUnverified', UserController.deleteUnverifiedOtp);

export const UsersRoutes = router;
