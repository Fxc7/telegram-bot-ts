import { Context } from 'telegraf';
import { Update } from 'telegraf/types';

import { getBuffer } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['caution'],
   command: /^caution$/i,
   description: 'Generate Caution text',
   query: true,
   usage: '%cmd% xcoders',
   execute: async ({ xcoders, m, query, errorMessage }: { query: string, xcoders: Context, m: Client, errorMessage: (xcoders: Context<Update>, message: string, error: any) => Promise<void> }) => {
      try {
         const response = await getBuffer(`${m.base_url}/api/maker/caution?text=${query}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { source: response }, { caption: 'Caution Successfully' });
      } catch (error) {
         return errorMessage(xcoders, 'Error create Caution photo, hubungi owner untuk memperbaiki fitur ini...', error);
      }
   }
};