import { media } from '../../configs/regex.js';
import { getBuffer, getJson } from '../../library/functions.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';

export default {
   show: ['facebook'],
   command: /^(fb|fbdl|facebook)$/i,
   description: 'Download Video Facebook',
   query: true,
   url: true,
   usage: '%cmd% url facebook.',
   execute: async ({ query, xcoders, m, languages }: Execute) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url Facebook, masukkan url dengan benar...');
         const response = await getJson(`${m.base_url}/api/download/facebook?url=${query}&apikey=${m.api_key}`);
         await waitingMessage(xcoders, 'record_video', languages.waiting_message);
         const resultBuffer = await getBuffer(response.result.hd);
         return xcoders.sendVideo({ source: resultBuffer }, { caption: response.result.title, has_spoiler: true });
      } catch (error: any) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error download video Facebook'), error);
      }
   }
};