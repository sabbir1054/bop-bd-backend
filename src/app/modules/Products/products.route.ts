import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import config from '../../../config';
import { ENUM_USER_ROLE } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { FileUploadHelper } from '../../../helpers/fileUpload';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ProductController } from './products.controller';
import { ProductsValidation } from './products.validations';
import { checkSuspension } from '../../middlewares/organizationSuspenCheck';
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
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
  ),
  checkSuspension,
  FileUploadHelper.upload.array('files', 5),
  (req: Request, res: Response, next: NextFunction) => {
    const multerReq = req as MulterRequest;
    multerReq.body = ProductsValidation.createProductValidation.parse(
      JSON.parse(multerReq.body.data),
    );
    if (multerReq.files) {
      multerReq.body.fileUrls = multerReq.files.map(
        file =>
          `${config.api_link_Image}/api/v1/products/image/${file.filename}`,
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
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
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
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
  ),
  FileUploadHelper.upload.array('files', 5), // Ensure 'files' matches the field name used in the form
  async (req: Request, res: Response, next: NextFunction) => {
    const multerReq = req as MulterRequest;

    try {
      if (multerReq.files) {
        multerReq.body.fileUrls = multerReq.files.map(
          file =>
            `${config.api_link_Image}/api/v1/products/image/${file.filename}`,
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
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
  ),
  validateRequest(ProductsValidation.updateProductInfoValidation),
  ProductController.updateProductInfo,
);

router.delete(
  '/:productId',
  auth(
    ENUM_USER_ROLE.DEALER,
    ENUM_USER_ROLE.IMPORTER,
    ENUM_USER_ROLE.MANUFACTURER,
    ENUM_USER_ROLE.WHOLESALER,
    ENUM_USER_ROLE.RESELLER,
    ENUM_USER_ROLE.STAFF,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN,
  ),
  ProductController.deleteProduct,
);

router.get('/image/:fileName', async (req: Request, res: Response) => {
  const filePath = await path.join(
    process.cwd(),
    'uploads',
    path.basename(req.params.fileName),
  );
  // Check if the file exists
  await fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Image not found');
    }
    // Send the image file
    res.sendFile(filePath);
  });
});
export const ProductRoutes = router;
