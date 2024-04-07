import { KeyboardButton, ReplyKeyboardMarkup } from 'telegraf/types';

import { Styles, Callback, GenStages } from '../types/index.js';


const replyKeyboard: ReplyKeyboardMarkup = {
   keyboard: [(Object.values(Styles) as Array<string>).map<KeyboardButton>((item) => ({ text: item }))],
   resize_keyboard: true,
   one_time_keyboard: true
};

export const inputTextCallback: Callback = (xcoders) => {
   xcoders.session = {
      currentGenStage: GenStages.SELECT_STYLE, dataGenStage: {
         [GenStages.INPUT_TEXT]: xcoders.text
      }
   };
   xcoders.reply('Pilih Model\n\nUntuk hanya menggunakan permintaan Anda tanpa gaya tambahan, pilih “Model khusus”', { reply_markup: replyKeyboard });
};

export const inputTextCallbackQuery: Callback = (xcoders) => {
   xcoders.editMessageReplyMarkup(undefined);
   xcoders.reply('Masukkan teks untuk menghasilkan:');
   xcoders.session = { currentGenStage: GenStages.INPUT_TEXT };
};