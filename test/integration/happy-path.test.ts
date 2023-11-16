import { describe, it, expect } from "bun:test";
import { main } from "../../src";
import dayjs from "dayjs";

describe("happy path tests", () => {
  it("the results from 2023-01-01 -> 2023-02-01 are found", async () => {
    const start = dayjs("2023-01-01");
    const end = dayjs("2023-02-01");
    const output = await main(start, end);
    const expected =
      "Doc #,File Date,Rec Time,Type Desc.,Bk/Pg,Consideration,Court Case #,Doc. Status\n" +
      "18527,01/19/2023,08:46:19.602,PLANS,00093/127,\xa0,0000019658,In workflow\n";

    expect(output).toBe(expected);
  });
});
