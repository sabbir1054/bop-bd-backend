import ejs from 'ejs';
import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const generateInvoice = async (req: Request, res: any) => {
  const data = {
    orderNumber: '0472',
    orderDate: 'August 1, 2021',
    companyLogoUrl:
      'https://bopbd.com.bd/_next/image?url=%2Fassets%2Fbopbdlogo.png&w=128&q=75',
    companyWebsite: 'bopbd.com.bd',
    buyerLogoUrl:
      'https://bopbd.com.bd/_next/image?url=%2Fassets%2Fbopbdlogo.png&w=128&q=75',
    buyerName: 'Akij Group',
    sellerLogoUrl:
      'https://bopbd.com.bd/_next/image?url=%2Fassets%2Fbopbdlogo.png&w=128&q=75',
    sellerName: 'Pran Ltd',
    deliveryAddress:
      'Khagan, Dhaka District, Dhaka Division, Bangladesh, Dhaka Division',
    paymentMethod: 'BANK_TRANSACTION',
    bankName: 'Bank Ashia',
    accountNumber: '01268988798',
    items: [
      {
        name: 'Pixel Design System',
        description: 'Html components',
        price: '128.00',
        quantity: 1,
        total: '128.00',
      },
      {
        name: 'Volt Dashboard Template',
        description: 'Tailwind template',
        price: '69.00',
        quantity: 1,
        total: '69.00',
      },
      {
        name: 'Volt Dashboard Template',
        description: 'Tailwind template',
        price: '69.00',
        quantity: 1,
        total: '69.00',
      },
      {
        name: 'Volt Dashboard Template',
        description: 'Tailwind template',
        price: '69.00',
        quantity: 1,
        total: '69.00',
      },
      {
        name: 'Volt Dashboard Template',
        description: 'Tailwind template',
        price: '69.00',
        quantity: 1,
        total: '69.00',
      },
      {
        name: 'Volt Dashboard Template',
        description: 'Tailwind template',
        price: '69.00',
        quantity: 1,
        total: '69.00',
      },
      {
        name: 'Volt Dashboard Template',
        description: 'Tailwind template',
        price: '69.00',
        quantity: 1,
        total: '69.00',
      },
      {
        name: 'Volt Dashboard Template',
        description: 'Tailwind template',
        price: '69.00',
        quantity: 1,
        total: '69.00',
      },
      {
        name: 'Volt Dashboard Template',
        description: 'Tailwind template',
        price: '69.00',
        quantity: 1,
        total: '69.00',
      },
      {
        name: 'Volt Dashboard Template',
        description: 'Tailwind template',
        price: '69.00',
        quantity: 1,
        total: '69.00',
      },
      {
        name: 'Volt Dashboard Template',
        description: 'Tailwind template',
        price: '69.00',
        quantity: 1,
        total: '69.00',
      },
      {
        name: 'Volt Dashboard Template',
        description: 'Tailwind template',
        price: '69.00',
        quantity: 1,
        total: '69.00',
      },
      {
        name: 'Volt Dashboard Template',
        description: 'Tailwind template',
        price: '69.00',
        quantity: 1,
        total: '69.00',
      },
    ],
    subtotal: '415.00',
    deliveryFee: '50',
    total: '465.00',
    supportEmail: 'support@gmail.com',
    supportPhone: '012478963254',
  };

  try {
    // Render the EJS template to HTML
    const html = await ejs.renderFile(
      path.join(__dirname, 'views', 'invoice.ejs'),
      data,
    );

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({ headless: true });
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
    // Handle any error that occurs during the process
    console.error('Error generating invoice PDF:', error);

    if (!res.headersSent) {
      // Send error response if headers haven't been sent yet
      res.status(500).send('Error generating invoice PDF');
    }
  }
};

export const InvoiceServices = {
  generateInvoice,
};
