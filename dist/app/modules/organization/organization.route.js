"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const path_1 = __importDefault(require("path"));
const config_1 = __importDefault(require("../../../config"));
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const fileUpload_1 = require("../../../helpers/fileUpload");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const organization_validation_1 = require("./organization.validation");
const organizations_controller_1 = require("./organizations.controller");
const router = express_1.default.Router();
router.get('/dashboardMatrics', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER), organizations_controller_1.OrganizationController.getDashboardMatrics);
router.post('/incomingOrderByDate', (0, validateRequest_1.default)(organization_validation_1.OrganizationValidation.getOrderByDate), (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER), organizations_controller_1.OrganizationController.getIncomingOrdersByDate);
router.post('/outgoingOrderByDate', (0, validateRequest_1.default)(organization_validation_1.OrganizationValidation.getOrderByDate), (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.STAFF, user_1.ENUM_USER_ROLE.WHOLESALER), organizations_controller_1.OrganizationController.getOutgoingOrdersByDate);
router.patch('/updateOrganizationPhoto', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.STAFF), fileUpload_1.FileUploadHelper.uploadOrganizationPhoto.single('file'), (req, res, next) => {
    var _a, _b, _c;
    if ((_a = req.body) === null || _a === void 0 ? void 0 : _a.data) {
        req.body =
            (_b = organization_validation_1.OrganizationValidation === null || organization_validation_1.OrganizationValidation === void 0 ? void 0 : organization_validation_1.OrganizationValidation.UpdateOrganizationNamePhotoValidation) === null || _b === void 0 ? void 0 : _b.parse(JSON === null || JSON === void 0 ? void 0 : JSON.parse((_c = req.body) === null || _c === void 0 ? void 0 : _c.data));
    }
    if (req.file) {
        req.body.photo = `${config_1.default.api_link_Image}/api/v1/organization/photo/${req.file.filename}`;
    }
    return organizations_controller_1.OrganizationController.updateOrganization(req, res, next);
});
router.get('/photo/:fileName', (req, res) => {
    const filePath = path_1.default.join(process.cwd(), 'uploads/organizationPhoto', path_1.default.basename(req.params.fileName));
    // Check if the file exists
    fs_1.default.access(filePath, fs_1.default.constants.F_OK, err => {
        if (err) {
            throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Image not found');
        }
        // Send the image file
        res.sendFile(filePath);
    });
});
router.delete('/removePicture', (0, auth_1.default)(user_1.ENUM_USER_ROLE.DEALER, user_1.ENUM_USER_ROLE.IMPORTER, user_1.ENUM_USER_ROLE.MANUFACTURER, user_1.ENUM_USER_ROLE.RESELLER, user_1.ENUM_USER_ROLE.WHOLESALER, user_1.ENUM_USER_ROLE.STAFF), organizations_controller_1.OrganizationController.removePicture);
router.patch('/changeMembershipCategory', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), (0, validateRequest_1.default)(organization_validation_1.OrganizationValidation.UpdateOrganizationMembership), organizations_controller_1.OrganizationController.updateOrganizationMembershipCategory);
router.patch('/suspend/:id', (0, auth_1.default)(user_1.ENUM_USER_ROLE.ADMIN, user_1.ENUM_USER_ROLE.SUPER_ADMIN), organizations_controller_1.OrganizationController.suspendOrganization);
exports.OrganizationRoutes = router;
