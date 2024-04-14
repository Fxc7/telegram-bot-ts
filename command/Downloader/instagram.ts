import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { fileTypeFromBuffer } from 'file-type';

import { media } from '../../configs/regex.js';
import { zipFolder, getBuffer, getJson } from '../../library/functions.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';

export default {
   show: ['ig'],
   command: /^(ig|igdl|instagram)$/i,
   description: 'Download media Instagram',
   query: true,
   url: true,
   usage: '%cmd% url Instagram.',
   execute: async ({ query, xcoders, m, languages }: Execute) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url Instagram, masukkan url dengan benar...');
         const response = await getJson(`${m.base_url}/api/download/instagram?url=${query}&apikey=${m.api_key}`);
         if (typeof response.result?.url === 'string') {
            const buffer = await getBuffer(response.result.url);
            const type = await fileTypeFromBuffer(buffer);
            if (/video/.test(type?.mime!)) {
               await waitingMessage(xcoders, 'record_video', languages.waiting_message);
               xcoders.sendVideo({ source: buffer }, { caption: 'Successfully download video', has_spoiler: true });
            } else {
               await waitingMessage(xcoders, 'upload_photo', languages.waiting_message);
               return xcoders.sendPhoto({ source: buffer }, { caption: 'Successfully download Photo', has_spoiler: true });
            }
         } else {
            const pathFolder = path.join(process.cwd(), `instagram_result_${Date.now()}`);
            const pathZip = path.join(process.cwd(), `Instagram Result @${xcoders.from?.username}.zip`);
            
            if (!fs.existsSync(pathFolder)) fs.mkdirSync(pathFolder);
            if (!fs.existsSync(path.join(pathFolder, 'photos'))) fs.mkdirSync(path.join(pathFolder, 'photos'));
            if (!fs.existsSync(path.join(pathFolder, 'videos'))) fs.mkdirSync(path.join(pathFolder, 'videos'));
            
            for (let { type, url } of response.result) {
               const buffer = await getBuffer(url);
               if (type === 'photo') {
                  await fs.promises.writeFile(path.join(pathFolder, 'photos', `${crypto.randomUUID()}.jpeg`), buffer);
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
                  return xcoders.sendDocument({ source: buffer, filename: `Instagram Result @${xcoders.from?.username}.zip` }, { caption: message }).catch((error) => error);
               }
            });
         }
      } catch (error: any) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error download media Instagram'), error);
      }
   }
};