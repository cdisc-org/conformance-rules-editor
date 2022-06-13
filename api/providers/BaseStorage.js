const DrupalStorage = require("./DrupalStorage");

const STORAGE_PROVIDERS = new Map([["Drupal", DrupalStorage]]);

exports.STORAGE_PROVIDER = STORAGE_PROVIDERS.get(
  process.env["STORAGE_PROVIDER"]
);
