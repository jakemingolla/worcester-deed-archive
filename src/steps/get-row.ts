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

  return data.slice(0, 8);
};

const getPropertyData = async (page: Page): Promise<string[]> => {
  const data = await getCellDataForPanel("#DocDetails1_Panel_Properties", page);
  for (let i = data.length; i < 3; i++) {
    data.push("");
  }

  // Multiple addresses are ignored, only the first are taken
  return data.slice(0, 3);
};

const getTownData = async (page: Page, i: number): Promise<string[]> => {
  const towns = await page.$x(`//a[contains(@id, "ButtonRow_Town")]`);
  const town = towns.at(i % 20);
  const innerText = await town?.getProperty("innerText");
  return [(await innerText?.jsonValue()) as string];
};

const getGrantData = async (page: Page): Promise<string[]> => {
  const data = await getCellDataForPanel(
    "#DocDetails1_Panel_GrantorGrantee",
    page,
  );

  const names = data.filter((_, i) => i % 2 === 0);
  const roles = data.filter((_, i) => i % 2 === 1);

  const grantorIndex = roles.findIndex((role) => role === "Grantor");
  const granteeIndex = roles.findIndex((role) => role === "Grantee");

  return [names.at(grantorIndex) || "", names.at(granteeIndex) || ""];
};

export const getRow = async (page: Page, i: number): Promise<string[]> => {
  return [
    // pretter-ignore-next-line
    ...(await getDocumentData(page)),
    ...(await getPropertyData(page)),
    ...(await getTownData(page, i)),
    ...(await getGrantData(page)),
  ];
};
