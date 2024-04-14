import { getBuffer } from '../../library/functions.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';

export default {
   show: ['kannagen'],
   command: /^kannagen$/i,
   description: 'Generate kannagen text meme',
   query: true,
   usage: '%cmd% xcoders',
   execute: async ({ xcoders, m, query, languages }: Execute) => {
      try {
         const response = await getBuffer(`${m.base_url}/api/maker/kannagen?text=${query}&apikey=${m.api_key}`);
         await waitingMessage(xcoders, 'upload_photo', languages.waiting_message);
         return xcoders.sendPhoto({ source: response }, { caption: '_Kannagen Successfully..._', parse_mode: 'Markdown' });
      } catch (error) {
         return errorMessage(xcoders, 'Error create kannagen photo, hubungi owner untuk memperbaiki fitur ini...', error);
      }
   }
};