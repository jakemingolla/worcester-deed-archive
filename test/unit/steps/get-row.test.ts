import { ElementHandle, Page } from "puppeteer";
import { getRow } from "../../../src/steps/get-row";

describe("steps/get-row", () => {
  const mockPage = jest.fn();

  const mockPanel = jest.fn();
  (mockPage as unknown as Page).waitForSelector = jest
    .fn()
    .mockResolvedValue(mockPanel);

  const mockDocumentElement = {
    evaluate: jest.fn().mockReturnValue("mock-document-data"),
  };
  const mockPropertyElement = {
    evaluate: jest.fn().mockReturnValue("mock-property-data"),
  };

  const mockDocumentData: ElementHandle[] = [];
  const mockPropertyData: ElementHandle[] = [];

  const mock$$ = jest
    .fn()
    .mockResolvedValueOnce(mockDocumentData)
    .mockResolvedValueOnce(mockPropertyData);

  (mockPanel as unknown as ElementHandle).$$ = mock$$;

  it("returns document and property data", async () => {
    for (let i = 0; i < 8; i++) {
      mockDocumentData.push(mockDocumentElement as unknown as ElementHandle);
    }
    for (let i = 0; i < 3; i++) {
      mockPropertyData.push(mockPropertyElement as unknown as ElementHandle);
    }

    const expectedDocumentData = Array(8).fill("mock-document-data");
    const expectedPropertyData = Array(3).fill("mock-property-data");

    const results = await getRow(mockPage as unknown as Page);
    expect(results).toMatchObject(
      expectedDocumentData.concat(expectedPropertyData),
    );
  });

  it("returns empty strings for missing data", async () => {
    const results = await getRow(mockPage as unknown as Page);
    expect(results).toMatchObject(Array(11).fill(""));
  });

  it("returns empty strings for no td HTML tags", async () => {
    mock$$.mockResolvedValueOnce([]);
    const results = await getRow(mockPage as unknown as Page);
    expect(results).toMatchObject(Array(11).fill(""));
  });
});
