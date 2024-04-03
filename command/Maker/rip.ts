import { Context } from 'telegraf';
import { Message } from 'telegraf/types';

import { getBuffer } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['rip'],
   command: /^(rip)$/i,
   description: 'Generate photo meme RIP',
   usage: '%cmd%',
   execute: async ({ xcoders, m }: { xcoders: Context, m: Client }) => {
      try {
         if (!m.quoted) return xcoders.reply('Reply photo untuk menggunakan fitur ini.');
         const objectFile = (m.quoted as Message.PhotoMessage).photo[3] || (m.quoted as Message.PhotoMessage).photo[2] || (m.quoted as Message.PhotoMessage).photo[1] || (m.quoted as Message.PhotoMessage).photo[0];
         const fileUrl = await xcoders.telegram.getFileLink(objectFile.file_id);
         const response = await getBuffer(`${m.base_url}/api/maker/rip?url=${fileUrl.toString()}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         return xcoders.telegram.sendPhoto(m.id, { source: response }, { caption: 'RIP Meme Photo Successfully' });
      } catch (error) {
         console.error(error);
         return xcoders.reply('Error generate RIP meme, hubungi owner untuk memperbaiki fitur ini...');
      }
   }
};