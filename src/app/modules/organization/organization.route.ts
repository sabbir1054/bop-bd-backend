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
import { OrganizationValidation } from './organization.validation';
import { OrganizationController } from './organizations.controller';
const router = express.Router();

router.get(
  '/dashboardMatrics/:orgId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
  ),
  OrganizationController.getDashboardMatrics,
);
router.patch(
  '/updateOrgTypeRole/:orgId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  OrganizationController.updateOranizationBusinessType,
);
router.patch(
  '/updateSuspendStatus/:orgId',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  OrganizationController.manualSuspendStatusUpdate,
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
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
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

router.get(
  '/photo/:fileName',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filePath = path.join(
        process.cwd(),
        'uploads/organizationPhoto',
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

router.delete(
  '/removePicture',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.STAFF,
  ),
  OrganizationController.removePicture,
);
router.patch(
  '/changeMembershipCategory',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(OrganizationValidation.UpdateOrganizationMembership),
  OrganizationController.updateOrganizationMembershipCategory,
);
router.patch(
  '/suspend/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  OrganizationController.suspendOrganization,
);

router.get(
  '/',
  auth(
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.STAFF,
  ),
  OrganizationController.getAllOrganization,
);
router.get(
  '/pendingCommissionList',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  OrganizationController.getOrganizationsWithPendingCommissions,
);
router.get(
  '/organizationProfile/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  OrganizationController.getSingle,
);

export const OrganizationRoutes = router;
