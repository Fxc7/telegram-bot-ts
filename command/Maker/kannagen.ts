import { Context } from 'telegraf';
import { Update } from 'telegraf/types';

import { getBuffer } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['kannagen'],
   command: /^kannagen$/i,
   description: 'Generate kannagen text meme',
   query: true,
   usage: '%cmd% xcoders',
   execute: async ({ xcoders, m, query, errorMessage }: { query: string, xcoders: Context, m: Client, errorMessage: (xcoders: Context<Update>, message: string, error: any) => Promise<void> }) => {
      try {
         const response = await getBuffer(`${m.base_url}/api/maker/kannagen?text=${query}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { source: response }, { caption: 'Kannagen Successfully' });
      } catch (error) {
         return errorMessage(xcoders, 'Error create kannagen photo, hubungi owner untuk memperbaiki fitur ini...', error);
      }
   }
};