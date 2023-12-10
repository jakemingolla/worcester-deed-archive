import { stringify } from "csv-stringify/sync";

import { config, log, screenshot } from "./core/index.ts";
import { countResults } from "./steps/count-results.ts";
import { getRow } from "./steps/get-row.ts";
import { goToNextPage } from "./steps/go-to-next-page.ts";
import { init } from "./steps/init.ts";
import { setSearchCriteria } from "./steps/set-search-criteria.ts";
import { validateTimeRange } from "./steps/validate-time-range.ts";

export const main = async (
  startInput: string,
  endInput: string,
): Promise<string> => {
  const { start, end } = validateTimeRange(startInput, endInput);
  log.info(
    `Beginning run at ${
      config.BASE_URL
    } from ${start.format()} -> ${end.format()}.`,
  );

  const { browser, page } = await init(1);

  try {
    await page.goto(config.BASE_URL);

    await page.waitForFunction(() => typeof __doPostBack !== "undefined");
    await screenshot.record(page, "after-do-post-back");

    await setSearchCriteria(page, start, end);
    await screenshot.record(page, "after-search-criteria");
    await page.click("#SearchFormEx1_btnSearch");

    const count = await countResults(page);
    await screenshot.record(page, "after-count");
    log.info(`Successfully found ${count} results.`);

    const headers = [
      [
        // General details
        "Doc #",
        "Rec Date",
        "Rec Time",
        "Type Desc.",
        "# of Pages",
        "Book/Page",
        "Consideration",
        "Court Case #",
        // Property details
        "Street #",
        "Street Name",
        "Description",
        // TODO grantees?
      ],
    ];
    const data = [];

    // TODO config page size
    for (let i = 0; i < count; i++) {
      const fn = `DocList1$GridView_Document$ctl${((i % 20) + 2)
        .toString()
        .padStart(2, "0")}$ButtonRow_Rec. Date_${i % 20}`;
      await page.evaluate((fn) => {
        return __doPostBack(fn, "");
      }, fn);

      const id = `DocList1_GridView_Document_ctl${((i % 20) + 2)
        .toString()
        .padStart(2, "0")}_ButtonRow_Rec. Date_${i % 20}`;
      await page.waitForXPath(
        `//*[@id="${id}"]/ancestor::tr[@class="DataGridSelectedRow"]`,
      );

      data.push(await getRow(page));
      await Bun.sleep(config.AFTER_EACH_ROW_DELAY_SECONDS * 1000);

      if (i % 20 === 0 || i % 20 === 19) {
        await screenshot.record(page, `after-${i}`);
      }

      if (i % 20 === 19 && i + 1 < count) {
        await goToNextPage(page, i);
        await Bun.sleep(config.AFTER_EACH_PAGE_DELAY_SECONDS * 1000);
      }
      log.debug(`Successfully processed i = ${i} of ${count} results.`);
    }

    return stringify(headers.concat(data));
  } catch (err) {
    console.log(err);
    await screenshot.record(page, "error-received");
    throw err;
  } finally {
    await browser.close();
  }
};

if (import.meta.main) {
  main(config.START_DATE, config.END_DATE)
    .then((output) => {
      console.log(output);
      return Bun.write(config.OUTPUT_FILE, output);
    })
    .then(() => process.exit(0))
    .catch((err) => {
      log.error((err as Error).stack);
      return process.exit(1);
    });
}
