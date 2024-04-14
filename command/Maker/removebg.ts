import { getBuffer } from '../../library/functions.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';

export default {
   show: ['rmbg'],
   command: /^(rmbg|removebg)$/i,
   description: 'Delete Background picture',
   usage: '%cmd%',
   media: true,
   photo: true,
   execute: async ({ xcoders, m, languages }: Execute) => {
      try {
         const length = m.media!.photo.length;
         const fileId = m.media!.photo[length - 1].file_id!;
         const fileUrl = await xcoders.telegram.getFileLink(fileId);
         const response = await getBuffer(`${m.base_url}/api/maker/remove-bg?url=${fileUrl.toString()}&apikey=${m.api_key}`);
         await waitingMessage(xcoders, 'upload_photo', languages.waiting_message);
         return xcoders.sendPhoto({ source: response }, { caption: '_Remove Background Photo Successfully..._', parse_mode: 'Markdown' });
      } catch (error) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error Remove Background'), error);
      }
   }
};