import fs from 'fs';
import path from 'path';
import util from 'util';
import chalk from 'chalk';
import moment from 'moment-timezone';
import { Telegraf, Markup } from 'telegraf';
import { session } from 'telegraf/session';

import loadCommand from './loadCommand.js';
import * as functions from './library/functions.js';
import { baseURL, owner, token, apikey, prefix } from './configs/env.js';
import * as regex from './configs/regex.js';
import { allmenu } from './library/service.js';
import { inputTextCallbackQuery } from './callback/inputText.js';

let cache = Function("return this")();
cache.commander = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'output', 'database', 'commands.json'), 'utf-8'));
cache.Commands = {};
cache.headersCommands = [];
cache.allCommands = [];
cache.plugins = {};

loadCommand(cache);

const app = new Telegraf(token);

const keyboard = Markup.inlineKeyboard([
   Markup.button.url('Rest API', baseURL),
   Markup.button.url('Owner Bot', `https://t.me/${owner[0]}`)
]);

const styleMessage = (title: string, text: string, step = null) => {
   const content = text.replaceAll(': •', '').replace(/•/g, '᛭').replace(/: /g, ': ');
   return (title ? `\r \r \r \r ⋞ ${title} ⋟\n\n${step ? `${step}\n\n` : ''}${content}\n\n` : `\n\n${content}`).trimEnd();
};

app.use(session());
app.start((xcoders) => xcoders.reply(allmenu(prefix, xcoders.from.username!), { parse_mode: 'MarkdownV2', reply_markup: keyboard.reply_markup }));
app.help((xcoders) => xcoders.reply(allmenu(prefix, xcoders.from.username!), { parse_mode: 'MarkdownV2', reply_markup: keyboard.reply_markup }));
app.action('input_text', inputTextCallbackQuery);

app.on('message', async (xcoders) => {
   try {
      const message = Object.keys(xcoders.message);
      const args = (message.includes('caption') ? (xcoders.message as any).caption : xcoders.text);
      const command = args?.split(' ')[0].slice(1);
      const query = args?.split(' ')[1]?.trim();
      const isCommand = args?.startsWith(prefix);
      const isCreator = owner.includes(xcoders.from.username!);
      const mimetype = message.includes('video') || message.includes('photo');
      const id = xcoders.msg.chat.id;
      const type = xcoders.msg.chat.type;
      const username = xcoders.msg.from.username;
      const name = xcoders.from.first_name + ' ' + xcoders.from.last_name || '';
      const getCurrentTime = moment.tz('Asia/Jakarta').locale('id').format('HH:mm');

      if (isCommand) {
         if (xcoders.msg.from.is_bot) return;
         console.log(chalk.bgBlack.red.italic.bold(getCurrentTime), chalk.bold.italic.green('[ CMD ]'), chalk.italic.greenBright.bold('From'), chalk.bold.italic.yellow(username), type !== 'private' ? chalk.italic.bold.greenBright('in ') + chalk.italic.bold.yellow(xcoders.message.from.first_name) : '');
      }
      if (!isCommand) {
         console.log(chalk.bgBlack.italic.red.bold(getCurrentTime), chalk.italic.red('[ MSG ]'), chalk.bold.italic.greenBright('From'), chalk.italic.bold.yellow(username), type !== 'private' ? chalk.italic.bold.greenBright('in ') + chalk.italic.bold.yellow(xcoders.message.from.first_name) : '');
      }


      if (xcoders.text?.startsWith('=>')) {
         try {
            const evaling = await eval(`;(async () => {
               return ${xcoders.text.slice(3)}
            })();`);
            const utilites = util.format(evaling);
            await xcoders.reply(utilites);
         } catch (error) {
            await xcoders.reply(util.format(error));
         }
      }

      if (isCommand) {
         for (let keys of Object.keys(cache.plugins)) {
            const Functions = cache.plugins[keys];
            const getCommand = Functions.command;
            const regexp = new RegExp(getCommand);
            if (regexp.test(command!)) {
               if (Functions.private && !isCreator) return xcoders.reply('_Private Fitur, Tunggu owner memperbaiki fitur ini..._');
               if (Functions.query && (!query || query!.includes('--usage'))) {
                  const caption = styleMessage(Functions.description, `• Usage: ${Functions.usage.replace('%cmd%', prefix + command)}`);
                  return xcoders.reply(caption);
               } else {
                  if (Functions.text && regex.url(query!)) return xcoders.reply(`Query yang dibutuhkan command ${prefix + command} adalah sebuah teks...`);
                  if (Functions.url) {
                     if (!regex.url(query!)) {
                        return xcoders.reply(`Query yang dibutuhkan command ${prefix + command} adalah sebuah url...`);
                     } else if (Functions.image) {
                        if (!(await functions.checkContentType(query!, 'image'))) return xcoders.reply('Invalid type url');
                     } else if (Functions.video) {
                        if (!(await functions.checkContentType(query!, 'video'))) return xcoders.reply('Query yang dibutuhkan adalah URL video yang valid.');
                     } else if (Functions.audio) {
                        if (!(await functions.checkContentType(query!, 'audio'))) return xcoders.reply('Query yang dibutuhkan adalah URL audio yang valid.');
                     }
                  }
               }
               if (Functions.owner && !isCreator) return xcoders.reply('Fitur ini khusus untuk owner...');
               if (Functions.onlyGroup && type === 'private') return xcoders.reply(`Fitur ${command} hanya bisa digunakan didalam group`);
               if (Functions.media && !mimetype) return xcoders.reply(`Reply atau kirim media image atau video dan caption ${prefix + command}`);
               return Functions.execute({ xcoders, app, command, id, name, username, query, baseURL, apikey });
            }
         }
      }
   } catch (error: any) {
      console.log(error);
      await xcoders.reply(error.message);
   }
});

app.launch(() => console.log(chalk.bgRedBright.green.bold(' Bot started... '), '\n'));