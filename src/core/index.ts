import { Logger } from "winston";

import { Screenshot } from "./screenshot";

export * from "./log";
export * from "./screenshot";

export type Core = {
  log: Logger;
  screenshot: Screenshot;
};
