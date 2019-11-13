# nova-scripts
Scripts for the website!

## parser.js

### Usage
1) Copy the enrollment spreadsheet.
2) Format it to match this spreadsheet: bit.ly/website-csv-format
3) Export the spreadsheet as CSV (comma edition)
4) Run `npm i`
5) Run this script as `node parser.js [csv file path] > [json path]`
6) Copy the [json path] to the `nova.cornelldti.org/src/data/strings/members-x.json`
7) Update the member json path in `nova.cornelldti.org/src/data/strings/`
