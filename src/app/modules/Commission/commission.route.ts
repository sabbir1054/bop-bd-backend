import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CommissionController } from './commission.controller';
import { CommissionZodValidation } from './commission.validation';

const router = express.Router();

router.post(
  '/create',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(CommissionZodValidation.commissionCreateValidation),
  CommissionController.createNew,
);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(CommissionZodValidation.commissionUpdateValidation),
  CommissionController.updateSingle,
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  CommissionController.deleteSingle,
);

router.get('/:id', CommissionController.getSingle);
router.get('/', CommissionController.getAll);

export const CommissionRoutes = router;
