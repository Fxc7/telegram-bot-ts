import util from 'util';
import chalk from 'chalk';
import moment from 'moment-timezone';
import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';

import { baseURL, owner, token, apikey, prefix } from './configs/env.js';
import { allmenu } from './library/service.js';

const app = new Telegraf(token);

const keyboard = Markup.inlineKeyboard([
   Markup.button.url('Rest API', baseURL),
   Markup.button.url('Owner Bot', `https://t.me/+${owner[0]}`)
]);

app.start((xcoders) => xcoders.reply(allmenu(prefix, xcoders.from.first_name + ' ' + xcoders.from.last_name || ''), keyboard));
app.help((xcoders) => xcoders.reply(allmenu(prefix, xcoders.from.first_name + ' ' + xcoders.from.last_name || ''), keyboard));

app.on(message('text'), async (xcoders) => {
   try {
      const command = xcoders.text?.split(' ')[0].slice(1);
      const query = xcoders.text?.split(' ')[1]?.trim();
      const isCommand = xcoders.text?.startsWith(prefix);
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

      switch (command) {
         case 'tiktok':
            try {
               if (!query) return xcoders.reply('Masukkan url tiktok');
               const response = await fetch(`${baseURL}/api/download/tiktok?url=${query}&apikey=${apikey}`).then((response) => response.json());
               await xcoders.reply('Tunggu sebentar...');
               await app.telegram.sendVideo(id, response.result.url[0], { caption: response.result.caption, has_spoiler: true });
            } catch (error) {
               throw 'Error download video, silahkan lapor ke owner untuk memperbaiki fitur tersebut...';
            }
            break;

         default:
      }
   } catch (error: any) {
      console.log(error);
      await xcoders.reply(error.message);
   }
});

app.launch(() => console.log(chalk.bgRedBright.green.bold(' Bot started... '), '\n'));