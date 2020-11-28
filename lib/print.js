/* color table */
const dcolorNameList = ['black', 'red', 'green', 'yellow', 'blue', 'purple', 'green', 'white'];
const colorNameList = dcolorNameList.slice(0);
dcolorNameList.forEach((color, idx) => {
    colorNameList[idx + 60] = `l${color}`;
});

const getColor = (group, offset, color) => {
    const colorIdx = group.indexOf(color);
    return colorIdx === -1 ? undefined : colorIdx + offset;
}

const getFrontColor = getColor.bind(null, colorNameList, 30);
const getBgColor = getColor.bind(null, colorNameList, 40);

const _colorString = (str, front, background) => {
    let color = '';
    if (background) {
        color = front ? `${background};${front}` : background;
    } else {
        color = front || '';
    }
    return color ? `\u{1b}[${color}m${str}\u{1b}[0m` : str;
}
const colorString = (str, front, background) => {
    const _front = typeof front === 'string' ? getFrontColor(front) : front;
    const _background = typeof background === 'string' ? getBgColor(background) : background;
    return _colorString(str, _front, _background);
};

const CONSTANTS = {
    CURSOR_SHOW: '\u{1b}[?25h',
    CURSOR_HIDE: '\u{1b}[?25l',
    /* background color constant */
    BACKGROUND: colorNameList.reduce((table, color) => {
        table[color.toUpperCase()] = getBgColor(color);
        return table;
    }, {}),
    /* front color constant */
    FRONT: colorNameList.reduce((table, color) => {
        table[color.toUpperCase()] = getFrontColor(color);
        return table;
    }, {}),
};

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

module.exports = {
    colorString,
    verticalBack,
    verticalForward,
    CONSTANTS,
    clear,
    toStart,
};
