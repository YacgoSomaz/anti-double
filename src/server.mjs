import { loadLevel } from './level-loader.mjs';
import { createRealtimeServer } from './realtime-server.mjs';

const port = Number.parseInt(process.env.PORT ?? '9500', 10);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port');

const realtime = createRealtimeServer({ level: loadLevel(process.env.LEVEL ?? 'marathon') });
realtime.server.listen(port, process.env.HOST ?? '0.0.0.0', () => {
  console.log(`gswitch-online listening on ${port}`);
});
