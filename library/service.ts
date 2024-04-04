import { Markup, Context } from 'telegraf';
import _ from 'lodash';
import moment from 'moment-timezone';
import chalk from 'chalk';
import fs from 'fs';

import { requireJson } from './functions.js';
import { baseURL, owner, trakteerURL } from '../configs/env.js';

const style = '⭑';
const randomSplit = _.sample(['/', 'or']);
const monospace = (str: string) => '```' + str + '```';
const interline = (str: string) => '_' + str + '_';
const bold = (str: string) => '*' + str + '*';

export const keyboardMessage = Markup.inlineKeyboard([
  Markup.button.url('Rest API', baseURL),
  Markup.button.url('Owner Bot', `https://t.me/${owner[0]}`),
  Markup.button.url('Trakteer ID', trakteerURL)
]);

export const styleMessage = (title: string, text: string, step = null) => {
  const content = text.replaceAll(': •', '').replace(/•/g, '᛭').replace(/: /g, ': ');
  return (title ? `\r \r \r \r ${interline(title)}\n\n${step ? `${step}\n\n` : ''}${content}\n\n` : `\n\n${bold(content)}`).trim();
};

export const errorMessage = async (xcoders: Context, message: string, error: any) => {
  console.error(error);
  await xcoders.reply(bold(message), { parse_mode: 'Markdown' });
}

export const serviceMenu = (prefix: string, name: string): string => {
  const listFeatures = requireJson('./output/database/commands.json');
  let position = '';
  let assignFeatures = _.assign(listFeatures);

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

export const savedPlugins = (cache: { headersCommands: any; allCommands?: any; plugins?: any; Commands: any; commander: any; }): void => {
  const headers = cache.headersCommands;
  const objects = headers.reduce((objects: { [x: string]: any; }, items: { category: string | number; command: any; description: string }) => {
    if (objects[items.category]) {
      objects[items.category].command.push(...items.command);
    } else {
      objects[items.category] = { ...items };
    }
    return objects;
  }, {});
  Object.keys(objects).forEach((category) => {
    cache.Commands[category] = [...new Set(objects[category].command)].sort();
  });
  const keysCommander = Object.keys(cache.commander);
  const keysCommands = Object.keys(cache.Commands);
  if (keysCommander.length === 0 && keysCommands.length !== 0) {
    fs.writeFileSync('./output/database/commands.json', JSON.stringify(cache.Commands, null, 2));
    console.log(chalk.green.bold.overline('Successfully loaded plugins'));
  } else if (keysCommands.length === keysCommander.length) {
    keysCommander.forEach((key) => {
      if (cache.commander[key].length !== cache.Commands[key].length) {
        fs.writeFileSync('./output/database/commands.json', JSON.stringify(cache.Commands, null, 2));
        console.log(chalk.green.bold.overline('Successfully added plugins'));
      }
    });
  } else if (keysCommands.length !== (keysCommander.length || keysCommander.length === 0)) {
    fs.writeFileSync('./output/database/commands.json', JSON.stringify(cache.Commands, null, 2));
    console.log(chalk.green.bold.overline('Successfully updated plugins'));
  }
};