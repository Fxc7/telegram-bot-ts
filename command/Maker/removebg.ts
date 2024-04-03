import { Context } from 'telegraf';
import { Message } from 'telegraf/types';

import { getBuffer } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['rmbg'],
   command: /^(rmbg|removebg)$/i,
   description: 'Delete Background picture',
   usage: '%cmd%',
   execute: async ({ xcoders, m }: { query: string, xcoders: Context, m: Client }) => {
      try {
         const objectFile = (m.quoted as Message.PhotoMessage).photo[3] || (m.quoted as Message.PhotoMessage).photo[2] || (m.quoted as Message.PhotoMessage).photo[1] || (m.quoted as Message.PhotoMessage).photo[0];
         const fileUrl = await xcoders.telegram.getFileLink(objectFile.file_id);
         const response = await getBuffer(`${m.base_url}/api/maker/remove-bg?url=${fileUrl.toString()}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { source: response }, { caption: 'Remove Background Photo Successfully' });
      } catch (error) {
         console.error(error);
         return xcoders.reply('Error Converting image to hd scale, hubungi owner untuk memperbaiki fitur ini...');
      }
   }
};

