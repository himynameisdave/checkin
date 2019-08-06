/**
 *
 *
 *
 * TODO: this one is WIP.....
 *
 *
 *
 */
const fs = require("fs");
const { promisify } = require("util");

const readFile = promisify(fs.readFile);
const writeFilePromise = promisify(fs.writeFile);

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first time.
const TOKEN_PATH = ".google-token.json";
const CREDENTIALS_PATH = ".google-creds.json";

const readJSONFile = async file => {
  const contents = await readFile(file);
  return JSON.parse(contents);
};

const main = async () => {
  const credentials = await readJSONFile(CREDENTIALS_PATH);
  if (!credentials) {
    return finalReject("🙅‍♀️ Error loading client secret file");
  }
};

module.exports = main;
