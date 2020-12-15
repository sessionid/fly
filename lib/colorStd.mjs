/* color table */
const dcolorNameList = ['black', 'red', 'green', 'yellow', 'blue', 'purple', 'green', 'white'];
const colorNameList = dcolorNameList.slice(0);
dcolorNameList.forEach((color, idx) => {
    colorNameList[idx + 60] = `l${color}`;
});

const getColorIdx = (group, offset, color) => {
    if (Number.isInteger(color)) return color;
    const colorIdx = group.indexOf(color);
    return colorIdx === -1 ? undefined : colorIdx + offset;
}

const getForecolorIdx = getColorIdx.bind(null, colorNameList, 30);
const getBackcolorIdx = getColorIdx.bind(null, colorNameList, 40);

const combineDecorator = (decorators = []) => {
    return `\u{1b}[${decorators.join(';')}m`;
}

const getForecolor = (color) => {
    return `\u{1b}[${getForecolorIdx(color)}m`;
}

const getBackcolor = (color) => {
    return `\u{1b}[${getBackcolorIdx(color)}m`;
}

const getColor = (foreColor, backColor) => {
    const _foreColor = typeof foreColor === 'string' ? getForecolorIdx(foreColor) : foreColor;
    const _backColor = typeof backColor === 'string' ? getBackcolorIdx(backColor) : backColor;
    return combineDecorator([_foreColor, _backColor]);
};

const Constants = {
    /* background color constant */
    BACKGROUND: colorNameList.reduce((table, color) => {
        table[color.toUpperCase()] = getBackcolorIdx(color);
        return table;
    }, {}),
    /* front color constant */
    FRONT: colorNameList.reduce((table, color) => {
        table[color.toUpperCase()] = getForecolorIdx(color);
        return table;
    }, {}),
};

export {
    getColor,
    getForecolorIdx,
    getBackcolorIdx,
    getForecolor,
    getBackcolor,
    Constants as constants,
}