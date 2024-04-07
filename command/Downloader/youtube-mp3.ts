import { Context } from 'telegraf';
import { Update } from 'telegraf/types';

import { media } from '../../configs/regex.js';
import { getBuffer, getJson } from '../../library/functions.js';
import { Client } from '../../types/index.js';

export default {
   show: ['ytmp3'],
   command: /^yt(|mp3|audio)$/i,
   description: 'Download MP3 from Youtube',
   query: true,
   url: true,
   usage: '%cmd% url Youtube.',
   execute: async ({ query, xcoders, errorMessage, m }: { query: string, username: string, xcoders: Context, errorMessage: (xcoders: Context<Update>, message: string, error: any) => Promise<void>, m: Client }) => {
      try {
         if (!media(query)) return xcoders.reply('invalid url Youtube, masukkan url dengan benar...');
         const response = await getJson(`${m.base_url}/api/download/ytmp3?url=${query}&apikey=${m.api_key}`);
         await xcoders.reply('Tunggu sebentar...');
         const buffer = await getBuffer(response.result.url);
         return xcoders.sendAudio({ source: buffer, filename: response.result.title }, { thumbnail: { source: await getBuffer(response.result.thumbnail, { with_fetch: true }) } });
      } catch (error: any) {
         return errorMessage(xcoders, 'Error download MP3, silahkan lapor ke owner untuk memperbaiki fitur tersebut...', error);
      }
   }
};