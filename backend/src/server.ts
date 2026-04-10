import { createApp } from "./app.js";
import { APP_DISPLAY_NAME } from "./config/app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`${APP_DISPLAY_NAME} — API http://localhost:${env.port}`);
});
