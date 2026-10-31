const cron = require('node-cron');
const { slaCron } = require('../config/env');
const { scanAndEscalate } = require('../services/sla.service');

function startSlaJob() {
  cron.schedule(slaCron, async () => {
    try {
      const result = await scanAndEscalate();
      if (result.flagged) console.log(`[sla] flagged=${result.flagged} escalated=${result.escalated}`);
    } catch (err) {
      console.error('[sla] scan failed:', err.message);
    }
  });
  console.log(`SLA job scheduled (${slaCron})`);
}

module.exports = { startSlaJob };
