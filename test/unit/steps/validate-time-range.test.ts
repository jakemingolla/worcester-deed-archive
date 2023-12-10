import dayjs from "dayjs";
import { validateTimeRange } from "../../../src/steps/validate-time-range";

describe("steps/validate-time-range", () => {
  it("throws an error if the start date is invalid", () => {
    expect(() => validateTimeRange("invalid", "2023-01-01")).toThrow(
      "Invalid start date: invalid",
    );
  });

  it("throws an error if the end date is invalid", () => {
    expect(() => validateTimeRange("2023-01-01", "invalid")).toThrow(
      "Invalid end date: invalid",
    );
  });

  it("throws an error if the end date is before the start date", () => {
    expect(() => validateTimeRange("2023-01-02", "2023-01-01")).toThrow(
      "Start date 2023-01-02 must be before end date 2023-01-01",
    );
  });

  it("returns the start and end dates if they are valid", () => {
    const { start, end } = validateTimeRange("2023-01-01", "2023-01-02");
    expect(start).toMatchObject(dayjs("2023-01-01"));
    expect(end).toMatchObject(dayjs("2023-01-02"));
  });

  it("returns the start and end dates if they are equal", () => {
    const { start, end } = validateTimeRange("2023-01-01", "2023-01-01");
    expect(start).toMatchObject(dayjs("2023-01-01"));
    expect(end).toMatchObject(dayjs("2023-01-01"));
  });
});
