import { ElementHandle, Page } from "puppeteer";

const getValidCount = async (page: Page): Promise<number> => {
  const selector = (await page.waitForSelector(
    "#SearchInfo1_ACSLabel_SearchResultCount",
  )) as ElementHandle;
  const count = await selector.getProperty("textContent");
  return (await count.jsonValue()) as number;
};

const getTooFewCount = async (page: Page): Promise<number> => {
  await page.waitForSelector("#MessageBoxCtrl1_ErrorLabel1");
  return 0;
};

export const countResults = async (page: Page): Promise<number> => {
  const count = await Promise.race([getValidCount(page), getTooFewCount(page)]);

  if (count <= 0) {
    throw new Error("Too few results received. Use a broader time range.");
  }

  if (count >= 1000) {
    throw new Error("Too many results received. Use a more narrow time range.");
  }
  return count;
};
