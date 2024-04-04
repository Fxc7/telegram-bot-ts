import { Context } from 'telegraf';

import { media } from '../../configs/regex.js';
import { getBuffer, getJson } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['capcut'],
   command: /^(ccdl|capcut)$/i,
   description: 'Download Video Capcut template',
   query: true,
   url: true,
   usage: '%cmd% url template capcut.',
   execute: async ({ query, xcoders, m }: { query: string, username: string, xcoders: Context, m: Client }) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url Capcut, masukkan url dengan benar...');
         const url = await fetch(query).then((response) => response.url);
         const response = await getJson(`${m.base_url}/api/download/capcut?url=${url}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.sendVideo({ source: await getBuffer(response.result.url) }, { caption: response.result.title + response.result.description, has_spoiler: true });
      } catch (error: any) {
         console.error(error);
         return xcoders.reply('Error download Video capcut, silahkan lapor ke owner untuk memperbaiki fitur tersebut...');
      }
   }
};