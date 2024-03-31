import _ from 'lodash';
import moment from 'moment-timezone';

import { requireJson } from './functions.js';

const style = '⭑';
const randomSplit = _.sample(['/', 'or']);

export const allmenu = (prefix: string, name: string): string => {
  const listFeatures = requireJson('./output/database/commands.json');
  let position = '';
  let assignFeatures = _.assign(listFeatures);
  const monospace = (str: string) => '```' + str + '```';
  const bold = (str: string) => '*' + str + '*';

  Object.keys(listFeatures).forEach((item) => {
    position += `\t\t\t ${bold(item.replace(/[^a-zA-Z0-9]/g, ' '))}\n${'_' + style + ' ' + prefix + assignFeatures[item].join('_\n_' + style + ' ' + prefix).replaceAll('< ', '*').replaceAll(' >', '*').replace(':', randomSplit) + '_'}\n\n`;
  });
  return `
  *${`Hallo ${name.toString().replaceAll('_', ' ')}`}* 👋

⬟ Date: ${moment().tz('Asia/Jakarta').locale('id').format('LLL')}

⬟ Notes:
  ${'⧾ ' + 'Jangan spam bot'}

${position}`.replaceAll('.', ':');
};