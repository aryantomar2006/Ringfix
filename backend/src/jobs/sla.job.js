import cron from 'node-cron';
import { slaCron } from '../config/env.js';
import { scanAndEscalate } from '../services/sla.service.js';

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

export { startSlaJob };
