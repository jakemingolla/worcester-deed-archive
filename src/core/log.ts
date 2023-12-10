import { createLogger, format, transports } from "winston";

import { config } from "./config";

const { combine, timestamp, json } = format;

export const log = createLogger({
  level: config.LOG_LEVEL || "debug",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    json(),
  ),
  transports: [new transports.Console()],
});
