import { getBuffer } from '../../library/functions.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';

export default {
   show: ['rip'],
   command: /^(rip)$/i,
   description: 'Generate photo meme RIP',
   usage: '%cmd%',
   media: true,
   photo: true,
   execute: async ({ xcoders, m, languages }: Execute) => {
      try {
         const length = m.media!.photo.length;
         const fileId = m.media!.photo[length - 1].file_id!;
         const fileUrl = await xcoders.telegram.getFileLink(fileId);
         const response = await getBuffer(`${m.base_url}/api/maker/rip?url=${fileUrl.toString()}&apikey=${m.api_key}`);
         await waitingMessage(xcoders, 'upload_photo', languages.waiting_message);
         return xcoders.sendPhoto({ source: response }, { caption: '_RIP Meme Photo Successfully..._', parse_mode: 'Markdown' });
      } catch (error) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error generate RIP meme'), error);
      }
   }
};