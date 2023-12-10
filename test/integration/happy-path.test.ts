import { describe, it, expect } from "bun:test";
import { main } from "../../src";
import dayjs from "dayjs";

describe("happy path tests", () => {
  it("the results from 2023-01-01 -> 2023-02-01 are found", async () => {
    const start = dayjs("1961-01-06").toISOString();
    const end = dayjs("1961-01-07").toISOString();
    const output = await main(start, end);
    expect(output.split("\n").length).toBe(
      27 + // data
        1 + // header
        1, // last line
    );
    expect(output).toMatchSnapshot();
  });

  it("throws an error if too many results", () => {
    const start = dayjs("2023-01-01").toISOString();
    const end = dayjs("2023-01-31").toISOString();

    expect(async () => await main(start, end)).toThrow(
      "Too many results received. Use a more narrow time range.",
    );
  });

  it("throws an error if too few results", () => {
    const start = dayjs("2023-01-01").toISOString();
    const end = dayjs("2023-01-01").toISOString();

    expect(async () => await main(start, end)).toThrow(
      "Too few results received. Use a broader time range.",
    );
  });
});
