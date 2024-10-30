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
router.post(
  '/refreshToken',
  validateRequest(AuthValidation.refreshTokenZodSchema),
  AuthController.refreshToken,
);
router.post('/verifyOtp', AuthController.verifyOtp);
router.post('/resendOtp', AuthController.resendOtp);
router.post('/forgetPassword/sendOtp', AuthController.forgetPasswordOtp);
router.post(
  '/forgetPassword/resendOtp',
  AuthController.resendForgetpasswordOtp,
);
router.post(
  '/forgetPassword/verifyOtp',
  AuthController.verifyForgotPasswordOtp,
);
router.patch('/updatePassword', AuthController.updatePassword);
export const AuthRoutes = router;
