import { Context } from 'telegraf';

import { getBuffer } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['facts'],
   command: /^(facts|funfact)$/i,
   description: 'Generate funfacts text meme',
   query: true,
   usage: '%cmd% xcoders',
   execute: async ({ xcoders, m, query }: { query: string, xcoders: Context, m: Client }) => {
      try {
         const response = await getBuffer(`${m.base_url}/api/maker/facts?text=${query}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { source: response }, { caption: 'Funfacts Successfully' });
      } catch (error) {
         console.error(error);
         return xcoders.reply('Error create funfacts photo, hubungi owner untuk memperbaiki fitur ini...');
      }
   }
};