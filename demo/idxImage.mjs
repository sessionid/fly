import { IdxImage } from '../index.mjs';
import { readFileSync } from 'fs';
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const buffer = readFileSync(join(__dirname, './idxm/demo.idxm'));
const idxImg = IdxImage
    .fromBuffer(buffer.buffer)
    .resize({ maxWidth: Math.floor(process.stdout.columns/2) });
const str = idxImg.toString();
console.log(str);