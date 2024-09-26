import ejs from 'ejs';
import { Request } from 'express';
import fs from 'fs';
import httpStatus from 'http-status';
import path from 'path';
import puppeteer from 'puppeteer';
import ApiError from '../../../errors/ApiError';
import prisma from '../../../shared/prisma';

const generateInvoice = async (req: Request, res: any) => {
  const { orderId } = req.params;
  if (!orderId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Order id not found');
  }
  const isExistOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      product_seller: true,
      orderPaymentInfo: {
        include: {
          paymentSystemOptions: true,
        },
      },
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!isExistOrder) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Order does not exist');
  }
  const data = {
    orderNumber: isExistOrder.orderCode ? isExistOrder.orderCode : '',
    orderDate: isExistOrder?.createdAt.toISOString().split('T')[0]
      ? isExistOrder?.createdAt.toISOString().split('T')[0]
      : '',
    companyLogoUrl:
      'https://bopbd.com.bd/_next/image?url=%2Fassets%2Fbopbdlogo.png&w=128&q=75',
    companyWebsite: 'bopbd.com.bd',
    buyerLogoUrl: isExistOrder.customer.photo
      ? isExistOrder.customer.photo
      : '',
    buyerName: isExistOrder.customer.name ? isExistOrder.customer.name : '',
    sellerLogoUrl: isExistOrder.product_seller.photo
      ? isExistOrder.product_seller.photo
      : '',
    sellerName: isExistOrder.product_seller.name
      ? isExistOrder.product_seller.name
      : '',
    deliveryAddress: isExistOrder.shipping_address
      ? isExistOrder.shipping_address
      : '',
    paymentMethod: isExistOrder.orderPaymentInfo?.paymentSystemOptions
      .paymentCategory
      ? isExistOrder.orderPaymentInfo?.paymentSystemOptions.paymentCategory
      : '',
    bankName: isExistOrder.orderPaymentInfo?.paymentSystemOptions.methodName
      ? isExistOrder.orderPaymentInfo?.paymentSystemOptions.methodName
      : '',
    accountNumber: isExistOrder.orderPaymentInfo?.paymentSystemOptions
      .accountNumber
      ? isExistOrder.orderPaymentInfo?.paymentSystemOptions.accountNumber
      : '',
    items: isExistOrder.orderItems,
    subtotal: isExistOrder.total ? isExistOrder.total : '',
    deliveryFee: isExistOrder.deliveryCharge ? isExistOrder.deliveryCharge : '',
    total: isExistOrder.totalWithDeliveryChargeAndDiscount
      ? isExistOrder.totalWithDeliveryChargeAndDiscount
      : '',
    supportEmail: 'support@bopbd.com.bd',
    supportPhone: '+8801969669908',
  };

  try {
    // Render the EJS template to HTML
    const html = await ejs.renderFile(
      path.join(__dirname, 'views', 'invoice.ejs'),
      data,
    );

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfPath = path.join(__dirname, 'docs', 'm.pdf');
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', right: '5mm', bottom: '10mm', left: '5mm' },
    });

    await browser.close();
    //download pdf
    const pdfBuffer = fs.readFileSync(pdfPath);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
      'Content-Length': pdfBuffer.length,
    });

    res.send(pdfBuffer);

    fs.unlink(pdfPath, err => {
      if (err) {
        console.error('Error deleting PDF file:', err);
      }
    });
  } catch (error) {
    console.error('Error generating invoice PDF:', error);

    if (!res.headersSent) {
      // Use ApiError for consistent error handling
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          message: error.message,
        });
      } else {
        // If it's an unknown error, send a generic error response
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Error generating invoice PDF',
        });
      }
    }
  }
};

export const InvoiceServices = {
  generateInvoice,
};
