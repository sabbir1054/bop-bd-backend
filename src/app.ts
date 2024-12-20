import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import path from 'path';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import { initializeCronJobs } from './app/modules/cron/cron.services';
import routes from './app/routes';
import { logger } from './shared/logger';
const app: Application = express();
// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Initialize cron jobs when the app starts
initializeCronJobs();
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://adminportal.bopbd.com.bd',
  'https://www.adminportal.bopbd.com.bd',
  'https://www.bopbd.com.bd',
  'https://www.bopbd.com',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
app.use(cookieParser());

//parser
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// test routes initial
app.get('/', async (req: Request, res: Response) => {
  res.send('Server is running !');
});

app.use('/api/v1', routes);

//global error handler
app.use(globalErrorHandler);
//! check request
app.use((req, res, next) => {
  logger.info(
    `Request from IP: ${req.ip}, User-Agent: ${req.headers['user-agent']}`,
  );
  next();
});
//handle not found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
  next();
});

export default app;
