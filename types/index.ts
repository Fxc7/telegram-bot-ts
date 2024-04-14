import { Context, NarrowedContext, Scenes } from 'telegraf';
import { WizardSessionData } from 'telegraf/scenes';
import Message, { Update, CallbackQuery } from 'telegraf/types';

export interface Client {
   id: number;
   message_id: number;
   language_code: string | undefined;
   type: string | undefined;
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
      audio: Message.Audio,
      sticker: Message.Sticker,
      document: Message.Document
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

export interface Languages {
   command: Command;
   notes: string[];
   start_service: string;
   waiting_message: string;
   error_message: string;
};

export interface Command {
   group_only_features: string;
   media_features: string;
   media_photo_features: string;
   media_video_features: string;
   owner_features: string;
   private_features: string;
   text_features: string;
   url_audio_features: string;
   url_features: string;
   url_image_features: string;
   url_video_features: string;
};

export interface Execute {
   query: string;
   command: string;
   xcoders: Context;
   m: Client;
   languages: Languages;
};

interface State {
   name: string;
   location: string,
   media: {
      type: string;
      media: string;
   }[],
   biography: string | undefined;
   instagram: string;
   gender: string;
};

export interface MiddlewareClient extends NarrowedContext<Context<Update>, Update.MessageUpdate<Message.Message>> { }

export interface MyContext extends Context {
   session: Scenes.WizardSession;
   scene: Scenes.SceneContextScene<MyContext, WizardSessionData>;
   wizard: Scenes.WizardContextWizard<MyContext> & {
      state: State;
   };
};

export declare namespace callbackQuery {
   interface DataQuery extends CallbackQuery.DataQuery { }
   interface AbstractQuery extends CallbackQuery.AbstractQuery { }
   interface GameQuery extends CallbackQuery.GameQuery { }
};