import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.js';
import tripsRouter from './routes/trips.js';
import countriesRouter from './routes/countries.js';
import profileRouter from './routes/profile.js';
import adminRouter from './routes/admin.js';

const app = express();

// HSTS tells browsers to force HTTPS for this origin on future requests.
// Sending it over plain HTTP in dev can make the browser try to upgrade
// a later request to https://localhost and fail outright (no TLS listener
// there) — same reasoning as the cookie's secure flag being prod-only.
app.use(helmet({ hsts: process.env.NODE_ENV === 'production' }));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/countries', countriesRouter);
app.use('/api/profile', profileRouter);
app.use('/api/admin', adminRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status ?? 500;
  const error = err.publicError ?? 'internal_server_error';
  const body = { error };
  if (err.fields) body.fields = err.fields;
  res.status(status).json(body);
});

export default app;
