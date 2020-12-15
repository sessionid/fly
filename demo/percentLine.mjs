import { progress } from '../index.mjs';
import { delay } from './assist.mjs';

const { PercentLineProgress } = progress;

(async() => {
    const lineProgress = new PercentLineProgress(40);

    for (let i = 0; i <= 40; i += 1) {
        await delay(100);
        lineProgress.update(i/40);
    }
})();