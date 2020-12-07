const { BlockProgress, CONSTANTS: { BACKGROUND } } = require('../');
const { delay, randNatural, shuffle } = require('./assist');

(async () => {
    const total = 270;
    const arr = Array.apply(null, { length: total }).map((el, idx) => idx);
    shuffle(arr);

    /* 初始化 */
    const stateList = [BACKGROUND.WHITE, BACKGROUND.GREEN, BACKGROUND.RED];
    const blockProgress = new BlockProgress(50, stateList);
    blockProgress.init(total);

    for (let i = 0; i < total; i += 1) {
        await delay(100);
        blockProgress.update(arr.pop(), randNatural(stateList.length - 1) + 1, i === total - 1);
    }
    blockProgress.end();
})();