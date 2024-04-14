import path from 'path';
import util from 'util';
import chalk from 'chalk';
import moment from 'moment-timezone';
import { Telegraf } from 'telegraf';
import { session } from 'telegraf/session';

import loadCommand from './loadCommand.js';
import logger from './library/logger.js';
import client from './middleware/client.js';
import { token, prefix } from './configs/env.js';
import { url } from './configs/regex.js';
import { checkContentType, getLanguages, requireJson } from './library/functions.js';
import { buttonStart, styleMessage, replyWithFormatText, helpService, start_service, buttonHelp, displayMenuFromCallback } from './middleware/service.js';
import { MyContext, callbackQuery } from './types/index.js';

let cache = Function('return this')();
cache.commander = requireJson(path.join(process.cwd(), 'output', 'database', 'commands.json'));
cache.Commands = {};
cache.headersCommands = [];
cache.allCommands = [];
cache.plugins = {};
cache.session_languages = {};
cache.wizard_session = {};

loadCommand(cache);
const app = new Telegraf<MyContext>(token, { handlerTimeout: Infinity });
app.use(session({ property: 'session' }));

app.start(async (xcoders) => {
   const context = client(xcoders);
   cache.session_languages[context.id] = getLanguages(context.language_code!);
   const displayMenu = start_service(context.username! || 'unknown', cache.session_languages[context.id].start_service);
   await xcoders.reply(displayMenu, { parse_mode: 'Markdown', reply_markup: buttonStart.reply_markup });
   await xcoders.deleteMessage();
});

app.help(async (xcoders) => {
   const context = client(xcoders);
   if (!cache.session_languages[context.id]) cache.session_languages[context.id] = getLanguages(context.language_code!);
   const displayMenu = helpService(prefix, context.username! || 'unknown', cache.session_languages[context.id]);
   const markupButton = buttonHelp(context.id, cache, 'All');
   try {
      await xcoders.editMessageText(displayMenu, { parse_mode: 'MarkdownV2', reply_markup: markupButton });
   } catch (error) {
      await xcoders.reply(displayMenu, { parse_mode: 'MarkdownV2', reply_markup: markupButton });
      await xcoders.deleteMessage();
   }
});

app.on('callback_query', async (xcoders) => {
   try {
      if (!cache.session_languages[xcoders.from.id]) cache.session_languages[xcoders.from.id] = getLanguages(xcoders.from.language_code!);
      const languages = cache.session_languages[xcoders.from.id];
      const callbackData = (xcoders.update.callback_query as callbackQuery.DataQuery)!.data.split('-');
      const id_message = xcoders.callbackQuery.from.id || xcoders.from.id;
      const command = callbackData[0];
      const id = callbackData[1];
      if (id_message !== Number(id)) return xcoders.answerCbQuery('Silahkan anda mencoba request sendiri dengan ketik /help', { show_alert: true });
      const getMenuFromCache = cache.Commands[command];
      const displayMenu = command === 'All' ? helpService(prefix, xcoders.from.username! || 'unknown', languages) : displayMenuFromCallback(prefix, xcoders.from.username! || 'unknown', getMenuFromCache, languages);
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
      if (!cache.session_languages[m.id]) cache.session_languages[m.id] = getLanguages(m.language_code!);
      const languages = cache.session_languages[m.id];
      const command = m.args?.split(' ')[0].slice(1);
      const query = (m.args?.split(' ')[1] || '').trim();
      const isCommand = m.args?.startsWith(prefix);
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
               if (Functions.private && !m.is_owner) return xcoders.reply(languages.command.private_features, { parse_mode: 'Markdown' });
               if (Functions.query && (!query || query?.includes('--usage'))) {
                  const caption = styleMessage(Functions.description, `• Usage: ${Functions.usage.replace('%cmd%', prefix + command)}`);
                  return xcoders.reply(caption, { parse_mode: 'Markdown' });
               } else {
                  if (Functions.text && url(query!)) return xcoders.reply(languages.command.text_features.replace('%%', prefix + command), { parse_mode: 'Markdown' });
                  if (Functions.url) {
                     if (!url(query!)) {
                        return xcoders.reply(languages.command.url_features.replace('%%', prefix + command), { parse_mode: 'Markdown' });
                     } else if (Functions.image) {
                        if (!(await checkContentType(query!, 'image'))) return xcoders.reply(languages.command.url_image_features);
                     } else if (Functions.video) {
                        if (!(await checkContentType(query!, 'video'))) return xcoders.reply(languages.command.url_video_features);
                     } else if (Functions.audio) {
                        if (!(await checkContentType(query!, 'audio'))) return xcoders.reply(languages.command.url_audio_features);
                     }
                  }
               }
               if (Functions.owner && !m.is_owner) return xcoders.reply(languages.command.owner_features, { parse_mode: 'Markdown' });
               if (Functions.onlyGroup && m.type === 'private') return xcoders.reply(languages.command.group_only_features.replace('%%', command));
               if (Functions.media && !m.is_media) {
                  if (Functions.photo) return xcoders.reply(languages.command.media_photo_features.replace('%%', prefix + command), { parse_mode: 'Markdown' });
                  if (Functions.video) return xcoders.reply(languages.command.media_video_features.replace('%%', prefix + command), { parse_mode: 'Markdown' });
                  return xcoders.reply(languages.command.media_features.replace('%%', prefix + command));
               }
               return Functions.execute({ xcoders, m, command, query, languages });
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