import { Format } from 'telegraf';
import _ from 'lodash';
import moment from 'moment-timezone';

import { requireJson } from './functions.js';

const style = '⭑';
const randomSplit = _.sample(['/', 'or']);
const monospace = (str: string) => '```' + str + '```';
const interline = (str: string) => str;

export const allmenu = (prefix: string, name: string) => {
   const listFeatures = requireJson('./database/commands.json');
   let position = '';
   let assignFeatures = _.assign(listFeatures);
   Object.keys(listFeatures).forEach((item) => {
      position += `\t\t\t</ ${item.replace(/[^a-zA-Z0-9]/g, ' ')} >\n${interline(style + ' ' + prefix + assignFeatures[item].join('_\n_' + style + ' ' + prefix).replaceAll('<', '<').replaceAll('>', '>').replace(':', randomSplit))}\n\n`;
   });
   return `
  ${`Hallo ${name}`} 👋

⬟ Date: ${moment().tz('Asia/Jakarta').locale('id').format('LLL')}

⬟ Notes:
  ${'⧾ ' + 'Gunakan Fitur tanpa simbol <>'}
  ${'⧾ ' + 'Jangan spam bot...'}

${position}`;
};