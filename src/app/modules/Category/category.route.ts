import express, { NextFunction, Request, Response } from 'express';
import config from '../../../config';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { FileUploadHelper } from '../../../helpers/fileUpload';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryController } from './category.controller';
import { CategoryZodValidation } from './category.validation';
const router = express.Router();
interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}
/* router.post(
  '/create',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(CategoryZodValidation.createCategoryValidation),
  CategoryController.createNew,
);
 */
router.post(
  '/create',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  FileUploadHelper.uploadCategoryPhoto.single('file'),
  (req: Request, res: Response, next: NextFunction) => {
    const multerReq = req as MulterRequest;
    multerReq.body = CategoryZodValidation.createCategoryValidation.parse(
      JSON.parse(multerReq.body.data),
    );
    if (multerReq.file) {
      multerReq.body.photo = `${config.api_link_Image}/api/v1/category/image/${multerReq.file.filename}`;
    }
    return CategoryController.createNew(multerReq, res, next);
  },
);

router.patch(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  validateRequest(CategoryZodValidation.updateCategoryValidation),
  CategoryController.updateSingle,
);
router.delete(
  '/:id',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  CategoryController.deleteSingle,
);
router.get('/:id', CategoryController.getSingle);
router.get('/', CategoryController.getAll);

export const CategoryRoutes = router;
