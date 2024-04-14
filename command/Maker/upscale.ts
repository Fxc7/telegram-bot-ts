import { getJson } from '../../library/functions.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';

export default {
   show: ['upscale'],
   command: /^(hd|upscale|remini)$/i,
   description: 'Upscale image to HD',
   usage: '%cmd%',
   media: true,
   photo: true,
   execute: async ({ xcoders, m, languages }: Execute) => {
      try {
         const length = m.media!.photo.length;
         const fileId = m.media!.photo[length - 1].file_id!;
         const fileUrl = await xcoders.telegram.getFileLink(fileId);
         const response = await getJson(`${m.base_url}/api/maker/upscale?url=${fileUrl.toString()}&apikey=${m.api_key}`);
         await waitingMessage(xcoders, 'upload_photo', languages.waiting_message);
         return xcoders.sendPhoto({ url: response.result.url }, { caption: '_Upscale Photo Successfully..._', parse_mode: 'Markdown' });
      } catch (error) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error Upscale Photo'), error);
      }
   }
};