import { getBuffer } from '../../library/functions.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';

export default {
   show: ['biden'],
   command: /^biden$/i,
   description: 'Generate biden text meme',
   query: true,
   usage: '%cmd% xcoders',
   execute: async ({ xcoders, m, query, languages }: Execute) => {
      try {
         const response = await getBuffer(`${m.base_url}/api/maker/biden?text=${query}&apikey=${m.api_key}`);
         await waitingMessage(xcoders, 'upload_photo', languages.waiting_message);
         return xcoders.sendPhoto({ source: response }, { caption: '_Biden Successfully..._', parse_mode: 'Markdown' });
      } catch (error) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error biden photo'), error);
      }
   }
};