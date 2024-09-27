import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../../errors/ApiError';
import prisma from '../../shared/prisma';

export const checkSuspension = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { id, role } = req.user as any;
  try {
    if (role === 'STAFF') {
      const staffInf = await prisma.staff.findUnique({
        where: { staffInfoId: id },
        include: {
          organization: true,
        },
      });

      if (!staffInf) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Staff info not found');
      }
      if (staffInf.organization?.isSuspend === true) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'Your organization accound is suspend',
        );
      }
    } else {
      const userInfo = await prisma.user.findUnique({
        where: { id },
        include: {
          organization: true,
        },
      });
      if (!userInfo) {
        throw new ApiError(httpStatus.NOT_FOUND, 'User info not found');
      }

      if (userInfo.organization?.isSuspend === true) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          'Your organization accound is suspend',
        );
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
