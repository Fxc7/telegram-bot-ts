import { Context } from 'telegraf';
import { Update } from 'telegraf/types';

import { getBuffer } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['rip'],
   command: /^(rip)$/i,
   description: 'Generate photo meme RIP',
   usage: '%cmd%',
   media: true,
   photo: true,
   execute: async ({ xcoders, m, errorMessage }: { xcoders: Context, m: Client, errorMessage: (xcoders: Context<Update>, message: string, error: any) => Promise<void> }) => {
      try {
         const length = m.media!.photo.length;
         const fileId = m.media!.photo[length - 1].file_id!;
         const fileUrl = await xcoders.telegram.getFileLink(fileId);
         const response = await getBuffer(`${m.base_url}/api/maker/rip?url=${fileUrl.toString()}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { source: response }, { caption: 'RIP Meme Photo Successfully' });
      } catch (error) {
         return errorMessage(xcoders, 'Error generate RIP meme, hubungi owner untuk memperbaiki fitur ini...', error);
      }
   }
};