import { Context } from 'telegraf';

import { media } from '../../configs/regex.js';
import { getJson } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['ytshort'],
   command: /^ytsh?ort$/i,
   description: 'Download Video from Youtube Short',
   query: true,
   url: true,
   usage: '%cmd% url Youtube Short.',
   execute: async ({ query, xcoders, m }: { query: string, username: string, xcoders: Context, m: Client }) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url Youtube Short, masukkan url dengan benar...');
         const response = await getJson(`${m.base_url}/api/download/youtube-short?url=${query}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.sendVideo({ url: response.result.url }, { caption: response.result.title, has_spoiler: true });
      } catch (error: any) {
         console.error(error);
         return xcoders.reply('Error download Video Youtube Short, silahkan lapor ke owner untuk memperbaiki fitur tersebut...');
      }
   }
};