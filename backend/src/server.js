const { port } = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');
const { startSlaJob } = require('./jobs/sla.job');

(async () => {
  await connectDB();
  startSlaJob();
  const server = app.listen(port, () => console.log(`RingFix API listening on :${port}`));

  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
})().catch((err) => {
  console.error('Startup failed:', err.message);
  process.exit(1);
});
