import Message from 'telegraf/types';

export interface Client {
   id: number;
   message_id: number;
   language_code: string | null | undefined;
   type: string | null | undefined;
   type_message: string | null | undefined;
   username: string | null | undefined;
   first_name: string | null | undefined;
   is_bot: boolean | null | undefined;
   is_owner: boolean | null | undefined;
   is_media: boolean | null | undefined;
   date: number;
   media: {
      video: Message.Video,
      photo: Message.PhotoSize[],
      voice: Message.Voice,
      audio: Message.Audio
    } | null;
   quoted: {
      type?: string | null;
      quoted_media_message?: Message.Video | Message.PhotoSize | Message.Voice | Message.Audio | null;
   } | null | undefined;
   args: string | null | undefined;
   base_url: string;
   api_key: string;
   prefix: string;
};