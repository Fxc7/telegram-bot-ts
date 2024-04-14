import { getBuffer } from '../../library/functions.js';
import { Execute } from '../../types/index.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';

export default {
   show: ['facts'],
   command: /^(facts|funfact)$/i,
   description: 'Generate funfacts text meme',
   query: true,
   usage: '%cmd% xcoders',
   execute: async ({ xcoders, m, query, languages }: Execute) => {
      try {
         const response = await getBuffer(`${m.base_url}/api/maker/facts?text=${query}&apikey=${m.api_key}`);
         await waitingMessage(xcoders, 'upload_photo', languages.waiting_message);
         return xcoders.sendPhoto({ source: response }, { caption: '_Funfacts Successfully..._', parse_mode: 'Markdown' });
      } catch (error) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error Funfacts photo'), error);
      }
   }
};