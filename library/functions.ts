import fs from 'fs';
import path from 'path';
import Module from 'module';
import axios from 'axios';
import archiver from 'archiver';

import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';

import { token } from '../configs/env.js';
import { Languages } from '../types/index.js';

export const requireJson = (pathFiles: string) => {
   if (!fs.existsSync(pathFiles)) throw 'files not exists.';
   const readFiles = fs.readFileSync(pathFiles, 'utf-8');
   const parseFiles = JSON.parse(readFiles);
   return parseFiles;
};

export const getLanguages = (code: string): Languages => {
   const languages = requireJson(`./language/${code}.json`);
   if (languages) return languages;
   return requireJson('./language/en.json');
};

export const reloadModule = (modulePath: string): void => {
   const require = Module.createRequire(import.meta.url);
   const fullPath = path.resolve(modulePath);
   delete require.cache[fullPath];
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

export const getJson = async (url: string) => {
   try {
      const response = await axios.get(url, {
         headers: {
            'Content-Type': 'application/json'
         }
      });
      return response.data;
   } catch (error) {
      throw error;
   }
};

export const getBuffer = async (url: string, options: { with_fetch?: boolean } = {}): Promise<Buffer> => {
   try {
      if (options.with_fetch) {
         const arrayBuffer = await fetch(url, { keepalive: true }).then((response) => response.arrayBuffer());
         return convertToBuffer(arrayBuffer);
      } else {
         const response = await axios.get(url, {
            responseType: 'arraybuffer'
         });
         return response.data;
      }
   } catch (error) {
      throw error;
   }
}

export const sendVideo = async (id: number, input: string | Buffer, options: { [key: string]: string | boolean | object | [] } = {}): Promise<void> => {
   try {
      const readFiles = Buffer.isBuffer(input) ? input : input.startsWith('http') ? await getBuffer(input, { with_fetch: true }) : await fs.promises.readFile(input);
      const files = await fileTypeFromBuffer(readFiles);
      const formData = new FormData();
      formData.append('chat_id', id.toString());
      for (let keys of Object.keys(options)) formData.append(keys, options[keys].toString());
      formData.append('video', readFiles, { contentType: files?.mime, filename: `${crypto.randomUUID()}.mp4` });
      const response = await axios.post(`https://api.telegram.org/bot${token}/sendVideo`, formData, {
         headers: {
            ...formData.getHeaders()
         }
      });
      if (fs.existsSync(input)) await fs.promises.unlink(input);
      return response.data.ok;
   } catch (error) {
      throw error;
   }
};

export const sendDocument = async (id: number, filePath: string, filename: string, options: { [key: string]: string | boolean | object | [] } = {}): Promise<void> => {
   try {
      const readFiles = filePath.startsWith('http') ? await getBuffer(filePath, { with_fetch: true }) : await fs.promises.readFile(filePath);
      const files = await fileTypeFromBuffer(readFiles);
      const formData = new FormData();
      formData.append('chat_id', id);
      for (let keys of Object.keys(options)) formData.append(keys, options[keys].toString());
      formData.append('document', readFiles, { contentType: files?.mime, filename: filename });
      const response = await axios.post(`https://api.telegram.org/bot${token}/sendDocument`, formData, {
         headers: {
            ...formData.getHeaders()
         }
      });
      if (fs.existsSync(filePath)) await fs.promises.unlink(filePath);
      return response.data.ok;
   } catch (error) {
      throw error;
   }
};

export const zipFolder = async (srcFolder: string, zipFilePath: string, callback: any): Promise<void> => {
   const output = fs.createWriteStream(zipFilePath);
   const archive = archiver('zip', { zlib: { level: 9 } });

   output.on('close', () => callback());
   archive.on('error', (error: any) => callback(error));
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

export const range = (start: number, stop: number, step: number): any[] => {
   if (typeof stop == 'undefined') {
      stop = start;
      start = 0;
   }
   if (typeof step == 'undefined') {
      step = 1;
   }
   if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      return [];
   }
   let result = [];
   for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
      result.push(i);
   }
   return result;
};

export const parseMarkdown = (text: string): string => {
   return text.replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi, (x: string, y: any) => y ? y : '\\' + x);
}