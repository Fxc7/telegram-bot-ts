import path from 'path';
import util from 'util';
import chalk from 'chalk';
import moment from 'moment-timezone';
import { Telegraf } from 'telegraf';
import { session } from 'telegraf/session';
import { CallbackQuery } from 'telegraf/types';

import logger from './library/logger.js';
import client from './middleware/client.js';
import loadCommand from './loadCommand.js';
import { inputTextCallbackQuery } from './middleware/inputText.js';
import { token, prefix } from './configs/env.js';
import { url } from './configs/regex.js';
import { checkContentType, requireJson } from './library/functions.js';
import { buttonStart, errorMessage, styleMessage, replyWithFormatText, helpService, startService, buttonHelp, displayMenuFromCallback } from './middleware/service.js';

let cache = Function('return this')();
cache.commander = requireJson(path.join(process.cwd(), 'output', 'database', 'commands.json'));
cache.Commands = {};
cache.headersCommands = [];
cache.allCommands = [];
cache.plugins = {};


const app = new Telegraf(token, { handlerTimeout: Infinity });

loadCommand(cache);
app.use()
app.use(session());
app.start(async (xcoders) => {
   const displayMenu = startService(xcoders.from.username!);
   await xcoders.reply(displayMenu, { parse_mode: 'Markdown', reply_markup: buttonStart.reply_markup });
   await xcoders.deleteMessage();
});

app.help(async (xcoders) => {
   const displayMenu = helpService(prefix, xcoders.from.username!);
   const markupButton = buttonHelp(xcoders.from.id, cache, 'All');
   try {
      await xcoders.editMessageText(displayMenu, { parse_mode: 'MarkdownV2', reply_markup: markupButton });
   } catch (error) {
      await xcoders.reply(displayMenu, { parse_mode: 'MarkdownV2', reply_markup: markupButton });
   }
});

app.action('input_text', inputTextCallbackQuery);

app.on('callback_query', async (xcoders) => {
   try {
      const callbackData = (xcoders.update.callback_query as CallbackQuery.DataQuery)!.data.split('-');
      const command = callbackData[0];
      const id = callbackData[1];
      const getMenuFromCache = cache.Commands[command];
      const displayMenu = command === 'All' ? helpService(prefix, xcoders.from.username!) : displayMenuFromCallback(prefix, xcoders.from.username!, getMenuFromCache);
      const markupButton = buttonHelp(xcoders.from.id, cache, command);
      try {
         await xcoders.editMessageText(displayMenu, { parse_mode: 'MarkdownV2', reply_markup: markupButton });
      } catch (error) {
         await xcoders.reply(displayMenu, { parse_mode: 'MarkdownV2', reply_markup: markupButton });
      }
   } catch (error: any) {
      console.error(error);
      await xcoders.reply(error.message);
   }
});

app.on('message', async (xcoders) => {
   try {
      const m = client(xcoders);
      const command = m.args?.split(' ')[0].slice(1);
      const query = (m.args!.split(' ')[1] || '')?.trim();
      const isCommand = m.args!.startsWith(prefix);
      const getCurrentTime = moment(new Date()).locale(m.language_code || 'id').format('HH:mm');

      if (isCommand) {
         if (m.is_bot) return;
         console.log(chalk.bgBlack.red.italic.bold(getCurrentTime), chalk.bold.italic.green(`[ CMD ${command} ]`), chalk.italic.greenBright.bold('From'), chalk.bold.italic.yellow(m.username), m.type !== 'private' ? chalk.italic.bold.greenBright('in ') + chalk.italic.bold.yellow(m.first_name) : '');
      }
      if (!isCommand) {
         console.log(chalk.bgBlack.italic.red.bold(getCurrentTime), chalk.italic.red('[ MSG ]'), chalk.bold.italic.greenBright('From'), chalk.italic.bold.yellow(m.username), m.type !== 'private' ? chalk.italic.bold.greenBright('in ') + chalk.italic.bold.yellow(m.first_name) : '');
      }

      if (m.args?.startsWith('=>') && m.is_owner) {
         try {
            const evaling = await eval(`;(async () => {
               return ${m.args!.slice(3)}
            })();`);
            const utilites = util.format(evaling);
            const formatText = await replyWithFormatText(utilites);
            await xcoders.reply(formatText);
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
               if (Functions.private && !m.is_owner) return xcoders.reply('_Private Fitur, Tunggu owner memperbaiki fitur ini..._', { parse_mode: 'Markdown' });
               if (Functions.query && (!query || query?.includes('--usage'))) {
                  const caption = styleMessage(Functions.description, `• Usage: ${Functions.usage.replace('%cmd%', prefix + command)}`);
                  return xcoders.reply(caption, { parse_mode: 'Markdown' });
               } else {
                  if (Functions.text && url(query!)) return xcoders.reply(`_Query yang dibutuhkan command ${prefix + command} adalah sebuah teks..._`, { parse_mode: 'Markdown' });
                  if (Functions.url) {
                     if (!url(query!)) {
                        return xcoders.reply(`_Query yang dibutuhkan command ${prefix + command} adalah sebuah url..._`, { parse_mode: 'Markdown' });
                     } else if (Functions.image) {
                        if (!(await checkContentType(query!, 'image'))) return xcoders.reply('Invalid type url');
                     } else if (Functions.video) {
                        if (!(await checkContentType(query!, 'video'))) return xcoders.reply('Query yang dibutuhkan adalah URL video yang valid.');
                     } else if (Functions.audio) {
                        if (!(await checkContentType(query!, 'audio'))) return xcoders.reply('Query yang dibutuhkan adalah URL audio yang valid.');
                     }
                  }
               }
               if (Functions.owner && !m.is_owner) return xcoders.reply('_Fitur ini khusus untuk owner..._', { parse_mode: 'Markdown' });
               if (Functions.onlyGroup && m.type === 'private') return xcoders.reply(`Fitur ${command} hanya bisa digunakan didalam group`);
               if (Functions.media && !m.is_media) {
                  if (Functions.photo) return xcoders.reply('_Reply atau kirim photo untuk menggunakan fitur ini..._', { parse_mode: 'Markdown' });
                  if (Functions.video) return xcoders.reply('_Reply atau kirim video untuk menggunakan fitur ini..._', { parse_mode: 'Markdown' });
                  return xcoders.reply(`Reply atau kirim media photo atau video dan caption ${prefix + command}`);
               }
               return Functions.execute({ xcoders, errorMessage, m, command, query });
            }
         }
      }
   } catch (error: any) {
      logger.error(error);
      await xcoders.reply(error.message, { parse_mode: 'Markdown', disable_notification: true });
   }
});

app.catch((error) => console.error(error));

app.launch(() => console.log(chalk.bgRedBright.green.bold(' Bot started... '), '\n'));

process.once('SIGINT', () => app.stop('SIGINT'));
process.once('SIGTERM', () => app.stop('SIGTERM'));