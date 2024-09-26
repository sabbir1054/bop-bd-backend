import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { DeadlinePayCommissionController } from './deadlinePayCommission.controller';
import { DeadlinePayCommissionValidation } from './deadlinePayCommission.validation';

const router = express.Router();

router.post(
  '/create',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(
    DeadlinePayCommissionValidation.createDeadlinePaycommissionValidation,
  ),
  DeadlinePayCommissionController.create,
);
router.get('/', DeadlinePayCommissionController.getAll);
router.get('/:id', DeadlinePayCommissionController.getSingle);
router.patch(
  '/update/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(
    DeadlinePayCommissionValidation.updateDeadlinePaycommissionValidation,
  ),
  DeadlinePayCommissionController.updatedSingle,
);
router.delete(
  '/delete/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  DeadlinePayCommissionController.deleteSingle,
);

router.post(
  '/extendRequest',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  DeadlinePayCommissionController.extendDeadlineRequest,
);

export const DeadlinePayCommissionRoutes = router;
