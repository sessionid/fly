const { LineProgress } = require('../');
const { delay } = require('./assist');

(async() => {
    const lineProgress = new LineProgress(40, { undoneColor: 'red' });

    for (let i = 0; i <= 40; i += 1) {
        await delay(100);
        lineProgress.update(i);
    }
})();
