import fs from 'fs';
import path from 'path';

import * as functions from './library/functions.js';

export default async (cache: any) => {
   const commandsPath = './output/command';
   const plugins = fs.readdirSync(commandsPath);
   for (const plugin of plugins) {
      if (!/\.js$/g.test(plugin)) {
         const commandFiles = fs.readdirSync(path.join(commandsPath, plugin)).filter((item) => /\.js$/.test(item));
         for (const filename of commandFiles) {
            const pathFiles = path.join(commandsPath, plugin, filename);
            try {
               const command = (await import(`./${pathFiles.replace('output', '').slice(1)}`)).default;
               const allCommand = functions.requireJson('./output/database/allCommands.json');
               if (command) {
                  cache.headersCommands.push({ category: plugin, command: command.show });
                  if (allCommand.length < 1) {
                     cache.allCommands.push(command.show[0].split(' ')[0]);
                  } else {
                     cache.allCommands.push(...allCommand, command.show[0].split(' ')[0]);
                  }
                  cache.allCommands = [...new Set(cache.allCommands)];
                  cache.plugins[`${plugin}-${filename}`] = command;
               }
            } catch (error: any) {
               console.error(error);
               functions.reloadModule(pathFiles);
            }
         }
      }
   }
   fs.writeFileSync('./output/database/allCommands.json', JSON.stringify(cache.allCommands, null, 2));
   functions.savedPlugins(cache);
};