export const mockScreenshot = {
  record: jest.fn(),
};

jest.mock("../../../src/core/screenshot", () => mockScreenshot);
