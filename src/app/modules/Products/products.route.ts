import express, { NextFunction, Request, Response } from 'express';
import { FileUploadHelper } from '../../../helpers/fileUpload';
import { ProductController } from './products.controller';
import { ProductsValidation } from './products.validations';

const router = express.Router();
// Extend Request interface to include files property
interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}
router.post(
  '/createProduct',
  FileUploadHelper.upload.array('files', 5),
  (req: Request, res: Response, next: NextFunction) => {
    const multerReq = req as MulterRequest;
    multerReq.body = ProductsValidation.createProductValidation.parse(
      JSON.parse(multerReq.body.data),
    );
    if (multerReq.files) {
      multerReq.body.fileUrls = multerReq.files.map(
        file => `/uploads/${file.filename}`,
      );
    }
    return ProductController.createProduct(multerReq, res, next);
  },
);

export const ProductRoutes = router;
