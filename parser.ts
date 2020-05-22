// Copyright 2019 Evan Welsh
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// Usage: Check the README

const fs = require("fs");
const path = require("path");
const csv = require("csvtojson");

const csvFilePath = process.argv[2];

const undefinedIfEmpty = (string: string): string | undefined => string.trim().length === 0 ? undefined : string.trim();

function getRoleObject(role: string): Readonly<{ roleId: string; roleDescription: string }> {
  switch (role) {
    case 'UX/UI Designer':
      return { roleId: 'designer', roleDescription: 'Designer' };
    case 'Developer':
      return { roleId: 'developer', roleDescription: 'Developer' };
    case 'Business Analyst':
      return { roleId: 'business', roleDescription: 'Business Analyst' };
    case 'Graphic Designer':
      return { roleId: 'designer', roleDescription: 'Graphic Designer' };
    case 'Lead':
      return { roleId: 'lead', roleDescription: 'Lead' };
    case 'Technical Project Manager':
      return { roleId: 'pm', roleDescription: 'Technical PM' };
    case 'Product Manager':
      return { roleId: 'pm', roleDescription: 'Product Manager' };
    default:
      throw new Error(`Unsupported role: ${role}`);
  }
}

function transformSubteams(input: string): string {
  const lowercasedInput = input.toLowerCase();
  if (lowercasedInput.includes('carriage')) {
    return 'carriage';
  } else if (lowercasedInput.includes('review')) {
    return 'reviews';
  } else if (lowercasedInput.includes('plan')) {
    return 'courseplan';
  } else if (lowercasedInput.includes('queue')) {
    return 'queuemein';
  } else if (lowercasedInput.includes('flux')) {
    return 'flux';
  } else if (lowercasedInput.includes('eve') || lowercasedInput.includes('cue')) {
    return 'events';
  } else if (lowercasedInput.includes('research')) {
    return 'researchconnect';
  } else if (lowercasedInput.includes('samwise')) {
    return 'samwise';
  } else if (lowercasedInput.includes('shout')) {
    return 'shout';
  } else if (lowercasedInput.includes('website')) {
    return 'website';
  } else if (lowercasedInput.includes('week')) {
    return 'orientation';
  } else if (lowercasedInput.includes('leads')) {
    return 'Leads';
  } else if (lowercasedInput.includes('business')) {
    return 'business';
  } else {
    throw new Error(`Unsupported team: ${input}. Maybe it's a bug of the script or bad input.`);
  }
}

csv()
  .fromFile(csvFilePath)
  .then((jsonObj: readonly { readonly [key: string]: string }[]) => {
    const formatted = jsonObj.map(obj => {
      const {
        netid, firstName, lastName, name, ['When do you currently plan to graduate?']: graduation,
        major, doubleMajor, minor, website, linkedin, github,
        state, hometown, country, bio: about, subteam, otherSubteams, role
      } = obj;

      return {
        netid, firstName, lastName, name, graduation,
        major: undefinedIfEmpty(major),
        doubleMajor: undefinedIfEmpty(doubleMajor),
        minor: undefinedIfEmpty(minor),
        website: undefinedIfEmpty(website),
        linkedin: undefinedIfEmpty(linkedin),
        github: undefinedIfEmpty(github),
        hometown: state !== 'International' ? `${hometown}, ${state}` : `${hometown}, ${country}`,
        about,
        subteam: transformSubteams(subteam),
        otherSubteams: undefinedIfEmpty(otherSubteams) && otherSubteams.split(',').map(transformSubteams),
        ...getRoleObject(role)
      };
    });

    fs.mkdirSync('temp', { recursive: true });
    formatted.forEach(memberJson => {
      fs.writeFileSync(
        path.join('temp', `${memberJson.netid}.json`),
        JSON.stringify(memberJson, undefined, 4) + '\n'
      );
    });
  });
