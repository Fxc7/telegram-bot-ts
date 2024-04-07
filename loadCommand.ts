import fs from 'fs';
import path from 'path';

import { requireJson, reloadModule } from './library/functions.js';
import { savedPlugins } from './middleware/service.js';

export default async (cache: { headersCommands: any; allCommands?: any; plugins?: any; Commands?: { [x: string]: string | any[]; }; commander?: { [x: string]: string | any[]; }; }) => {
   const commandsPath = './output/command';
   const plugins = fs.readdirSync(commandsPath);
   for (const plugin of plugins) {
      if (!/\.js$/g.test(plugin)) {
         const commandFiles = fs.readdirSync(path.join(commandsPath, plugin)).filter((item) => /\.js$/.test(item));
         for (const filename of commandFiles) {
            const pathFiles = path.join(commandsPath, plugin, filename);
            try {
               const command = (await import(`./${pathFiles.replace('output', '').slice(1)}`)).default;
               const allCommand = requireJson('./output/database/allCommands.json');
               if (command) {
                  cache.headersCommands.push({ category: plugin, command: command.show.map((item: string) => `${item} ${command.description}`) });
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
               reloadModule(pathFiles);
            }
         }
      }
   }
   fs.writeFileSync('./output/database/allCommands.json', JSON.stringify(cache.allCommands, null, 2));
   savedPlugins({ commander: cache.commander, Commands: cache.Commands, headersCommands: cache.headersCommands });
};