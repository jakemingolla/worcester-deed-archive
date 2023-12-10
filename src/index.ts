import { stringify } from "csv-stringify/sync";
import dayjs, { type Dayjs } from "dayjs";

import { log, screenshot } from "./core/index.ts";
import { countResults } from "./steps/count-results.ts";
import { getRow } from "./steps/get-row.ts";
import { goToNextPage } from "./steps/go-to-next-page.ts";
import { init } from "./steps/init.ts";
import { setSearchCriteria } from "./steps/set-search-criteria.ts";

export const main = async (start: Dayjs, end: Dayjs): Promise<string> => {
  log.info(`Beginning run from ${start.format()} -> ${end.format()}.`);

  const { browser, page } = await init(1);

  try {
    await page.goto("https://www.masslandrecords.com/worcester/");

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
      // TODO config extra sleep?

      data.push(await getRow(page));

      if (i % 20 === 0 || i % 20 === 19) {
        await screenshot.record(page, `after-${i}`);
      }

      if (i % 20 === 19 && i + 1 < count) {
        await goToNextPage(page, i);
        await Bun.sleep(5 * 1000);
        // TODO config extra sleep?
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
  const start = dayjs("2023-11-20");
  const end = dayjs("2023-11-21");
  main(start, end)
    .then((output) => {
      console.log(output);
      process.exit(0);
    })
    .catch((err) => {
      log.error((err as Error).stack);
      return process.exit(1);
    });
}
