import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { BusinessTypeController } from './businessType.controller';
import { BusinessTypeZodValidation } from './businessType.validation';

const router = express.Router();

router.post(
  '/create',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(BusinessTypeZodValidation.createBusinessTypeValidation),
  BusinessTypeController.createNew,
);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(BusinessTypeZodValidation.updateBusinessTypeValidation),
  BusinessTypeController.updateSingle,
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  BusinessTypeController.deleteSingle,
);
router.get('/:id', BusinessTypeController.getSingle);
router.get('/', BusinessTypeController.getAll);

export const BusinessTypeRoutes = router;
