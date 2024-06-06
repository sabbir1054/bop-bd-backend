import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { AuthValidation } from './auth.validation';

const router = express.Router();

router.post(
  '/signup',
  validateRequest(AuthValidation.userRegistrationValidation),
  AuthController.userRegistration,
);

router.post(
  '/signin',
  validateRequest(AuthValidation.userLoginValidation),
  AuthController.userLogin,
);

export const AuthRoutes = router;
