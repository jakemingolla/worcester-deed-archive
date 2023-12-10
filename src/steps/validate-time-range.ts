import dayjs, { Dayjs } from "dayjs";

export const validateTimeRange = (
  startInput: string,
  endInput: string,
): { start: Dayjs; end: Dayjs } => {
  const start = dayjs(startInput);
  const end = dayjs(endInput);

  if (!start.isValid()) {
    throw new Error(`Invalid start date: ${startInput}`);
  }

  if (!end.isValid()) {
    throw new Error(`Invalid end date: ${endInput}`);
  }

  if (end.isBefore(start)) {
    throw new Error(
      `Start date ${startInput} must be before end date ${endInput}`,
    );
  }

  return { start, end };
};
