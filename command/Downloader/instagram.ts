import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { Context } from 'telegraf';

import { media } from '../../configs/regex.js';
import { convertToBuffer, zipFolder, sendDocument } from '../../library/functions.js';

export default {
   show: ['ig < url >'],
   command: /^(ig|igdl|instagram)$/i,
   description: 'Download media from Instagram Url',
   query: true,
   url: true,
   usage: '%cmd% url Instagram.',
   execute: async ({ query, baseURL, apikey, id, app, xcoders }: { query: string, baseURL: string, apikey: string, id: string, username: string, app: Context, xcoders: Context }) => {
      try {
         if (!query) return xcoders.reply('Masukkan url tiktok');
         if (!media(query)) return xcoders.reply('invalid url tiktok, masukkan url dengan benar...');
         const response = await fetch(`${baseURL}/api/download/instagram?url=${query}&apikey=${apikey}`).then((response) => response.json());
         await xcoders.reply('Tunggu sebentar...');
         if (typeof response.result!.url === 'string') {
            await app.telegram.sendVideo(id, response.result.url, { has_spoiler: true });
         } else {
            const pathFolder = path.join(process.cwd(), `instagram_result_${Date.now()}`);
            const pathZip = path.join(process.cwd(), `Instagram Result @${xcoders.from?.username}.zip`);

            if (!fs.existsSync(pathFolder)) fs.mkdirSync(pathFolder);
            if (!fs.existsSync(path.join(pathFolder, 'photos'))) fs.mkdirSync(path.join(pathFolder, 'photos'));
            if (!fs.existsSync(path.join(pathFolder, 'videos'))) fs.mkdirSync(path.join(pathFolder, 'videos'));

            for (let { type, url } of response.result) {
               const buffer = await fetch(url).then((response) => response.arrayBuffer());
               const result = convertToBuffer(buffer);
               if (type === 'photo') {
                  await fs.promises.writeFile(path.join(pathFolder, 'photos', `${crypto.randomUUID()}.jpeg`), result);
               } else {
                  await fs.promises.writeFile(path.join(pathFolder, 'videos', `${crypto.randomUUID()}.mp4`), result);
               }
            }
            await zipFolder(pathFolder, pathZip, async (error: string | null, message: string) => {
               if (error) await xcoders.reply(error);
               execSync(`rm -rf "${pathFolder}"`);
               if (fs.existsSync(pathZip)) return sendDocument(id, pathZip, `Insatagram Result @${xcoders.from?.username}.zip`);
            });
         }
      } catch (error: any) {
         console.error(error);
         throw 'Error download media instagram, silahkan lapor ke owner untuk memperbaiki fitur tersebut...';
      }
   }
};