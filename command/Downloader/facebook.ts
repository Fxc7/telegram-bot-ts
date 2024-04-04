import { Context } from 'telegraf';
import { Update } from 'telegraf/types';

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
   execute: async ({ query, xcoders, m, errorMessage }: { query: string, username: string, xcoders: Context, m: Client, errorMessage: (xcoders: Context<Update>, message: string, error: any) => Promise<void> }) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url Facebook, masukkan url dengan benar...');
         const response = await getJson(`${m.base_url}/api/download/facebook?url=${query}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.sendVideo({ source: await getBuffer(response.result.hd) }, { caption: response.result.title, has_spoiler: true });
      } catch (error: any) {
         return errorMessage(xcoders, 'Error download Video facebook, silahkan lapor ke owner untuk memperbaiki fitur tersebut...', error);
      }
   }
};