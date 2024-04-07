import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileTypeFromBuffer } from 'file-type';
import { execSync } from 'child_process';
import { Context } from 'telegraf';
import { Update } from 'telegraf/types';

import { media } from '../../configs/regex.js';
import { zipFolder, getBuffer, getJson } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['ig'],
   command: /^(ig|igdl|instagram)$/i,
   description: 'Download media from Instagram Url',
   query: true,
   url: true,
   usage: '%cmd% url Instagram.',
   execute: async ({ query, xcoders, m, errorMessage }: { query: string, username: string, xcoders: Context, m: Client, errorMessage: (xcoders: Context<Update>, message: string, error: any) => Promise<void> }) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url Instagram, masukkan url dengan benar...');
         const response = await getJson(`${m.base_url}/api/download/instagram?url=${query}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         if (typeof response.result?.url === 'string') {
            const buffer = await getBuffer(response.result.url);
            const type = await fileTypeFromBuffer(buffer);
            if (/video/.test(type?.mime!)) return xcoders.sendVideo({ source: buffer }, { caption: 'Successfully download video', has_spoiler: true });
            return xcoders.sendPhoto({ source: buffer }, { caption: 'Successfully download Photo', has_spoiler: true });
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
         return errorMessage(xcoders, 'Error download media instagram, silahkan lapor ke owner untuk memperbaiki fitur tersebut...', error);
      }
   }
};