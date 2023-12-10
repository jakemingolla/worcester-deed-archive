import { EnvType, load } from "ts-dotenv";

export type Env = EnvType<typeof schema>;

const schema = {
  AFTER_EACH_ROW_DELAY_SECONDS: Number,
  AFTER_EACH_PAGE_DELAY_SECONDS: Number,
  BASE_URL: String,
  CLEAR_SCREENSHOTS: Boolean,
  END_DATE: String, // ISO 8601
  HEADLESS: Boolean,
  LOG_LEVEL: String,
  OUTPUT_FILE: String,
  START_DATE: String, // ISO 8601
  USER_AGENT: String,
};

export const config = load(schema);
