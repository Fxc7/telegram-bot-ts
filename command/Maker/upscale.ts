import { Context } from 'telegraf';
import { Update } from 'telegraf/types';

import { getJson } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['upscale'],
   command: /^(hd|upscale|remini)$/i,
   description: 'Upscale image to HD',
   usage: '%cmd%',
   media: true,
   photo: true,
   execute: async ({ xcoders, m, errorMessage }: { xcoders: Context, m: Client, errorMessage: (xcoders: Context<Update>, message: string, error: any) => Promise<void> }) => {
      try {
         const length = m.media!.photo.length;
         const fileId = m.media!.photo[length - 1].file_id!;
         const fileUrl = await xcoders.telegram.getFileLink(fileId);
         const response = await getJson(`${m.base_url}/api/maker/upscale?url=${fileUrl.toString()}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { url: response.result.url }, { caption: 'Upscale Photo Successfully' });
      } catch (error) {
         return errorMessage(xcoders, 'Error Upscale Photo, hubungi owner untuk memperbaiki fitur ini...', error);
      }
   }
};