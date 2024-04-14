import { media } from '../../configs/regex.js';
import { getBuffer, getJson } from '../../library/functions.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';

export default {
   show: ['ytshort'],
   command: /^ytsh?ort$/i,
   description: 'Download Video Youtube Short',
   query: true,
   url: true,
   usage: '%cmd% url Youtube Short.',
   execute: async ({ query, xcoders, m, languages }: Execute) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url Youtube Short, masukkan url dengan benar...');
         const response = await getJson(`${m.base_url}/api/download/youtube-short?url=${query}&apikey=${m.api_key}`);
         await waitingMessage(xcoders, 'record_video', languages.waiting_message);
         const resultBuffer = await getBuffer(response.result.url);
         return xcoders.sendVideo({ source: resultBuffer }, { caption: response.result.title, has_spoiler: true });
      } catch (error: any) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error download video short Youtube'), error);
      }
   }
};