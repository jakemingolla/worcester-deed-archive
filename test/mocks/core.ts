import { mockLog } from "./log";
import { mockScreenshot } from "./screenshot";
import { Logger } from "winston";
import { Screenshot } from "../../src/core/screenshot";

export const mockCore = {
  log: mockLog as unknown as Logger,
  screenshot: mockScreenshot as unknown as Screenshot,
};
