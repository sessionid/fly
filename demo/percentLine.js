const { PercentLineProgress } = require('../');
const { delay } = require('./assist');

(async() => {
    const lineProgress = new PercentLineProgress(40);

    for (let i = 0; i <= 40; i += 1) {
        await delay(100);
        lineProgress.update(i/40);
    }
})();