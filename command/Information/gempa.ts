import { getBuffer, getJson } from '../../library/functions.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';

export default {
   show: ['infogempa'],
   command: /^infogempa$/i,
   description: 'Check Gempa terkini',
   usage: '%cmd%',
   execute: async ({ xcoders, m, languages }: Execute) => {
      try {
         const response = await getJson(`${m.base_url}/api/info/gempa?apikey=${m.api_key}`);
         await waitingMessage(xcoders, 'upload_photo', languages.waiting_message);
         const thumbnail = await getBuffer(response.result.thumbnail, { with_fetch: true });
         const caption = `*${response.result.dirasakan}*\nKekuatan *${response.result.magnitude}* Magnitude\nPada waktu ${response.result.waktu}`;
         return xcoders.sendPhoto({ source: thumbnail, filename: response.result.title }, { caption, parse_mode: 'Markdown' });
      } catch (error: any) {
         return errorMessage(xcoders, languages.error_message.replace('%%', 'Error download MP3'), error);
      }
   }
};