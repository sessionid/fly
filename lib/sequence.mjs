import * as colorStd from './colorStd.mjs';
import * as color256 from './color256.mjs';

const EndOfSequence = '\u{1b}[0m';

const CONSTANTS = {
    CURSOR_SHOW: '\u{1b}[?25h',
    CURSOR_HIDE: '\u{1b}[?25l',
    ...colorStd.constants,
    END: EndOfSequence,
};

const decorate = (decorator, str) => {
    return `${decorator}${str}${EndOfSequence}`;
}

const _verticalBack = (line) => {
    return `\u{1b}[${line}A`;
};

const _verticalForward = (line) => {
    return `\u{1b}[${line}B`;
}

const _vertical = (fn, ...args) => {
    if(args.length === 1) { 
        return fn(args[0]);
    } else {
        const [total, lineSize] = args;
        return fn(Math.floor(total/lineSize));
    }
};

const verticalBack = _vertical.bind(null, _verticalBack);
const verticalForward = _vertical.bind(null, _verticalForward);

const clear = (height = 1, width, charWidth = 1) => {
    const jumpChar = _verticalBack(height - 1);
    const str = Array(height).fill((' ').repeat(charWidth * width)).join('\n');
    return `${str}${jumpChar}\r`;
}

const toStart = y => `${_verticalBack(y - 1)}\r`;

const colorString = (str, forecolor, backcolor) => {
    const fore = typeof forecolor === 'string' && forecolor.startsWith('#');
    const back = typeof backcolor === 'string' && backcolor.startsWith('#');
    let fcolor, bcolor, color;
    if (!(fore || back)) {
        color = colorStd.getColor(forecolor, backcolor);
    } else {
        fcolor = fore 
            ? color256.getForecolor(forecolor, true) 
            : colorStd.getForecolor(forecolor);
        bcolor = back 
            ? color256.getBackcolor(backcolor, true)
            : colorStd.getBackcolor(backcolor);
        color = `${forecolor}${backcolor}`;
    }
    return decorate(color, str);
}

export {
    verticalBack,
    verticalForward,
    CONSTANTS,
    clear,
    toStart,
    colorStd,
    color256,
    colorString,
};
