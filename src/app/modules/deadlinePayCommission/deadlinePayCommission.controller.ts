import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { DeadlinePayCommissionServices } from './deadlinePayCommission.service';

const create = catchAsync(async (req: Request, res: Response) => {
  const result = await DeadlinePayCommissionServices.createNew(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deadline created created',
    data: result,
  });
});
const getAll = catchAsync(async (req: Request, res: Response) => {
  const result = await DeadlinePayCommissionServices.getAll();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deadline retrieve',
    data: result,
  });
});
const updatedSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DeadlinePayCommissionServices.updateSingle(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deadline updated',
    data: result,
  });
});
const deleteSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DeadlinePayCommissionServices.deleteSingle(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deadline deleted',
    data: result,
  });
});
const getSingle = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DeadlinePayCommissionServices.getSingle(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Deadline retrieve',
    data: result,
  });
});
const extendDeadlineRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { id, role } = req.user as any;
    const result = await DeadlinePayCommissionServices.extendDeadlineRequest(
      id,
      role,
      req.body.comment,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Deadline extend request sent',
      data: result,
    });
  },
);
const handleDeadlineRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { requestId } = req.params;
    const result = await DeadlinePayCommissionServices.handleDeadlineRequest(
      requestId,
      req.body,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Handle deadline extend request sent',
      data: result,
    });
  },
);
const updateMyRequest = catchAsync(async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { id, role } = req.user as any;
  const result = await DeadlinePayCommissionServices.updateMyRequest(
    id,
    role,
    requestId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Updated request',
    data: result,
  });
});
const getAllDeadlineExtendRequest = catchAsync(
  async (req: Request, res: Response) => {
    const { id, role } = req.user as any;
    const result =
      await DeadlinePayCommissionServices.getAllDeadlineExtendRequest(id, role);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Request retrieve',
      data: result,
    });
  },
);
const getSingleRequest = catchAsync(async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { id, role } = req.user as any;
  const result = await DeadlinePayCommissionServices.getSingleRequest(
    id,
    role,
    requestId,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Request retrieve',
    data: result,
  });
});

export const DeadlinePayCommissionController = {
  create,
  getAll,
  updatedSingle,
  deleteSingle,
  getSingle,
  extendDeadlineRequest,
  handleDeadlineRequest,
  updateMyRequest,
  getAllDeadlineExtendRequest,
  getSingleRequest,
};
