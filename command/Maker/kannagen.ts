import { Context } from 'telegraf';

import { getBuffer } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['kannagen'],
   command: /^kannagen$/i,
   description: 'Generate kannagen text meme',
   query: true,
   usage: '%cmd% xcoders',
   execute: async ({ xcoders, m, query }: { query: string, xcoders: Context, m: Client }) => {
      try {
         const response = await getBuffer(`${m.base_url}/api/maker/kannagen?text=${query}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { source: response }, { caption: 'Kannagen Successfully' });
      } catch (error) {
         console.error(error);
         return xcoders.reply('Error create kannagen photo, hubungi owner untuk memperbaiki fitur ini...');
      }
   }
};