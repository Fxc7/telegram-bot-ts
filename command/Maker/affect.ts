import { Context } from 'telegraf';
import { Update } from 'telegraf/types';

import { getBuffer } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['affect'],
   command: /^(affect)$/i,
   description: 'Generate photo meme Affect',
   usage: '%cmd%',
   media: true,
   photo: true,
   execute: async ({ xcoders, m, errorMessage }: { xcoders: Context, m: Client, errorMessage: (xcoders: Context<Update>, message: string, error: any) => Promise<void> }) => {
      try {
         const length = m.media!.photo.length;
         const fileId = m.media!.photo[length - 1].file_id!;
         const fileUrl = await xcoders.telegram.getFileLink(fileId);
         const response = await getBuffer(`${m.base_url}/api/maker/affect?url=${fileUrl.toString()}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { source: response }, { caption: 'Affect Photo Successfully' });
      } catch (error) {
         return errorMessage(xcoders, 'Error generate Affect photo, hubungi owner untuk memperbaiki fitur ini...', error);
      }
   }
};