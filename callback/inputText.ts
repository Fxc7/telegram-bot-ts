import { Context } from 'telegraf';
import { KeyboardButton, ReplyKeyboardMarkup } from 'telegraf/types'


export enum GenStages {
   INPUT_TEXT = 'inputText',
   SELECT_STYLE = 'selectStyle'
}

export enum Styles {
   UHD = 'Detail Foto',
   ANIME = 'Anime',
   DEFAULT = 'Defualt'
}

export interface ContextWithSession extends Context {
   session?: SessionData
}

export interface SessionData {
   currentGenStage: GenStages;
   dataGenStage?: Partial<Record<GenStages, string>>;
}

export type Callback = (xcoders: ContextWithSession) => void;

const replyKeyboard: ReplyKeyboardMarkup = {
   keyboard: [
      (Object.values(Styles) as Array<string>).map<KeyboardButton>(v => ({ text: v }))
   ],
   resize_keyboard: true,
   one_time_keyboard: true
};

export const inputTextCallback: Callback = (xcoders) => {
   xcoders.session = { currentGenStage: GenStages.SELECT_STYLE, dataGenStage: { [GenStages.INPUT_TEXT]: xcoders.text } };
   xcoders.reply('Pilih Model\n\nUntuk hanya menggunakan permintaan Anda tanpa gaya tambahan, pilih “Model khusus”', { reply_markup: replyKeyboard });
};

export const inputTextCallbackQuery: Callback = (xcoders) => {
   xcoders.editMessageReplyMarkup(undefined)
   xcoders.reply('Введите текст для генерации:')
   xcoders.session = { currentGenStage: GenStages.INPUT_TEXT }
};