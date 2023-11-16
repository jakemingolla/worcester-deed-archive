const mockAccess = jest.fn();
const mockMkdir = jest.fn();
jest.mock("node:fs/promises", () => {
  return {
    access: mockAccess,
    mkdir: mockMkdir,
  };
});

const mockRimraf = jest.fn();
jest.mock("rimraf", () => {
  return { rimraf: mockRimraf };
});

const mockPage = { setViewport: jest.fn() };

const mockBrowser = {
  newPage: jest.fn().mockResolvedValue(mockPage),
};

const mockLaunch = jest.fn().mockReturnValue(mockBrowser);

jest.mock("puppeteer-extra", () => {
  return { launch: mockLaunch, use: jest.fn() };
});

import { init } from "../../../src/steps/init";

describe("steps/init", () => {
  it("resets the screenshot directory if existing files on first attempt", async () => {
    mockAccess.mockResolvedValueOnce("not-throwing-error");

    await init(1);

    expect(mockMkdir).toHaveBeenCalledTimes(0);
    expect(mockAccess).toHaveBeenCalledWith(
      expect.stringContaining("./screenshots"),
    );
    expect(mockRimraf).toHaveBeenCalledTimes(1);
  });

  it("does not reset the screenshot directory on subsequent attempts", async () => {
    mockAccess.mockResolvedValueOnce("not-throwing-error");

    await init(2);

    expect(mockMkdir).toHaveBeenCalledTimes(0);
    expect(mockRimraf).toHaveBeenCalledTimes(0);
  });

  it("creates the screenshots directory if not found", async () => {
    mockAccess.mockRejectedValueOnce(new Error());

    await init(1);

    expect(mockMkdir).toHaveBeenCalledWith(
      expect.stringContaining("./screenshots"),
    );
    expect(mockRimraf).toHaveBeenCalledTimes(0);
  });

  it("launches a headless browser and uses a reasonably sized page", async () => {
    const { browser, page } = await init(1);

    expect(mockLaunch).toHaveBeenCalledTimes(1);
    expect(mockLaunch).toHaveBeenCalledWith({ headless: "new" });

    expect(mockPage.setViewport).toHaveBeenCalledWith({
      width: 1080,
      height: 1024,
    });

    expect(browser).toMatchObject(mockBrowser);
    expect(page).toMatchObject(mockPage);
  });
});
