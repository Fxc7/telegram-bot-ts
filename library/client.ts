import { Context, NarrowedContext } from 'telegraf';
import { Message, Update } from 'telegraf/types';

import { baseURL, owner, apikey, prefix } from '../configs/env.js';
import { Client } from '../types/index.js';

export default (xcoders: NarrowedContext<Context<Update>, Update.MessageUpdate<Message>>) => {
   const client = {} as Client;
   client.message = Object.keys(xcoders.message);
   client.message_id = xcoders.message.message_id;
   client.language_code = xcoders.message.from.language_code;
   client.id = xcoders.msg.chat.id;
   client.type = xcoders.msg.chat.type;
   client.username = xcoders.from?.username;
   client.first_name = (xcoders.from?.first_name + ' ' + xcoders.from.last_name || '').replace('undefined', '').trim();
   client.is_owner = owner.includes(client.username!);
   client.is_bot = xcoders.msg.from.is_bot;
   client.is_media = client.message!.includes('video') || client.message!.includes('photo');
   client.quoted = (xcoders.message as Message.CommonMessage)!.reply_to_message;
   client.media = {
      type: client.message.includes('video') ? 'video' : 'photo',
      quoted_media_message: client.quoted ? ((client.quoted as Message.VideoMessage)!.video || (client.quoted as Message.PhotoMessage)!.photo) : null
   };
   client.args = client.message.includes('caption') ? (xcoders.message as Message.MediaMessage)!.caption : xcoders.text;

   client.base_url = baseURL;
   client.api_key = apikey;
   client.prefix = prefix;
   return client;
};