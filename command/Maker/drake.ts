import { getBuffer } from '../../library/functions.js';
import { Execute } from '../../types/index.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';

export default {
   show: ['drake'],
   command: /^drake$/i,
   description: 'Generate drake meme text',
   query: true,
   usage: '%cmd% tes1|tes2',
   execute: async ({ xcoders, m, query, languages }: Execute) => {
      try {
         const [text, text2] = query.split('|');
         const response = await getBuffer(`${m.base_url}/api/maker/drake?text=${text}&text2=${text2}&apikey=${m.api_key}`);
         await waitingMessage(xcoders, 'upload_photo', languages.waiting_message);
         return xcoders.sendPhoto({ source: response }, { caption: '_Drake MEME Successfully..._', parse_mode: 'Markdown' });
      } catch (error) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error Create image drake meme'), error);
      }
   }
};