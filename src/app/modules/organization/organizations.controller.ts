import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { OrganizaionServices } from './organization.service';
import pick from '../../../shared/pick';
import { organizationFilterableFields } from './organization.constant';
import { paginationFields } from '../../../constants/paginationFields';

const getDashboardMatrics = catchAsync(async (req: Request, res: Response) => {
  const { id: userId, role } = req.user as any;

  const result = await OrganizaionServices.getDashboardMatrics(userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Dashboard all matrics ',
    data: result,
  });
});
const getOutgoingOrdersByDate = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId, role } = req.user as any;

    const result = await OrganizaionServices.getOutgoingOrdersByDate(
      userId,
      role,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order info retrieve ',
      data: result,
    });
  },
);
const getIncomingOrdersByDate = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId, role } = req.user as any;

    const result = await OrganizaionServices.getIncomingOrdersByDate(
      userId,
      role,
      req.body,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Order info retrieve ',
      data: result,
    });
  },
);

const updateOrganization = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await OrganizaionServices.updateOrganization(req, next);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Organization updated ',
      data: result,
    });
  },
);
const updateOrganizationMembershipCategory = catchAsync(
  async (req: Request, res: Response) => {
    const result =
      await OrganizaionServices.updateOrganizationMembershipCategory(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Organization updated ',
      data: result,
    });
  },
);
const removePicture = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, role } = req.user as any;
    const result = await OrganizaionServices.removePicture(id, role, next);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Organization photo remove ',
      data: result,
    });
  },
);
const suspendOrganization = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await OrganizaionServices.suspendOrganization(id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Organization suspended ',
      data: result,
    });
  },
);

const getAllOrganization = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, organizationFilterableFields);
  const options = pick(req.query, paginationFields);
  const result = await OrganizaionServices.getAllOrganization(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization retrieve successfully !!',
    meta: result.meta,
    data: result.data,
  });
});
const getSingle = catchAsync(async (req: Request, res: Response) => {
  const result = await OrganizaionServices.getSingleOrganization(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Organization retrieve ',
    data: result,
  });
});
export const OrganizationController = {
  getDashboardMatrics,
  getOutgoingOrdersByDate,
  getIncomingOrdersByDate,
  updateOrganization,
  removePicture,
  updateOrganizationMembershipCategory,
  suspendOrganization,
  getSingle,
  getAllOrganization,
};
