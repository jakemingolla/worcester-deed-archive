import { access, mkdir } from "node:fs/promises";
import path from "path";
import { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { rimraf } from "rimraf";

import { Core } from "../core";

puppeteer.use(StealthPlugin());

export const init = async (
  core: Core,
  attempt: number,
): Promise<{ page: Page; browser: Browser }> => {
  const { log } = core;

  try {
    log.debug("Attempting to reset the ./screenshots directory.");
    await access("./screenshots");
    if (attempt === 1) {
      log.debug("Removing all *.png files in the ./screenshots directory.");
      await rimraf(path.join("./screenshots", "*.png"), { glob: true });
    }
  } catch (err) {
    log.debug("Creating a brand new ./screenshots directory.");
    await mkdir("./screenshots");
  }

  log.info("Launching puppeteer headless browser.");
  const browser = await puppeteer.launch({
    headless: "new",
  });

  log.debug("Creating a new page.");
  const page = await browser.newPage();

  log.debug("Setting screen size to 1080 x 1024.");
  await page.setViewport({ width: 1080, height: 1024 });

  return { page, browser };
};
