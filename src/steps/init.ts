import { access, mkdir } from "node:fs/promises";
import path from "path";
import { Browser, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { rimraf } from "rimraf";

import { config, log } from "../core";

export const init = async (
  attempt: number,
): Promise<{ page: Page; browser: Browser }> => {
  try {
    log.debug("Attempting to reset the ./screenshots directory.");
    await access("./screenshots");
    if (attempt === 1 && config.CLEAR_SCREENSHOTS) {
      log.debug("Removing all *.png files in the ./screenshots directory.");
      await rimraf(path.join("./screenshots", "*.png"), { glob: true });
    }
  } catch (err) {
    log.error(err);
    log.debug("Creating a brand new ./screenshots directory.");
    await mkdir("./screenshots");
  }

  log.info(`Launching puppeteer browser with HEADLESS=${config.HEADLESS}.`);
  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({
    headless: config.HEADLESS ? "new" : false,
    timeout: config.PUPPETEER_TIMEOUT_SECONDS * 1000,
    args: [ "--no-sandbox" ],
  });

  log.debug("Creating a new page.");
  const page = await browser.newPage();

  await page.setUserAgent(config.USER_AGENT);

  log.debug("Setting screen size to 1080 x 1024.");
  await page.setViewport({ width: 1080, height: 1024 });

  return { page, browser };
};
