import express from 'express';
import { PayCommissionController } from './payCommission.controller';

const router = express.Router();

router.post('/createPayment', PayCommissionController.createPayment);
router.post('/executePayment', PayCommissionController.executePaymentHit);

export const PayCommissionRoutes = router;

//01782066094
//15711
//5597
