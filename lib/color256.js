/**
 * --------------------------------------------------------
 *                          216 color
 * --------------------------------------------------------
 **/

const toHex = (str) => {
    return str.toString(16).padEnd(2, 0);
}

/**
 * convert ANSI Escape Eequence color index to RGB format
 * @param {Number} idx ANSI Escape Eequence color index
 */
const idx2Hex216 = (idx) => {
    const r = Math.floor((idx - 16) / 36);
    const g = Math.floor((idx - 16)/6) % 6; 
    const b = (idx - 16)%6;
    return { r: idx2HexCalc(r), g: idx2HexCalc(g), b: idx2HexCalc(b), hex: `#${toHex(r)}${toHex(g)}${toHex(b)}` };
}

/**
 * get position of each dimension from the 6 × 6 × 6 color cube
 * @param {Number} color value of one in RGB
 */
const colorIdx = (color) => {
    return color === 0 ? 0 : (color - 95) / 40 + 1;
}

/**
 * convert RGB to ANSI Escape Eequence color index
 * @param {String} hex color that interpreted as RGB format
 */
const hex2Idx216 = (hex) => {
    const [r, g, b] = hex.match(/\w{2}/g).map(color => colorIdx(Number(`0x${color}`)));
    const idx = 16 + (g+r*6)*6 + b;
    return Number.isInteger(idx) ? idx : -1;
}

/**
 * convert ANSI Escape Eequence color index to RGB
 * @param {Number} idx ANSI Escape Eequence color index
 */
const idx2HexCalc = (idx) => {
    return idx === 0 ? 0 : 95 + (idx - 1) * 40;
}


/**
 * --------------------------------------------------------
 *               standrd and grayscale color
 * --------------------------------------------------------
 **/

const _idx2Hex = (idx, colorList = []) => {
    const color = colorList[idx];
    return {
        r: Number(`0x${color.substr(0, 2)}`),
        r: Number(`0x${color.substr(2, 2)}`),
        r: Number(`0x${color.substr(4, 2)}`),
        hex: `#${color}`,
    };
}

const _hex2Idx = (hex, colorList = []) => {
    return colorList.indexOf(hex);
}

/* standrd color */
const StandrdColor = ['000000', '800000', '008000', '808000', '000080', '800080', '008080', 'c0c0c0', '808080', 'ff0000', '00ff00', 'ffff00', '0000ff', 'ff00ff', '00ffff', 'ffffff'];

const idx2HexStd = idx => _idx2Hex(idx, StandrdColor);
/* const hex2IdxStd = hex => _hex2Idx(hex, StandrdColor); */

/* grayscale color */
const GrayscaleColor = ['080808', '121212', '1c1c1c', '262626', '303030', '3a3a3a', '444444', '4e4e4e', '585858', '626262', '6c6c6c', '767676', '808080', '8a8a8a', '949494', '9e9e9e', 'a8a8a8', 'b2b2b2', 'bcbcbc', 'c6c6c6', 'd0d0d0', 'dadada', 'e4e4e4', 'eeeeee'];

const idx2HexGray = idx => _idx2Hex(idx - 231, StandrdColor);
const hex2IdxGray = hex => 231 + _hex2Idx(hex, GrayscaleColor);


/**
 * --------------------------------------------------------
 *               32 bit color
 * --------------------------------------------------------
 **/

const colorTo256 = (start, half, offset, color) => {
    if (color <= start) return color < half ? 0 : start;
    return (Math.round((color - start)/offset) * offset + start);
}
const convert216 = (color) => colorTo256(0x5f, 0x2f, 40, color);
const convertGray = (color) => colorTo256(8, 4, 10, color);

/**
 * convert the rgb color to the nearest rgb color in ANSI Escape Sequence
 * @param {String} hex any RGB style string
 */
const to256Color = (hex) => {
    let [r, g, b] = hex.match(/\w{2}/g).map(color => Number(`0x${color}`));
    let convert = r === g && g === b ? convertGray : convert216;
    return { r: convert(r), g: convert(g), b: convert(b) };
}

/**
 * convert the rgb color to the nearest color index in ANSI Escape Sequence
 * @param {String} hex any RGB style string
 */
const hex2Idx32 = (hex) => {
    const rgb = hex.match(/\w{2}/g);
    const [r, g, b] = rgb;
    if (r === g && g === b) {
        return (convertGray(Number(`0x${color}`)) - 8)/10 + 232;
    } else {
        const [r, g, b] = rgb.map(color => colorIdx(convert216(Number(`0x${color}`))));
        return 16 + (g+r*6)*6 + b;
    }
}


/**
 * --------------------------------------------------------
 *               export method
 * --------------------------------------------------------
 **/

/**
 * get RGB string from color index in ANSI Escape Sequence
 * @param {Number} idx color index in ANSI Escape Sequence
 */
const idx2Hex = (idx) => {
    if (idx < 1 || idx > 255) {
        throw new Error('invalid 256 color index');
    } if (idx < 16) {
        return idx2HexStd(idx);
    } else if(idx > 231) {
        return idx2HexGray(idx);
    } else {
        return idx2Hex216(idx);
    }
}

/**
 * get ANSI Escape Sequence color index by RGB
 * @param {String} hex RGB string
 * @param {Boolean} convert if convert the 32bit color to the 256 color
 */
const hex2Idx = (hex, convert = false) => {
    let pList = [ hex2Idx216, hex2IdxGray ];
    if (convert) pList.push(hex2Idx32);
    let idx = -1;
    while((idx === -1) && pList.length) {
        idx = pList.shift()(hex);
    }
    return idx;
}

const _getColor = (color, convert = false, fore = true) => {
    const colorIdx = Number.isInteger(color) ? color : hex2Idx(color, convert);
    return colorIdx === -1 ? undefined : `\u{1b}[${ fore ? 38 : 48 };5;${color}m`;
}

const getForecolor = (color, convert) => _getColor(color, convert);
const getBackcolor = (color, convert) => _getColor(color, convert, false);
const getColor = (forecolor, backcolor) => [getForecolor(forecolor), getBackcolor(backcolor)].join('');

module.exports = { idx2Hex, hex2Idx, to256Color, getBackcolor, getForecolor, getColor };
