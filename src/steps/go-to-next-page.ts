import { Page } from "puppeteer";

export const goToNextPage = async (page: Page, i: number): Promise<void> => {
  await page.click("#DocList1_LinkButtonNext");

  const nextPageNumberButtonId =
    "DocList1_ctl02_ctl" +
    (Math.floor(i / 20) * 2).toString().padStart(2, "0") +
    "_LinkButtonNumber";
  await page.waitForSelector(`#${nextPageNumberButtonId}.PagerSelectedButton`);
};
