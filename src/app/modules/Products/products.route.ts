import express, { NextFunction, Request, Response } from 'express';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { FileUploadHelper } from '../../../helpers/fileUpload';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ProductController } from './products.controller';
import { ProductsValidation } from './products.validations';

const router = express.Router();
// Extend Request interface to include files property
interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}
router.post(
  '/createProduct',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.SELLER,
  ),
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

router.get('/:id', ProductController.getSingle);
router.get('/', ProductController.getAllProducts);

router.delete(
  '/deleteProductImage/:imageId/:productId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.SELLER,
  ),
  ProductController.deleteImageFromProduct,
);
router.patch(
  '/addImages/:productId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.SELLER,
  ),
  FileUploadHelper.upload.array('files', 5), // Ensure 'files' matches the field name used in the form
  async (req: Request, res: Response, next: NextFunction) => {
    const multerReq = req as MulterRequest;

    try {
      if (multerReq.files) {
        multerReq.body.fileUrls = multerReq.files.map(
          file => `/uploads/${file.filename}`,
        );
      }

      return await ProductController.addImageToProduct(multerReq, res, next);
    } catch (error) {
      return next(error); // Forward the error to the error handler
    }
  },
);

router.patch(
  '/infoUpdate/:productId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.SELLER,
  ),
  validateRequest(ProductsValidation.updateProductInfoValidation),
  ProductController.updateProductInfo,
);
export const ProductRoutes = router;
