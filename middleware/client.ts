import { Context, NarrowedContext } from 'telegraf';
import { Message, Update } from 'telegraf/types';

import { baseURL, owner, apikey, prefix } from '../configs/env.js';
import { Client } from '../types/index.js';

export default (xcoders: NarrowedContext<Context<Update>, Update.MessageUpdate<Message>>) => {
   const client = {} as Client;
   const quoted = xcoders.message.hasOwnProperty('reply_to_message') ? (xcoders.message as Message.CommonMessage).reply_to_message : null;
   const message = quoted ? Object.keys((xcoders.message as Message.CommonMessage).reply_to_message!) : Object.keys(xcoders.message);
   client.message_id = xcoders.message.message_id;
   client.language_code = xcoders.message.from.language_code;
   client.id = xcoders.msg.chat.id;
   client.type = xcoders.msg.chat.type;
   client.username = xcoders.from!.username;
   client.first_name = (xcoders.from!.first_name + ' ' + xcoders.from.last_name || '').replace('undefined', '').trim();
   client.type_message = message.includes('video') ? 'video' : message.includes('photo') ? 'photo' : message.includes('audio') ? 'audio' : message.includes('voice') ? 'voice' : 'text';
   client.date = xcoders.message.date;

   client.is_owner = owner.includes(client.username!);
   client.is_bot = xcoders.msg.from.is_bot;
   client.is_media = client.type_message !== 'text';
   client.media = client.is_media ? {
      video: ((quoted || xcoders.message) as Message.VideoMessage)!.video,
      photo: ((quoted || xcoders.message) as Message.PhotoMessage)!.photo,
      audio: ((quoted || xcoders.message) as Message.AudioMessage)!.audio,
      voice: ((quoted || xcoders.message) as Message.VoiceMessage)!.voice
   } : null;
   client.quoted = {
      type: client.type_message!,
      quoted_media_message: quoted && ((quoted as Message.VideoMessage)!.video || (quoted as Message.PhotoMessage)!.photo || (quoted as Message.AudioMessage)!.audio || (quoted as Message.VoiceMessage)!.voice || null)
   };
   client.args = quoted ? xcoders.text : message.includes('caption') ? (xcoders.message as Message.MediaMessage)!.caption : xcoders.text;

   client.base_url = baseURL;
   client.api_key = apikey;
   client.prefix = prefix;
   return client;
};