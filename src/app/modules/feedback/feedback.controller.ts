import { Feedback } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FeedbackService } from './feedback.service';

const createNew = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.user as any;
  const result = await FeedbackService.createNew(id, role, req.body);
  sendResponse<Feedback>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedback added !',
    data: result,
  });
});
const getAll = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.user as any;
  const result = await FeedbackService.getAll(role, id);
  sendResponse<Feedback[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedback retrieve !',
    data: result,
  });
});
const getSingle = catchAsync(async (req: Request, res: Response) => {
  const { feedbackId } = req.params;
  const result = await FeedbackService.getSingle(feedbackId);
  sendResponse<Feedback>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedback retrieve !',
    data: result,
  });
});
const updateSingle = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.user as any;
  const { feedbackId } = req.params;

  const result = await FeedbackService.updateSingle(
    id,
    role,
    feedbackId,
    req.body,
  );
  sendResponse<Feedback>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Updated feedback !',
    data: result,
  });
});
const deleteSingle = catchAsync(async (req: Request, res: Response) => {
  const { id, role } = req.user as any;
  const { feedbackId } = req.params;

  const result = await FeedbackService.deleteSingle(id, role, feedbackId);
  sendResponse<Feedback>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Delete feedback !',
    data: result,
  });
});

export const FeedbackController = {
  createNew,
  getAll,
  getSingle,
  updateSingle,
  deleteSingle,
};
