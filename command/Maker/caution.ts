import { Context } from 'telegraf';

import { getBuffer } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['caution'],
   command: /^caution$/i,
   description: 'Generate Caution text',
   query: true,
   usage: '%cmd% xcoders',
   execute: async ({ xcoders, m, query }: { query: string, xcoders: Context, m: Client }) => {
      try {
         const response = await getBuffer(`${m.base_url}/api/maker/caution?text=${query}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { source: response }, { caption: 'Caution Successfully' });
      } catch (error) {
         console.error(error);
         return xcoders.reply('Error create Caution photo, hubungi owner untuk memperbaiki fitur ini...');
      }
   }
};