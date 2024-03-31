import fs from 'fs';
import path from 'path';
import Module from 'module';
import axios from 'axios';
import chalk from 'chalk';
import archiver from 'archiver';

import { fileTypeFromFile } from 'file-type';
import FormData from 'form-data';

import { token } from '../configs/env.js';

export const requireJson = (pathFiles: string) => {
   if (!fs.existsSync(pathFiles)) throw 'files not exists.';
   const readFiles = fs.readFileSync(pathFiles, 'utf-8');
   const parseFiles = JSON.parse(readFiles);
   return parseFiles;
};

export const reloadModule = (modulePath: string): void => {
   const require = Module.createRequire(import.meta.url);
   const fullPath = path.resolve(modulePath);
   delete require.cache[fullPath];
};

export const savedPlugins = (cache: { headersCommands: any; Commands: { [x: string]: string | any[]; }; commander: { [x: string]: string | any[]; }; }): void => {
   const headers = cache.headersCommands;
   const objects = headers.reduce((objects: { [x: string]: any; }, items: { category: string | number; command: any; }) => {
      if (objects[items.category]) {
         objects[items.category].command.push(...items.command);
      } else {
         objects[items.category] = { ...items };
      }
      return objects;
   }, {});
   Object.keys(objects).forEach((category) => {
      cache.Commands[category] = [...new Set(objects[category].command)].sort();
   });
   const keysCommander = Object.keys(cache.commander);
   const keysCommands = Object.keys(cache.Commands);
   if (keysCommander.length === 0 && keysCommands.length !== 0) {
      fs.writeFileSync('./output/database/commands.json', JSON.stringify(cache.Commands, null, 2));
      console.log(chalk.green.bold.overline('Successfully loaded plugins'));
   } else if (keysCommands.length === keysCommander.length) {
      keysCommander.forEach((key) => {
         if (cache.commander[key].length !== cache.Commands[key].length) {
            fs.writeFileSync('./output/database/commands.json', JSON.stringify(cache.Commands, null, 2));
            console.log(chalk.green.bold.overline('Successfully added plugins'));
         }
      });
   } else if (keysCommands.length !== (keysCommander.length || keysCommander.length === 0)) {
      fs.writeFileSync('./output/database/commands.json', JSON.stringify(cache.Commands, null, 2));
      console.log(chalk.green.bold.overline('Successfully updated plugins'));
   }
};

export const checkContentType = async (url: string, type: string): Promise<boolean> => {
   try {
      const response = await axios.head(url);
      if (response.status >= 200 && response.status as number < 300) {
         const result = response.headers['content-type'];
         return result.match(type) !== null;
      } else {
         return false;
      }
   } catch (error) {
      console.error(error);
      return false;
   }
};

export const sendDocument = async (id: string, filePath: string, filename: string): Promise<void> => {
   try {
      const readFiles = await fs.promises.readFile(filePath);
      const files = await fileTypeFromFile(filePath);
      const formData = new FormData();
      formData.append('chat_id', id);
      formData.append('document', readFiles, { contentType: files?.mime, filename: filename, filepath: filePath });
      const response = await axios.post(`https://api.telegram.org/bot${token}/sendDocument`, formData, {
         headers: {
            'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`
         }
      });
      if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
      return response.data;
   } catch (error) {
      throw error;
   }
};

export const zipFolder = async (srcFolder: string, zipFilePath: string, callback: any): Promise<void> => {
   const output = fs.createWriteStream(zipFilePath);
   const archive = archiver('zip', { zlib: { level: 9 } });

   output.on('close', () => {
      callback();
   });
   archive.on('error', (error: any) => {
      callback(error);
   });
   archive.pipe(output);
   archive.directory(srcFolder, false);
   await archive.finalize();
   callback(null, 'Success!');
};

export const convertToBuffer = (arrayBuffer: ArrayBuffer): Buffer => {
   const buffer = Buffer.alloc(arrayBuffer.byteLength);
   const view = new Uint8Array(arrayBuffer);
   for (let i = 0; i < buffer.length; ++i) {
      buffer[i] = view[i];
   }
   return buffer;
};