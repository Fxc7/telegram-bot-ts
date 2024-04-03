import { Context } from 'telegraf';

import { getBuffer } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['drake'],
   command: /^drake$/i,
   description: 'Generate drake meme text',
   query: true,
   usage: '%cmd% tes1|tes2',
   execute: async ({ xcoders, m, query }: { query: string, xcoders: Context, m: Client }) => {
      try {
         const [text, text2] = query.split('|');
         const response = await getBuffer(`${m.base_url}/api/maker/drake?text=${text}&text2=${text2}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { source: response }, { caption: 'Drake MEME Successfully' });
      } catch (error) {
         console.error(error);
         return xcoders.reply('Error Create image drake meme, hubungi owner untuk memperbaiki fitur ini...');
      }
   }
};