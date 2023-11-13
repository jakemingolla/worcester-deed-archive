import { stringify } from "csv-stringify/sync";
import puppeteer from "puppeteer";

import { log } from "./core";

// TODO
const __doPostBack = (...args: string[]) => {
  void args;
};

// TODO
type HTMLInputElement = {
  value: string;
  innerText: string;
};

const USER_AGENT =
  "Mozilla/5.0 (compatible; " +
  "worcester-deed-archive/1.0; " +
  "https://github.com/jakemingolla/worcester-deed-archive)";

const main = async () => {
  const browser = await puppeteer.launch({
    timeout: 5 * 1000,
    headless: "new",
  });

  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);
  await page.setViewport({ width: 1080, height: 1024 });
  try {
    await page.goto("https://www.masslandrecords.com/worcester/");
    await page.waitForFunction(() => typeof __doPostBack !== "undefined");
    await page.screenshot({ path: "out.png", type: "png" });
    await page.evaluate(() => {
      __doPostBack("Navigator1$SearchCriteria1$LinkButton35", "");
    });
    await page.waitForSelector("#SearchFormEx1_ACSTextBox_DateFrom");
    await page.$eval(
      "#SearchFormEx1_ACSTextBox_DateFrom",
      (el: HTMLInputElement) => (el.value = "1/1/2023"),
    );
    await page.waitForSelector("#SearchFormEx1_ACSTextBox_DateTo");
    await page.$eval(
      "#SearchFormEx1_ACSTextBox_DateTo",
      (el: HTMLInputElement) => (el.value = "10/31/2023"),
    );
    await page.click("#SearchFormEx1_btnSearch");

    await Bun.sleep(1000);

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
  } finally {
    await page.screenshot({ path: "end.png", type: "png" });
    await browser.close();
  }
};

if (import.meta.main) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      log.error((err as Error).stack);
      return process.exit(1);
    });
}
