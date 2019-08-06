const clipboardy = require("clipboardy");
const moment = require("moment");
const TogglClient = require("toggl-api");

require("dotenv").config({ path: "./.toggl-token" });
const toggl = new TogglClient({ apiToken: process.env.TOGGL_TOKEN });

const PROJECTS = {
  BUILDING: "151623291",
  CR: "151623298",
  MEETING: "151627082",
  FIXING_CR: "151623327",
  CHAPTER_WORK: "152098388",
  RELEASE_DOCS: "151920047",
  READING: "39303597",
  ONE_ON_ONE: "151750779",
  MISC: ""
};

const getEntries = (startDate, endDate) =>
  new Promise((resolve, reject) => {
    return toggl.getTimeEntries(startDate, endDate, (err, timeEntries) => {
      if (err || !timeEntries) {
        reject(err || timeEntries);
      }
      resolve(sanitizeEntries(timeEntries));
    });
  });

const grabUrl = str => {
  const regex = new RegExp(
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/
  );
  return str.match(regex);
};

const sanitizeEntries = entries =>
  entries.reduce((acc, { pid, description }) => {
    if (!pid) {
      return acc;
    }
    if (
      acc.some(entry => entry.description === description && entry.pid === pid)
    ) {
      return acc;
    }
    return [
      ...acc,
      {
        pid,
        description
      }
    ];
  }, []);

const groupEntries = entries =>
  entries.reduce((groups, entry) => {
    if (!groups.hasOwnProperty(entry.pid)) {
      return {
        ...groups,
        [entry.pid]: [entry.description]
      };
    }
    return {
      ...groups,
      [entry.pid]: [...groups[entry.pid], entry.description]
    };
  }, {});

const getMoreCRsText = () => {
  const options = ["Moar CRs", "CR something", "CR some stuff", "Do CRs"];
  const choice = options[Math.floor(Math.random() * options.length)];
  return `- :sleuth_or_spy: ${choice}`;
};

const getOutput = entryGroups =>
  Object.keys(entryGroups)
    .reduce(
      (results, key) => {
        if (
          [
            PROJECTS.BUILDING,
            PROJECTS.FIXING_CR,
            PROJECTS.CHAPTER_WORK
          ].includes(key)
        ) {
          return results.concat(
            entryGroups[key].map(entry => `- :building_construction: ${entry}`)
          );
        }
        if (key === PROJECTS.CR) {
          return results.concat(
            entryGroups[key].map(entry => `- :sleuth_or_spy: CR ${entry}`)
          );
        }
        if (key === PROJECTS.MEETING) {
          return results.concat(
            entryGroups[key].map(entry => `- :man-woman-girl-boy: ${entry}`)
          );
        }
        if (key === PROJECTS.ONE_ON_ONE) {
          return results.concat(
            entryGroups[key].map(entry => `- :one::on::one: ${entry}`)
          );
        }
        if (key === PROJECTS.READING) {
          const readings = entryGroups[key].reduce(
            (acc, reading) => {
              const [url] = grabUrl(reading);
              return !url ? acc : acc.concat([`  - ${url}`]);
            },
            ["- _:open_book: I also read some cool stuff..._"]
          );
          return results.concat(readings);
        }
        return results;
      },
      [isMonday() ? "*Yesterbusinessday*" : "*Yesterday*"]
    )
    .concat(["\n*Today*", getMoreCRsText(), "\n*Blockers*", "- None!"])
    .join("\n");

const isMonday = (d = new Date()) => {
  return moment(d).day() === 1;
};

(async function() {
  const now = new Date();

  const yesterday = moment(now)
    .add(isMonday(now) ? -3 : -1, "days")
    .startOf("day")
    .format();

  const today = moment(now)
    .startOf("day")
    .format();

  try {
    console.log(`⏰ Getting yesterday's toggl entries`);
    const entries = await getEntries(yesterday, today);
    console.log(`📑 Formatting entries`);
    const grouped = groupEntries(entries);
    const output = getOutput(grouped);
    await clipboardy.write(output);
    console.log(`📋 Copied Yesterday's check-in to clipboard!\n`);
    console.log(`${output}\n`);
    process.exit();
  } catch (e) {
    console.error(
      "☠️ Something has gone horribly wrong and everyone is dead!",
      e
    );
    process.exit(1);
  }
})();
