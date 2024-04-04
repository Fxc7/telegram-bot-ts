import { Context } from 'telegraf';
import { Update } from 'telegraf/types';

import { getBuffer } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['facts'],
   command: /^(facts|funfact)$/i,
   description: 'Generate funfacts text meme',
   query: true,
   usage: '%cmd% xcoders',
   execute: async ({ xcoders, m, query, errorMessage }: { query: string, xcoders: Context, m: Client, errorMessage: (xcoders: Context<Update>, message: string, error: any) => Promise<void> }) => {
      try {
         const response = await getBuffer(`${m.base_url}/api/maker/facts?text=${query}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { source: response }, { caption: 'Funfacts Successfully' });
      } catch (error) {
         return errorMessage(xcoders, 'Error create funfacts photo, hubungi owner untuk memperbaiki fitur ini...', error);
      }
   }
};