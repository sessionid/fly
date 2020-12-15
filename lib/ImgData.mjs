import { rgbIndexing, rgbTo256Color } from "./color256.mjs";
import IdxImage from './IdxImage.mjs';

export default class ImgData {
    constructor({ data, width, height }) {
        this.data = data.slice(0);
        this.width = width;
        this.height = height;
    }

    resize({ maxWidth, maxHeight } = {}) {
        const { data, width, height } = this;

        let rate, nWidth = maxWidth, nHeight = maxHeight;

        if (maxWidth && maxHeight) {
            const orate = width / height;
            const mrate = maxWidth / maxHeight;
            rate = orate < mrate ? maxHeight / height : maxWidth / width;
            nWidth = Math.floor(width * rate);
            nHeight = Math.floor(height * rate);
        } else if (maxWidth) {
            rate = maxWidth / width;
            nHeight = Math.floor(height * rate);
        } else if (maxHeight) {
            rate = maxHeight / height;
            nWidth = Math.floor(width * rate);
        } else {
            return this;
        }

        const newData = new Uint8ClampedArray(nHeight * nWidth * 4);
        for (let y = 0, walkedRow = nWidth * 4; y < nHeight; y += 1) {
            for (let x = 0, offset = y * walkedRow; x < nWidth; x += 1, offset += 4) {
                const idx = (Math.floor(y / rate) * width + Math.floor(x / rate)) * 4;
                newData.set(data.slice(idx, idx + 4), offset);
            }
        }

        this.data = newData;
        this.width = nWidth;
        this.height = nHeight;
        return this;
    }

    indexing() {
        const { data } = this;
        const newData = new Uint8ClampedArray(data.length);
        for (let i = 0; i < data.length; i += 4) {
            const rgba = data.slice(i, i + 4);
            const { r, g, b } = rgbTo256Color(...rgba);
            newData.set([r, g, b, rgba[3]], i);
        }
        this.data = newData;
        return this;
    }

    getIdxImage() {
        const { width, height, data } = this;
        const newData = new Uint8ClampedArray(data.length/4);
        for (let i = 0, j=0; i < data.length; i += 4, j += 1) {
            const idx = rgbIndexing(...data.slice(i, i + 4));
            newData[j] = idx;
        }
        return new IdxImage(newData, width, height, 0);
    }

    stringify() {
        return this.constructor.stringify(this);
    }

    static stringify(imageData) {
        const { data, width, height } = imageData;
        return JSON.stringify({ width, height, data: [...data] });
    }

    gray() {
        const { data } = this;
        for(let i = 0; i < data.length; i += 4) {
            const color = Math.round((data[i] + data[i + 1] + data[i + 2])/3);
            data.set([color, color, color], i);
        }
        return this;
    }
}
