import path from "path";
import { Page } from "puppeteer";

import { log } from "./log";

export class Screenshot {
  // The counter is used to increment the screenshot filenames.
  // It is incremented every time a screenshot is recorded.
  private count: number;
  constructor() {
    this.count = 0;
  }

  /**
   * Records a screenshot of the current state of the given page.
   * The screenshot will be saved in the configured screenshot path,
   * using a combination of the given name and an incremented counter.
   *
   * @param page The Puppeteer page to use.
   * @param name The name to use for the screenshot.
   */
  async record(page: Page, name: string): Promise<void> {
    const filename = String(this.count).padStart(2, "0") + "-" + name + ".png";
    log.info(`Recording current state in screenshot ${filename}`);
    await page.screenshot({
      path: path.join("./screenshots", filename),
      type: "png",
    });
    this.count += 1;
  }
}

export const screenshot = new Screenshot();
