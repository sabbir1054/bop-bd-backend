import { Feedback } from '@prisma/client';
import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { FeedbackService } from './feedback.service';

const createNew = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user as any;
  const result = await FeedbackService.createNew(id, req.body);
  sendResponse<Feedback>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feedback added !',
    data: result,
  });
});

export const FeedbackController = {
  createNew,
};
