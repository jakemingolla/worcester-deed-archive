import { Logger } from "winston";
import { Screenshot } from "./screenshot";

export * from "./log";

export const screenshot = new Screenshot();

export type Core = {
  log: Logger,
  screenshot: Screenshot,
}
