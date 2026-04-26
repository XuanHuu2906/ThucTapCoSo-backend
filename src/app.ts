import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsConfig } from './config/cors.js';
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import routes from './routes/index.js';

const app = express();

// Security middlewares
app.use(helmet());

// CORS configuration
app.use(cors(corsConfig));

// Rate limiting
app.use(rateLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/v1', routes);

// Global Error Handler - Must be the last middleware
app.use(errorHandler);

export default app;
