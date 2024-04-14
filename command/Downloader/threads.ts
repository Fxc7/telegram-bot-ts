import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { Context } from 'telegraf';

import { media } from '../../configs/regex.js';
import { zipFolder, getBuffer, getJson } from '../../library/functions.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';

export default {
   show: ['threads'],
   command: /^threads?$/i,
   description: 'Download media Threads',
   query: true,
   url: true,
   usage: '%cmd% url Twitter.',
   execute: async ({ query, xcoders, m, languages }: Execute) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url Threads, masukkan url dengan benar...');
         const response = await getJson(`${m.base_url}/api/download/threads?url=${query}&apikey=${m.api_key}`);
         if (response.result.type !== 'sidebar') {
            const buffer = await getBuffer(response.result.data.url);
            if (/video/.test(response.result.type)) {
               await waitingMessage(xcoders, 'record_video', languages.waiting_message);
               xcoders.sendVideo({ source: buffer }, { caption: response.result.caption, has_spoiler: true });
            } else {
               await waitingMessage(xcoders, 'upload_photo', languages.waiting_message);
               return xcoders.sendPhoto({ source: buffer }, { caption: response.result.caption, has_spoiler: true });
            }
         } else {
            const pathFolder = path.join(process.cwd(), `threads_result_${Date.now()}`);
            const pathZip = path.join(process.cwd(), `Threads Result @${xcoders.from?.username}.zip`);

            if (!fs.existsSync(pathFolder)) fs.mkdirSync(pathFolder);
            if (!fs.existsSync(path.join(pathFolder, 'images'))) fs.mkdirSync(path.join(pathFolder, 'images'));
            if (!fs.existsSync(path.join(pathFolder, 'videos'))) fs.mkdirSync(path.join(pathFolder, 'videos'));
            
            for (let { type, url } of response.result.data) {
               const buffer = await getBuffer(url);
               if (type === 'image') {
                  await fs.promises.writeFile(path.join(pathFolder, 'images', `${crypto.randomUUID()}.jpeg`), buffer);
               } else {
                  await fs.promises.writeFile(path.join(pathFolder, 'videos', `${crypto.randomUUID()}.mp4`), buffer);
               }
            }
            await waitingMessage(xcoders, 'upload_document', languages.waiting_message);
            await zipFolder(pathFolder, pathZip, async (error: string | null, message: string) => {
               if (error) await xcoders.reply(error);
               execSync(`rm -rf "${pathFolder}"`);
               if (fs.existsSync(pathZip)) {
                  const buffer = await fs.promises.readFile(pathZip);
                  await fs.promises.unlink(pathZip);
                  return xcoders.sendDocument({ source: buffer, filename: `Threads Result @${xcoders.from?.username}.zip` }, { caption: message }).catch((error) => error);
               }
            });
         }
      } catch (error: any) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error download media threads'), error);
      }
   }
};