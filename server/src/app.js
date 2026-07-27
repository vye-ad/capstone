import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(helmet());
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
