// Enable this flag to allow the all logged methods to be visible during
// integration or unit tests.

import { mock } from "bun:test";

const ENABLE_LOGGING = !!process.env.ENABLE_LOGGING;

export const mockLog = {
  debug: ENABLE_LOGGING ? mock(console.log) : mock(() => {}),
  info: ENABLE_LOGGING ? mock(console.log) : mock(() => {}),
  error: ENABLE_LOGGING ? mock(console.log) : mock(() => {}),
};
