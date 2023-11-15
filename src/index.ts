import { stringify } from "csv-stringify/sync";
import dayjs, { type Dayjs } from "dayjs";

import { Core, log, screenshot } from "./core/index.ts";
import { init } from "./steps/init.ts";

// TODO
const __doPostBack = (...args: string[]) => {
  void args;
};

// TODO
type HTMLInputElement = {
  value: string;
  innerText: string;
};

export const main = async (
  core: Core,
  start: Dayjs,
  end: Dayjs,
): Promise<string> => {
  const { log, screenshot } = core;
  log.info(`Beginning run from ${start.format()} -> ${end.format()}.`);

  const { browser, page } = await init(core, 1);

  try {
    await page.goto("https://www.masslandrecords.com/worcester/");
    await page.waitForFunction(() => typeof __doPostBack !== "undefined");
    await screenshot.record(page, "after-do-post-back");
    await page.evaluate(() => {
      __doPostBack("Navigator1$SearchCriteria1$LinkButton35", "");
    });
    await page.waitForSelector("#SearchFormEx1_ACSTextBox_DateFrom");
    await page.$eval(
      "#SearchFormEx1_ACSTextBox_DateFrom",
      (el: HTMLInputElement, formattedStart) => (el.value = formattedStart),
      start.format("MM/DD/YYYY"),
    );
    await page.waitForSelector("#SearchFormEx1_ACSTextBox_DateTo");
    await page.$eval(
      "#SearchFormEx1_ACSTextBox_DateTo",
      (el: HTMLInputElement, formattedEnd) => (el.value = formattedEnd),
      end.format("MM/DD/YYYY"),
    );

    await screenshot.record(page, "after-dates-entered");
    await page.click("#SearchFormEx1_btnSearch");

    await Bun.sleep(1000);
    await screenshot.record(page, "after-search-clicked");

    const errorReceived = await page.$("#MessageBoxCtrl1_ErrorLabel1");
    if (errorReceived) {
      const message = await errorReceived.evaluate(
        (el: HTMLInputElement) => el.innerText,
      );
      throw new Error(message);
    }

    const rowCountEl = await page.$("#SearchInfo1_ACSLabel_SearchResultCount");
    if (!rowCountEl) {
      throw new Error("TODO");
    }
    const rows = await rowCountEl.evaluate((el: HTMLInputElement) =>
      parseInt(el.innerText),
    );
    const headers = [
      [
        "Doc #",
        "File Date",
        "Rec Time",
        "Type Desc.",
        "Bk/Pg",
        "Consideration",
        "Court Case #",
        "Doc. Status",
      ],
    ];
    const data = [];

    for (let i = 0; i < rows; i++) {
      const fn = `DocList1$GridView_Document$ctl${(i + 2)
        .toString()
        .padStart(2, "0")}$ButtonRow_Rec. Date_${i}`;
      await page.evaluate((fn) => {
        return __doPostBack(fn, "");
      }, fn);

      await Bun.sleep(1000);

      const details = await page.waitForSelector("#DocDetails1_Panel_Details");
      if (!details) {
        throw new Error("TODO");
      }
      const tds = await details.$$("td");
      const values = await Promise.all(
        tds.map((td) => td.evaluate((el: HTMLInputElement) => el.innerText)),
      );
      data.push(values);
    }

    const output = stringify(headers.concat(data));
    console.log(output);
    return output;
  } catch (err) {
    await screenshot.record(page, "error-received");
    throw err;
  } finally {
    await browser.close();
  }
};

if (import.meta.main) {
  const start = dayjs("2023-01-01");
  const end = dayjs("2023-10-31");
  main({ log, screenshot }, start, end)
    .then(() => process.exit(0))
    .catch((err) => {
      log.error((err as Error).stack);
      return process.exit(1);
    });
}
