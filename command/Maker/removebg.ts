import { Context } from 'telegraf';
import { Update } from 'telegraf/types';

import { getBuffer } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['rmbg'],
   command: /^(rmbg|removebg)$/i,
   description: 'Delete Background picture',
   usage: '%cmd%',
   execute: async ({ xcoders, m, errorMessage }: { xcoders: Context, m: Client, errorMessage: (xcoders: Context<Update>, message: string, error: any) => Promise<void> }) => {
      try {
         if (!m.is_media && m.media!.photo) return xcoders.reply('Reply atau kirim photo untuk menggunakan fitur ini.');
         const length = m.media!.photo.length;
         const fileId = m.media?.photo[length - 1].file_id!;
         const fileUrl = await xcoders.telegram.getFileLink(fileId);
         const response = await getBuffer(`${m.base_url}/api/maker/remove-bg?url=${fileUrl.toString()}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { source: response }, { caption: 'Remove Background Photo Successfully' });
      } catch (error) {
         return errorMessage(xcoders, 'Error Remove Background, hubungi owner untuk memperbaiki fitur ini...', error);
      }
   }
};