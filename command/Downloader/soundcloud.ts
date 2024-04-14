import { media } from '../../configs/regex.js';
import { getBuffer, getJson } from '../../library/functions.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';

export default {
   show: ['scdl'],
   command: /^(scdl|soundcloud)$/i,
   description: 'Download MP3 SoundCloud',
   query: true,
   url: true,
   usage: '%cmd% url SoundCloud.',
   execute: async ({ query, xcoders, m, languages }: Execute) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url SoundCloud, masukkan url dengan benar...');
         const response = await getJson(`${m.base_url}/api/download/soundcloud?url=${query}&apikey=${m.api_key}`);
         await waitingMessage(xcoders, 'record_voice', languages.waiting_message);
         const buffer = await getBuffer(response.result.url);
         const thumbnail = await getBuffer(response.result.thumbnail, { with_fetch: true });
         return xcoders.sendAudio({ source: buffer, filename: response.result.title }, { thumbnail: { source: thumbnail } });
      } catch (error: any) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error download MP3'), error);
      }
   }
};