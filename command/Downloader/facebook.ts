import { Context } from 'telegraf';

import { media } from '../../configs/regex.js';
import { getBuffer, getJson } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['facebook'],
   command: /^(fb|fbdl|facebook)$/i,
   description: 'Download Video Facebook',
   query: true,
   url: true,
   usage: '%cmd% url facebook.',
   execute: async ({ query, xcoders, m }: { query: string, username: string, xcoders: Context, m: Client }) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url Facebook, masukkan url dengan benar...');
         const response = await getJson(`${m.base_url}/api/download/facebook?url=${query}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.sendVideo({ source: await getBuffer(response.result.hd) }, { caption: response.result.title, has_spoiler: true });
      } catch (error: any) {
         console.error(error);
         return xcoders.reply('Error download Video facebook, silahkan lapor ke owner untuk memperbaiki fitur tersebut...');
      }
   }
};