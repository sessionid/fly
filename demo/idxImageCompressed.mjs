import { IdxImage } from '../index.mjs';
import { readFileSync } from 'fs';
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { inflateSync, deflateSync } from "zlib";

const __dirname = dirname(fileURLToPath(import.meta.url));


const buffer = readFileSync(join(__dirname, './idxm/demo.compress.idxm'));
const idxImg = IdxImage
    .fromBuffer(buffer.buffer, {
        compress(data, compressMethod) {
            if (compressMethod === 0) {
                return data;
            } else if (compressMethod === 1) {
                return deflateSync(data);
            }
            throw new Error(`unsupported compress method ${compressMethod}`);
        },
        uncompress(data, compressMethod) {
            if (compressMethod === 0) {
                return data;
            } else if (compressMethod === 1) {
                return inflateSync(data);
            }
            throw new Error(`unsupported compress method ${compressMethod}`);
        }
    })
    .uncompress()
    .resize({ maxWidth: Math.floor(process.stdout.columns/2) });
const str = idxImg.toString();
console.log(str);