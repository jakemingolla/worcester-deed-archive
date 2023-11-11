import puppeteer from "puppeteer";

import { log } from "./core";

const main = async () => {
  await Promise.resolve();
  void puppeteer;
};

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      log.error((err as Error).stack);
      return process.exit(1);
    });
}
