import { media } from '../../configs/regex.js';
import { getBuffer, getJson } from '../../library/functions.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';


export default {
   show: ['pin'],
   command: /^(pin|pindl|pinterest)$/i,
   description: 'Download media Pinterest',
   query: true,
   url: true,
   usage: '%cmd% url Pinterest.',
   execute: async ({ query, xcoders, m, languages }: Execute) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url Pinterest, masukkan url dengan benar...');
         const response = await getJson(`${m.base_url}/api/download/pinterest?url=${query}&apikey=${m.api_key}`);
         const buffer = await getBuffer(response.result.url);
         if (response.result.type === 'video') {
            await waitingMessage(xcoders, 'record_video', languages.waiting_message);
            xcoders.sendVideo({ source: buffer }, { caption: response.result.description, has_spoiler: true });
         } else {
            await waitingMessage(xcoders, 'upload_photo', languages.waiting_message);
            return xcoders.sendPhoto({ source: buffer }, { caption: response.result.description, has_spoiler: true });
         }
      } catch (error: any) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error download media Pinterest'), error);
      }
   }
};