import { stringify } from "csv-stringify/sync";
import dayjs, { type Dayjs } from "dayjs";

import { log, screenshot } from "./core/index.ts";
import { countResults } from "./steps/count-results.ts";
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
        "Doc #",
        "Rec Date",
        "Rec Time",
        "Type Desc.",
        "# of Pages",
        "Book/Page",
        "Consideration",
        "Court Case #",
      ],
    ];
    const data = [];

    for (let i = 0; i < count; i++) {
      const fn = `DocList1$GridView_Document$ctl${((i % 20) + 2)
        .toString()
        .padStart(2, "0")}$ButtonRow_Rec. Date_${i % 20}`;

      await page.evaluate((fn) => {
        return __doPostBack(fn, "");
      }, fn);

      const details = await page.waitForSelector("#DocDetails1_Panel_Details");
      if (!details) {
        throw new Error("TODO");
      }
      const tds = await details.$$("td");
      const values = await Promise.all(
        tds.map((td) => td.evaluate((el: HTMLInputElement) => el.innerText)),
      );
      data.push(values.map((value) => value.replace("\u00a0", "")));

      await Bun.sleep(1000);
      if (i % 20 === 0) {
        await screenshot.record(page, `after-${i}`);
      }

      if (i % 20 === 19 && i < count - 1) {
        await page.click("#DocList1_LinkButtonNext");
        await page.waitForNetworkIdle();
        await Bun.sleep(3000);
      }
    }

    const output = stringify(headers.concat(data));
    return output;
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
