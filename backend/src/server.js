// Local / traditional-host entry point. On Vercel, api/index.js is used instead.
import { port } from './config/env.js';
import connectDB from './config/db.js';
import app from './app.js';
import { startSlaJob } from './jobs/sla.job.js';

(async () => {
  await connectDB();
  startSlaJob(); // in-process cron (not used on Vercel; see vercel.json crons)
  const server = app.listen(port, () => console.log(`RingFix API listening on :${port}`));

  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})().catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
