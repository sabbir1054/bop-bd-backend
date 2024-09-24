"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceServices = void 0;
const ejs_1 = __importDefault(require("ejs"));
const fs_1 = __importDefault(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const path_1 = __importDefault(require("path"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const generateInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const { orderId } = req.params;
    if (!orderId) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, 'Order id not found');
    }
    const isExistOrder = yield prisma_1.default.order.findUnique({
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
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'Order does not exist');
    }
    const data = {
        orderNumber: isExistOrder.orderCode ? isExistOrder.orderCode : '',
        orderDate: (isExistOrder === null || isExistOrder === void 0 ? void 0 : isExistOrder.createdAt.toISOString().split('T')[0])
            ? isExistOrder === null || isExistOrder === void 0 ? void 0 : isExistOrder.createdAt.toISOString().split('T')[0]
            : '',
        companyLogoUrl: 'https://bopbd.com.bd/_next/image?url=%2Fassets%2Fbopbdlogo.png&w=128&q=75',
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
        paymentMethod: ((_a = isExistOrder.orderPaymentInfo) === null || _a === void 0 ? void 0 : _a.paymentSystemOptions.paymentCategory)
            ? (_b = isExistOrder.orderPaymentInfo) === null || _b === void 0 ? void 0 : _b.paymentSystemOptions.paymentCategory
            : '',
        bankName: ((_c = isExistOrder.orderPaymentInfo) === null || _c === void 0 ? void 0 : _c.paymentSystemOptions.methodName)
            ? (_d = isExistOrder.orderPaymentInfo) === null || _d === void 0 ? void 0 : _d.paymentSystemOptions.methodName
            : '',
        accountNumber: ((_e = isExistOrder.orderPaymentInfo) === null || _e === void 0 ? void 0 : _e.paymentSystemOptions.accountNumber)
            ? (_f = isExistOrder.orderPaymentInfo) === null || _f === void 0 ? void 0 : _f.paymentSystemOptions.accountNumber
            : '',
        items: isExistOrder.orderItems,
        subtotal: isExistOrder.total ? isExistOrder.total : '',
        deliveryFee: isExistOrder.deliveryCharge ? isExistOrder.deliveryCharge : '',
        total: isExistOrder.totalWithDeliveryCharge
            ? isExistOrder.totalWithDeliveryCharge
            : '',
        supportEmail: 'support@bopbd.com.bd',
        supportPhone: '+8801969669908',
    };
    try {
        // Render the EJS template to HTML
        const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, 'views', 'invoice.ejs'), data);
        // Generate PDF using Puppeteer
        const browser = yield puppeteer_1.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = yield browser.newPage();
        yield page.setContent(html, { waitUntil: 'networkidle0' });
        const pdfPath = path_1.default.join(__dirname, 'docs', 'm.pdf');
        yield page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '10mm', right: '5mm', bottom: '10mm', left: '5mm' },
        });
        yield browser.close();
        //download pdf
        const pdfBuffer = fs_1.default.readFileSync(pdfPath);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=invoice.pdf',
            'Content-Length': pdfBuffer.length,
        });
        res.send(pdfBuffer);
        fs_1.default.unlink(pdfPath, err => {
            if (err) {
                console.error('Error deleting PDF file:', err);
            }
        });
    }
    catch (error) {
        console.error('Error generating invoice PDF:', error);
        if (!res.headersSent) {
            // Use ApiError for consistent error handling
            if (error instanceof ApiError_1.default) {
                res.status(error.statusCode).json({
                    message: error.message,
                });
            }
            else {
                // If it's an unknown error, send a generic error response
                res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
                    message: 'Error generating invoice PDF',
                });
            }
        }
    }
});
exports.InvoiceServices = {
    generateInvoice,
};
