import express from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { FeedbackController } from './feedback.controller';
import { FeedbackValidation } from './feedback.validation';

const router = express.Router();

router.post(
  '/create',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.SELLER,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  validateRequest(FeedbackValidation.createFeedbackValidation),
  FeedbackController.createNew,
);
router.get('/:feedbackId', FeedbackController.getSingle);
router.get(
  '/',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.SELLER,
    ENUM_USER_ROLE.WHOLESALER,
  ),
  FeedbackController.getAll,
);

export const FeedbackRoutes = router;
