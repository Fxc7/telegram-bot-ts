import { Context } from 'telegraf';
import { Message } from 'telegraf/types';

import { getJson } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['upscale'],
   command: /^(hd|upscale|remini)$/i,
   description: 'Upscale image to HD',
   usage: '%cmd%',
   execute: async ({ xcoders, m }: { xcoders: Context, m: Client }) => {
      try {
         if (!m.quoted) return xcoders.reply('Reply photo untuk menggunakan fitur ini.');
         const objectFile = (m.quoted as Message.PhotoMessage).photo[3] || (m.quoted as Message.PhotoMessage).photo[2] || (m.quoted as Message.PhotoMessage).photo[1] || (m.quoted as Message.PhotoMessage).photo[0];
         const fileUrl = await xcoders.telegram.getFileLink(objectFile.file_id);
         const response = await getJson(`${m.base_url}/api/maker/upscale?url=${fileUrl.toString()}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { url: response.result.url }, { caption: 'Upscale Photo Successfully' });
      } catch (error) {
         console.error(error);
         return xcoders.reply('Error Upscale Photo, hubungi owner untuk memperbaiki fitur ini...');
      }
   }
};