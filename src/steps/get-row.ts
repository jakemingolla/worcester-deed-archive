import { Page } from "puppeteer";

const getCellDataForPanel = async (
  id: string,
  page: Page,
): Promise<string[]> => {
  const panel = await page.waitForSelector(id);
  const tds = (await panel?.$$("td")) || [];
  const values = await Promise.all(
    tds.map((td) => td.evaluate((el: HTMLInputElement) => el.innerText)),
  );
  return values.map((value) => value.replace("\u00a0", ""));
};

const getDocumentData = async (page: Page): Promise<string[]> => {
  const data = await getCellDataForPanel("#DocDetails1_Panel_Details", page);
  for (let i = data.length; i < 8; i++) {
    data.push("");
  }
  return data;
};

const getPropertyData = async (page: Page): Promise<string[]> => {
  const data = await getCellDataForPanel("#DocDetails1_Panel_Properties", page);
  for (let i = data.length; i < 3; i++) {
    data.push("");
  }
  return data;
};

export const getRow = async (page: Page): Promise<string[]> => {
  return [
    // pretter-ignore-next-line
    ...(await getDocumentData(page)),
    ...(await getPropertyData(page)),
  ];
};
