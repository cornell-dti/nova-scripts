// Copyright 2019 Evan Welsh
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Usage:
// 1) Copy the enrollment spreadsheet.
// 2) Format it to match this spreadsheet: bit.ly/website-csv-format
// 3) Export the spreadsheet as CSV (comma edition)
// 4) Run `npm i`
// 5) Run this script as `node parser.js [csv file path] > [json path]`
// 6) Copy the [json path] to the `nova.cornelldti.org/src/data/strings/members-x.json`
// 7) Update the member json path in `nova.cornelldti.org/src/data/strings/`

const csv = require("csvtojson");

const csvFilePath = process.argv[2];

function fromEntries(iterable) {
  return [...iterable].reduce(
    (obj, n) => {
      const { 0: key, 1: val } = n;

      if (typeof key !== 'string') {
        return Object.assign(obj, fromEntries(n));
      }

      return Object.assign(obj, { [key]: val });
    },
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
          if (key === "bio") {
            return ["about", val];
          }
          return [key, val];
        },
        ([key, val]) => {
          if (typeof val === "string" && val.startsWith("['")) {
            return [key, JSON.parse(val.replace(/'/g, '"'))];
          }
          return [key, val];
        },
        ([key, val]) => {
          if (key === "role") {
            switch (val) {
              case 'UX/UI Designer': return [['role', 'designer'], ['roleDescription', 'Designer']];
              case 'Developer': return [['role', 'developer'], ['roleDescription', 'Developer']];
              case 'Business Analyst': return [['role', 'business'], ['roleDescription', 'Business Analyst']];
              case 'Graphic Designer': return [['role', 'designer'], ['roleDescription', 'Graphic Designer']];
              case 'Lead': return [['role', 'lead'], ['roleDescription', 'Lead']];
              case 'Technical Project Manager': return [['role', 'pm'], ['roleDescription', 'Technical Project Manager']];
              case 'Product Manager': return [['role', 'pm'], ['roleDescription', 'Product Manager']];
            }
          }
          return [key, val];
        },
        ([key, val]) => {
          if (key === "When do you currently plan to graduate?")
            return ["graduation", val];
          return [key, val];
        },
        ([key, val]) => {
          if (key === 'hometown' && obj['state'] && obj['state'] !== 'International') {
            return [key, `${val}, ${obj['state']}`];
          }

          if (key === 'hometown' && obj['country'] && obj['state'] && obj['state'] === 'International') {
            return [key, `${val}, ${obj['country']}`];
          }

          return [key, val];
        }
      ];

      const filters = [
        ([key, val]) => {
          if (["email", "state", "country", "headshot", "cornellid"].includes(key) || val === "") {
            return false;
          }
          return true;
        },
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
