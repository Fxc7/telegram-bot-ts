import { media } from '../../configs/regex.js';
import { getBuffer, getJson } from '../../library/functions.js';
import { waitingMessage, errorMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';

export default {
   show: ['capcut'],
   command: /^(ccdl|capcut)$/i,
   description: 'Download Video Capcut template',
   query: true,
   url: true,
   usage: '%cmd% url template capcut.',
   execute: async ({ query, xcoders, m, languages }: Execute) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url Capcut, masukkan url dengan benar...');
         const url = await fetch(query).then((response) => response.url);
         const response = await getJson(`${m.base_url}/api/download/capcut?url=${url}&apikey=${m.api_key}`);
         await waitingMessage(xcoders, 'record_video', languages.waiting_message);
         const resultBuffer = await getBuffer(response.result.url);
         return xcoders.sendVideo({ source: resultBuffer }, { caption: response.result.title + response.result.description, has_spoiler: true });
      } catch (error: any) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error download video Capcut'), error);
      }
   }
};