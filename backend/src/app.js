import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env, clientUrls } from './config/env.js';
import { notFound, errorHandler } from './middleware/error.js';
import routes from './routes/index.js';

const app = express();

app.set('trust proxy', 1); // behind Vercel's proxy: needed for correct client IPs / rate limiting

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      // allow same-origin/no-origin (curl, health checks) and configured frontends
      if (!origin || clientUrls.includes(origin.replace(/\/$/, ''))) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
if (env !== 'test') app.use(morgan('dev'));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
