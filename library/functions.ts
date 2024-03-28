import fs from 'fs';
import path from 'path';
import Module from 'module';

export const requireJson = (pathFiles: string) => {
   if (!fs.existsSync(pathFiles)) throw 'files not exists.';
   const readFiles = fs.readFileSync(pathFiles, 'utf-8');
   const parseFiles = JSON.parse(readFiles);
   return parseFiles;
};

export const reloadModule = (modulePath: string) => {
   const require = Module.createRequire(import.meta.url);
   const fullPath = path.resolve(modulePath);
   delete require.cache[fullPath];
};