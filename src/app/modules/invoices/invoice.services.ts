import ejs from 'ejs';
import { Request } from 'express';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const generateInvoice = async (req: Request, res: any) => {
  const data = {
    invoiceNumber: '0472',
    invoiceDate: 'August 1, 2021',
    buyer: {
      name: 'LOUISVILLE, Selby',
      address: '3864 Johnson Street',
      country: 'United States of America',
      vatCode: 'AA-1234567890',
    },
    seller: {
      name: 'Themesberg Inc.',
      address: '291 N 4th St, San Jose, CA 95112',
      country: 'USA',
    },
    items: [
      {
        name: 'Pixel Design System',
        description: 'Html components',
        price: 128.0,
        quantity: 1,
        total: 64.0,
      },
      {
        name: 'Volt Dashboard Template',
        description: 'Tailwind template',
        price: 69.0,
        quantity: 1,
        total: 69.0,
      },
      {
        name: 'Neumorphism UI',
        description: 'Html template',
        price: 69.0,
        quantity: 1,
        total: 69.0,
      },
      {
        name: 'Glassmorphism UI',
        description: 'Figma template',
        price: 149.0,
        quantity: 1,
        total: 149.0,
      },
    ],
    subtotal: 415.0,
    deliveryFee: 50.0,
    total: 351.0,
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
      margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
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
      } else {
        console.log('PDF file deleted successfully.');
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
