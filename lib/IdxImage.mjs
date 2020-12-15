const RealData = Symbol('real data');
const Data = Symbol('data');
const CompressFunction = Symbol('compress function');
const UncompressFunction = Symbol('uncompress function');
const Pixel = Symbol('pixel');
const IDXMSignature = Uint8Array.from([0x49, 0x44, 0x58, 0x4d]);

const voidHandler = (data, compressMethod) => {
    throw new Error(`unsupported compress method ${compressMethod}`);
}

export default class IdxImageData {
    constructor(data, width, height, compressMethod = 0, { compress, uncompress } = {}) {
        
        this[CompressFunction] = voidHandler;
        this[UncompressFunction] = voidHandler;
        this.setCompressHandler({compress, uncompress});

        this.data = data.slice(0);
        this.width = width;
        this.height = height;
        this.compressMethod = compressMethod;
        this.data = data;
    }

    setCompressHandler({compress, uncompress} = {}) {
        if (compress instanceof Function) this[CompressFunction] = compress;
        if (uncompress instanceof Function) this[UncompressFunction] = uncompress;
    }

    compress(compressMethod) {
        this.compressMethod = compressMethod || this.compressMethod;
        this.data = this[CompressFunction](this.realData, compressMethod);
        return this;
    }

    uncompress() {
        const { compressMethod } = this;
        if (this.compressMethod !== 0) {
            this.compressMethod = 0;
            this.realData = this[UncompressFunction](this.data, compressMethod);
        }
        return this;
    }

    get realData() {
        return this[RealData];
    }

    set realData(data) {
        const { compressMethod } = this;
        this[RealData] = data;
        this[Data] = compressMethod ? this[CompressFunction](data, compressMethod) : data;
    }

    get data() {
        return this[Data];
    }

    set data(data) {
        const { compressMethod } = this;
        this[Data] = data;
        this[RealData] = compressMethod ? this[UncompressFunction](data, compressMethod) : data;
    }

    resize({maxWidth, maxHeight} = {}) {
        const { realData: data, width, height, compressMethod } = this;
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

        const newData = new Uint8ClampedArray(nHeight * nWidth);
        for (let y = 0; y < nHeight; y += 1) {
            for (let x = 0, offset = y * nWidth; x < nWidth; x += 1) {
                const idx = (Math.floor(y / rate) * width + Math.floor(x / rate));
                newData[offset + x] = data[idx];
            }
        }
        this.height = nHeight;
        this.width = nWidth;
        this.realData = newData;
        return this;
    }

    toBuffer() {
        const { data, width, height, compressMethod } = this;
        const blank = new Uint8ClampedArray(data.length + 16);
        const view = new DataView(blank.buffer);
        blank.set(IDXMSignature, 0);
        view.setUint32(4, width);
        view.setUint32(8, height);
        blank[15] = compressMethod;
        blank.set(data, 16);
        return blank.buffer;
    }

    static fromBuffer(buffer, { compress, uncompress } = {}) {
        const view = new DataView(buffer);
        const isIDMX = IDXMSignature.every((v, idx) => v === view.getUint8(idx));
        if (!isIDMX) throw new Error('not idmx');
        const idxImageData = new this(
            new Uint8ClampedArray(buffer.slice(16)),
            view.getUint32(4),
            view.getUint32(8),
            view.getUint8(15),
            { compress, uncompress }
        );
        return idxImageData;
    }

    [Pixel](idx, char = '  ') {
        return `\u{1b}[48;5;${idx}m${char}\u{1b}[0m`;
    }

    toString(char) {
        const { realData: data, width, height, [Pixel]: pixel } = this;
        
        const dataArr = new Uint8ClampedArray(data);
        let str = '';
        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                str += pixel(dataArr[y * width + x], char);
            }
            str += '\n';
        }
        return str;
    }
}
