import { Dayjs } from "dayjs";
import { Page } from "puppeteer";

export const setSearchCriteria = async (
  page: Page,
  start: Dayjs,
  end: Dayjs,
): Promise<void> => {
  await page.evaluate(() => {
    __doPostBack("Navigator1$SearchCriteria1$LinkButton04", "");
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

  await page.select(
    "#SearchFormEx1_ACSDropDownList_DocumentType",
    "43" /* DEED */,
  );
};
