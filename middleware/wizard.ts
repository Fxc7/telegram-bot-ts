import { Markup, Scenes } from 'telegraf';
import { CallbackQuery, Message } from 'telegraf/types';

import client from './client.js';
import { MiddlewareClient, MyContext } from '../types/index.js';
import logger from '../library/logger.js';

export default (cache: { wizard_session: { [key: number]: any[] } }) => {
   try {
      const Wizard = new Scenes.WizardScene<MyContext>('biodata', async (xcoders) => {
         xcoders.wizard.cursor = 0;
         await xcoders.reply('📎 Masukkan nama anda:');
         return xcoders.wizard.next();
      }, async (xcoders) => {
         if (!xcoders.text) {
            await xcoders.reply('Masukkan nama anda!!!');
            await xcoders.scene.leave();
         } else {
            xcoders.wizard.state.name = xcoders.text;
            await xcoders.reply('📍 Silahkan Masukkan koordinasi lokasi anda:', Markup.keyboard([
               Markup.button.locationRequest('Share Location')
            ]));
            xcoders.wizard.cursor = 1;
            return xcoders.wizard.next();
         }
      }, async (xcoders) => {
         const context = (xcoders.message as unknown as Message.LocationMessage);
         if (context) {
            const latitude = context.location.latitude;
            const longitude = context.location.longitude;
            const response = await fetch(`https://us1.locationiq.com/v1/reverse?key=pk.1af96d965f7c2dde6120fef327112bf5&lat=${latitude}&lon=${longitude}&format=json`).then((response) => response.json());
            xcoders.wizard.state.location = response.display_name;
            await xcoders.reply('✅ Lokasi anda berhasil didapatkan.', Markup.removeKeyboard());
            await xcoders.reply('🎬 Silahkan kirim foto atau video anda untuk melengkapi data diri anda.');
            xcoders.wizard.cursor = 2;
            return xcoders.wizard.next();
         } else {
            await xcoders.reply('Mohon bagikan lokasi anda');
            await xcoders.scene.leave();
         }
      }, async (xcoders) => {
         const context = client(xcoders as MiddlewareClient);
         if (context.media?.photo) {
            const length = context.media.photo.length;
            if (typeof cache.wizard_session[context.id] !== 'object') cache.wizard_session[context.id] = [];
            cache.wizard_session[context.id].push({ type: 'photo', media: context.media.photo[length - 1].file_id });
         } else if (context.media?.video) {
            if (typeof cache.wizard_session[context.id] !== 'object') cache.wizard_session[context.id] = [];
            cache.wizard_session[context.id].push({ type: 'video', media: context.media.video.file_id });
         }
         setTimeout(async () => {
            await xcoders.reply('✅ Foto atau video sudah diterapkan');
            await xcoders.reply('💌 Selanjutnya silahkan masukkan deskripsi biodata anda:');
            xcoders.wizard.state.media = cache.wizard_session[context.id];
            xcoders.wizard.cursor = 3;
            return xcoders.wizard.next();
         }, 1000);
      }, async (xcoders) => {
         xcoders.wizard.state.biography = xcoders.text;
         await xcoders.reply('✅ Deskripsi biodata anda sudah diterapkan.');
         await xcoders.reply('🔰 Username instagram anda?', Markup.keyboard([
            Markup.button.text('Tidak ingin menambahkan instagram')
         ], { columns: 1 }));
         return xcoders.wizard.next();
      }, async (xcoders) => {
         const context = client(xcoders as MiddlewareClient);
         if (context.args?.includes('Tidak')) xcoders.wizard.state.instagram = '-';
         xcoders.wizard.state.instagram = xcoders.text!;
         xcoders.wizard.cursor = 4;
         await xcoders.reply('👫 Gender anda:', Markup.keyboard([
            Markup.button.text('saya cowok'),
            Markup.button.text('saya cewek')
         ], { columns: 4 }));
      }, async (xcoders) => {
         const context = client(xcoders as MiddlewareClient);
         const callbackText = xcoders.callbackQuery as unknown as CallbackQuery.DataQuery;
         xcoders.wizard.state.gender = callbackText.data;
         await xcoders.sendMediaGroup(cache.wizard_session[context.id]);
      });
      return Wizard;
   } catch (error) {
      logger.error(error);
      throw error;
   }
};