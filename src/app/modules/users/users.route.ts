import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import config from '../../../config';
import { ENUM_USER_ROLE } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { FileUploadHelper } from '../../../helpers/fileUpload';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { UsersValidation } from './user.validation';
import { UserController } from './users.controller';
const router = express.Router();
router.get(
  '/getStaff',
  validateRequest(UsersValidation.getStaffValidation),
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.STAFF,
  ),
  UserController.getOrganizationStaff,
);
router.get(
  '/myDeliveryBoy',
  validateRequest(UsersValidation.getStaffValidation),
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.STAFF,
  ),
  UserController.getMyDeliveryBoy,
);
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
    ENUM_USER_ROLE.STAFF,
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
    ENUM_USER_ROLE.STAFF,
  ),
  UserController.getSingle,
);
router.get(
  '/',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserController.getAll,
);

router.get(
  '/profile/image/:fileName',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filePath = path.join(
        process.cwd(),
        'uploads/userPhoto',
        path.basename(req.params.fileName),
      );

      // Check if the file exists
      await fs.promises.access(filePath, fs.constants.F_OK);

      // Send the image file if it exists
      res.sendFile(filePath);
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        // File not found, return 404 error
        next(new ApiError(httpStatus.NOT_FOUND, 'Image not found'));
      } else {
        // Handle all other errors as 500 Internal Server Error
        next(
          new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            'An error occurred while processing your request',
          ),
        );
      }
    }
  },
);

router.delete('/deleteUnverified', UserController.deleteUnverifiedOtp);
router.post(
  '/update/status',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(UsersValidation.userVerifiedStatusChangeValidation),
  UserController.userVerifiedStatusChange,
);

//users/updateStaffRole
router.delete(
  '/deleteStaff/:staffId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  UserController.deleteMySingleStaff,
);

router.patch(
  '/updateStaffRole',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.WHOLESALER,
  ),

  validateRequest(UsersValidation.staffUpdateRoleValidation),
  UserController.updateMySingleStaffRole,
);
router.delete(
  '/removeUser/:userId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  UserController.deleteUser,
);
export const UsersRoutes = router;
