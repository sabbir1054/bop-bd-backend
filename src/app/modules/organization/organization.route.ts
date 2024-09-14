import express, { NextFunction, Request, Response } from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { OrganizationValidation } from './organization.validation';
import { OrganizationController } from './organizations.controller';
import { FileUploadHelper } from '../../../helpers/fileUpload';
import config from '../../../config';
import path from 'path';
import fs from 'fs';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';
const router = express.Router();

router.get(
  '/dashboardMatrics',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  OrganizationController.getDashboardMatrics,
);

router.post(
  '/incomingOrderByDate',
  validateRequest(OrganizationValidation.getOrderByDate),
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  OrganizationController.getIncomingOrdersByDate,
);
router.post(
  '/outgoingOrderByDate',
  validateRequest(OrganizationValidation.getOrderByDate),
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  OrganizationController.getOutgoingOrdersByDate,
);

router.patch(
  '/updateOrganizationPhoto',
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
  FileUploadHelper.uploadOrganizationPhoto.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body?.data) {
      req.body =
        OrganizationValidation?.UpdateOrganizationNamePhotoValidation?.parse(
          JSON?.parse(req.body?.data),
        );
    }

    if (req.file) {
      req.body.photo = `${config.api_link_Image}/api/v1/organization/photo/${req.file.filename}`;
    }
    return OrganizationController.updateOrganization(req, res, next);
  },
);

router.get('/photo/:fileName', (req: Request, res: Response) => {
  const filePath = path.join(
    process.cwd(),
    'uploads/organizationPhoto',
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

export const OrganizationRoutes = router;
