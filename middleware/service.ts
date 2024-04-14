import { Markup, Context } from 'telegraf';
import { ChatAction, InlineKeyboardMarkup } from 'telegraf/types';
import _ from 'lodash';
import moment from 'moment-timezone';
import chalk from 'chalk';
import fs from 'fs';

import logger from '../library/logger.js';
import { range, requireJson } from '../library/functions.js';
import { baseURL, owner, trakteerURL } from '../configs/env.js';

const style = '⭑';
const randomSplit = _.sample(['/', 'or']);
const monospace = (str: string) => '```' + str + '```';
const interline = (str: string) => '_' + str + '_';

const ESCAPE_MAP = new Set(["_", "*", "[", "]", "(", ")", "~", "`", ">", "<", "#", "+", "-", "=", "|", "{", "}", ".", "!"])
export const escapeHTML = (text: string) => {
  return [...text].map((char) => {
    if (ESCAPE_MAP.has(char)) return `\\${char}`;
    return char;
  }).join("");
}

const CODE_ESCAPE_MAP = new Map([
  ["`", "\\`"],
  ["\\", "\\\\"],
  ["<", "&lt;"],
  [">", "&gt;"],
  ["&", "&amp;"]
])
export const escapeCode = (text: string) => {
  return [...text].map((char) => {
    if (CODE_ESCAPE_MAP.has(char)) return CODE_ESCAPE_MAP.get(char);
    return char;
  }).join("");
};

export const bold = (text: string) => `<b>${text}</b>`;
export const italic = (text: string) => `<i>${text}</i>`;
export const code = (text: string) => `<code>${escapeCode(text)}</code>`;
export const pre = (text: string) => `<pre>${escapeCode(text)}</pre>`;
export const underline = (text: string) => `<u>${text}</u>`;
export const strikethrough = (text: string) => `<s>${text}</s>`;
export const link = (text: string, url: string) => `<a href="${url}">${text}</a>`;
export const quote = (text: string) => `<blockquote>${text}</blockquote>`;
export const mention = (text: string, user_id: number) => `<a href="tg://user?id=${user_id}">${text}</a>`;

export const buttonStart = Markup.inlineKeyboard([
  Markup.button.url('Rest API', baseURL),
  Markup.button.url('Owner Bot', `https://t.me/${owner[0]}`),
  Markup.button.url('Trakteer ID', trakteerURL)
]);

export const buttonHelp = (id: number, cache: any, command: string = ''): InlineKeyboardMarkup => {
  let result = [];
  for (let category of Object.keys(cache.Commands)) {
    if (command !== category) result.push(Markup.button.callback(category, category + '-' + id.toString()));
  }
  if (command !== 'All') result.push(Markup.button.callback('All Menu', 'All' + '-' + id.toString()));

  return Markup.inlineKeyboard(result, { columns: 2 }).reply_markup;
};

export const replyWithFormatText = async (text: string): Promise<string> => {
  let result = '';
  for (let x of range(0, text.length, 4096)) {
    result += text.substring(x, 4096);
  }
  return result;
};

export const styleMessage = (title: string, text: string, step = null): string => {
  const content = text.replaceAll(': •', '').replace(/•/g, '᛭').replace(/: /g, ': ');
  return (title ? `\r \r \r \r ${interline(title)}\n\n${step ? `${step}\n\n` : ''}${content}\n\n` : `\n\n*${content}*`).trim();
};

export const waitingMessage = async (xcoders: Context, action: ChatAction, message: string) => {
  await xcoders.sendChatAction(action);
  await xcoders.reply(message, { parse_mode: 'Markdown' });
}

export const errorMessage = async (xcoders: Context, message: string, error: any): Promise<void> => {
  logger.error(error);
  await xcoders.reply(`*${message}*`, { parse_mode: 'Markdown' });
};

export const start_service = (name: string, text: string): string => {
  return `Hello ${name?.replaceAll('_', ' ')}! ${text}`;
};

export const helpService = (prefix: string, name: string, language: any): string => {
  const listFeatures = requireJson('./output/database/commands.json');
  let position = '';
  let assignFeatures = _.assign(listFeatures);
  const notes = language.notes.map((str: string) => `⧾ ${str}`).join('\n  ');

  Object.keys(listFeatures).forEach((item) => {
    position += `\t\t\t *${item.replace(/[^a-zA-Z0-9]/g, ' ')}*\n${'_' + style + ' ' + prefix + assignFeatures[item].join('_\n_' + style + ' ' + prefix).replaceAll('< ', '*').replaceAll(' >', '*').replace(':', randomSplit) + '_'}\n\n`;
  });
  return `
  *${`Hallo ${name?.toString().replaceAll('_', ' ')}`}* 👋

⬟ Date: ${moment().tz('Asia/Jakarta').locale('id').format('LLL')}

⬟ Notes:
  ${notes}

${position}
\t\t*_build with ❤️ by xcoders teams_*`.replaceAll('.', ':');
};

export const displayMenuFromCallback = (prefix: string, name: string, listFeatures: { [key: string]: string | Array<string> }, language: any): string => {
  let position = '';
  let assignFeatures = _.assign(listFeatures);
  const notes = language.notes.map((str: string) => `⧾ ${str}`).join('\n  ');

  Object.keys(listFeatures).forEach((item) => {
    let features = Array.isArray(assignFeatures[item]) ? assignFeatures[item] : [assignFeatures[item]];
    let formattedFeatures = (features as any[]).map((feature: string) => feature.replaceAll('< ', '*').replaceAll(' >', '*').replace(':', randomSplit));
    position += `${'_' + style + ' ' + prefix + formattedFeatures.join('_\n_' + style + ' ' + prefix) + '_'}\n`;
  });

  return `
  *${`Hallo ${name?.toString().replaceAll('_', ' ')}`}* 👋

⬟ Date: ${moment().tz('Asia/Jakarta').locale('id').format('LLL')}

⬟ Notes:
  ${notes}

${position}

\t\t*_build with ❤️ by xcoders teams_*`.replace(/\./g, ':');
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