import express from 'express';
import { InvoiceController } from './invoice.controller';

const router = express.Router();

router.get('/genarate', InvoiceController.genaretInvoice);

export const InvoceRoutes = router;
