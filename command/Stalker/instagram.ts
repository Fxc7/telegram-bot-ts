import { getBuffer, getJson } from '../../library/functions.js';
import { errorMessage, waitingMessage } from '../../middleware/service.js';
import { Execute } from '../../types/index.js';

export default {
   show: ['igstalk'],
   command: /^igstalk$/i,
   description: 'Stalking user Instagram',
   query: true,
   usage: '%cmd% farhanxcode',
   execute: async ({ xcoders, m, query, languages }: Execute) => {
      try {
         const response = await getJson(`${m.base_url}/api/stalk/instagram?username=${query}&apikey=${m.api_key}`);
         await waitingMessage(xcoders, 'upload_photo', languages.waiting_message);
         const caption = `${response.result.biography}\n\n${response.result.followers}\n${response.result.following}\n${response.result.post_count}`;
         const image = await getBuffer(response.result.profile_url);
         return xcoders.sendPhoto({ source: image }, { caption });
      } catch (error) {
         return errorMessage(xcoders, languages.error_message.replace('%%', `Error Stalking ${query}`), error);
      }
   }
};