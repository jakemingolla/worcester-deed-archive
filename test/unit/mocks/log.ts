// Enable this flag to allow the all logged methods to be visible during
// integration or unit tests.
const ENABLE_LOGGING = !!process.env.ENABLE_LOGGING;

export const mockLog = {
  debug: ENABLE_LOGGING ? jest.fn().mockImplementation(console.log) : jest.fn(),
  info: ENABLE_LOGGING ? jest.fn().mockImplementation(console.log) : jest.fn(),
  error: ENABLE_LOGGING ? jest.fn().mockImplementation(console.log) : jest.fn(),
};

jest.mock("winston", () => {
  return {
    createLogger: jest.fn().mockReturnValue(mockLog),
    transports: {
      Console: jest.fn(),
    },
    format: {
      combine: jest.fn(),
      timestamp: jest.fn(),
      json: jest.fn(),
    },
  };
});
