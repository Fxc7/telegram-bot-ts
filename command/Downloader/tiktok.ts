import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { Context } from 'telegraf';

import { media } from '../../configs/regex.js';
import { zipFolder, getBuffer } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['tiktok'],
   command: /^(ttdl|tiktok|tt)$/i,
   description: 'Download media from Tiktok Url',
   query: true,
   url: true,
   usage: '%cmd% url tiktok.',
   execute: async ({ query, xcoders, m }: { query: string, xcoders: Context, m: Client }) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url tiktok, masukkan url dengan benar...');
         const response = await fetch(`${m.base_url}/api/download/tiktok?url=${query}&apikey=${m.api_key}`).then((response) => response.json());
         if (response.status) await xcoders.reply('Tunggu sebentar...');
         if (response.result.type === 'video') {
            return xcoders.sendVideo({ source: await getBuffer(response.result.url[0]) }, { caption: response.result.caption, has_spoiler: true });
         } else {
            const pathFolder = path.join(process.cwd(), `Tiktok_result_${Date.now()}`);
            const pathZip = path.join(process.cwd(), `Tiktok Result @${xcoders.from?.username}.zip`);

            if (!fs.existsSync(pathFolder)) fs.mkdirSync(pathFolder);
            if (!fs.existsSync(path.join(pathFolder, 'photos'))) fs.mkdirSync(path.join(pathFolder, 'photos'));
            if (!fs.existsSync(path.join(pathFolder, 'music'))) fs.mkdirSync(path.join(pathFolder, 'music'));

            if (response.result.audio_url.startsWith('http')) {
               const buffer = await getBuffer(response.result.audio_url);
               await fs.promises.writeFile(path.join(pathFolder, 'music', `${response.result.audio_name}.mp3`), buffer);
            }

            for (let image of response.result.url) {
               const buffer = await getBuffer(image);
               await fs.promises.writeFile(path.join(pathFolder, 'photos', `${crypto.randomUUID()}.jpeg`), buffer);
            }
            await zipFolder(pathFolder, pathZip, async (error: string | null, message: string) => {
               if (error) await xcoders.reply(error);
               execSync(`rm -rf "${pathFolder}"`);
               if (fs.existsSync(pathZip)) {
                  const buffer = await fs.promises.readFile(pathZip);
                  await fs.promises.unlink(pathZip);
                  return xcoders.sendDocument({ source: buffer, filename: `Tiktok Result @${xcoders.from?.username}.zip` }, { caption: message }).catch((error) => error);
               }
            });
         }
      } catch (error: any) {
         console.error(error);
         return xcoders.reply('Error download media tiktok, silahkan lapor ke owner untuk memperbaiki fitur tersebut...');
      }
   }
};