const csv = require("csvtojson");

const csvFilePath = "./members.csv";

function fromEntries(iterable) {
  return [...iterable].reduce(
    (obj, { 0: key, 1: val }) => Object.assign(obj, { [key]: val }),
    {}
  );
}

csv()
  .fromFile(csvFilePath)
  .then(jsonObj => {
    const formatted = jsonObj.map(obj => {
      const fns = [
        ([key, val]) => {
          if (val === "$null") {
            return [key, null];
          }
          return [key, val];
        },
        ([key, val]) => {
          if (typeof val === "string" && val.startsWith("['")) {
            return [key, JSON.parse(val.replace(/'/g, '"'))];
          }
          return [key, val];
        }
      ];

      const filters = [
        ([key, val]) => {
          if (key === "isLead" && val === "") {
            return false;
          }
          return true;
        },
        ([, val]) => {
          if (Array.isArray(val) && val.length === 1 && val[0] === "") {
            return false;
          }
          return true;
        },
        ([key, val]) => {
          if (key === "otherSubteams" && val === "") {
            return false;
          }
          return true;
        }
      ];

      return filters.reduce(
        (prev, next) => {
          return fromEntries(Object.entries(prev).filter(next));
        },
        fns.reduce((prev, next) => {
          return fromEntries(Object.entries(prev).map(next));
        }, obj)
      );
    });

    console.log(JSON.stringify(formatted));
  });
