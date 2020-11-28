const print = require('./print');

const stdoutWrite = (str) => new Promise((res, rej) => {
    process.stdout.write(str, e => e ? rej(e) : res());
});

class Progress {
    constructor() {
        this.finalState = null;
        this.free = true;
    }

    frame() {
        return Promise.resolve();
    }

    update(...newState) {
        if(this.free) {
            this.free = false;
            this.frame(...newState).then(() => {
                this.free = true;
                if (this.finalState) {
                    this.frame(...this.finalState);
                    this.finalState = null;
                }
            }).catch(console.error);
        } else {
            this.finalState = newState;
        }
    }
}

class BlockProgress extends Progress {
    constructor(lineSize = 20, stateList = []) {
        super();
        this.lineSize = lineSize;
        this.stateList = stateList.map(color => print.colorString('  ', undefined, color));
    }

    init(total) {
        this.list = Array(total).fill(0);
        this.jumpChar = print.verticalBack(total, this.lineSize);
    }

    frame(idx, state, final = false) {
        const { list, stateList, jumpChar, lineSize  } = this;
        if (state < 0 || state >= stateList.length) return Promise.reject(Error(`invalid state ${state}`));
        list[idx] = state;

        let str = list.reduce((str, state, idx) => {
            str += stateList[state];
            if (!((idx + 1) % lineSize)) str += '\n';
            return str;
        }, '');

        /* back to the head */
        str += `${print.CONSTANTS.CURSOR_HIDE}\r`;
        /* if the end, print next line and show the cursor */
        str += final ? `${print.CONSTANTS.CURSOR_SHOW}\n` : jumpChar;
        /* write to stdout */
        return stdoutWrite(str);
    }
}

class LineProgress extends Progress {
    constructor(max = 10, { doneColor = print.CONSTANTS.BACKGROUND.GREEN, undoneColor = print.CONSTANTS.BACKGROUND.WHITE }) {
        super();
        this.max = max;
        this.doneChar = print.colorString(' ', undefined, doneColor);
        this.undoneChar = print.colorString(' ', undefined, undoneColor);
    }

    frame(current) {
        const { max, doneChar, undoneChar } = this;
        if (current < 0 || current > max) return Promise.reject('out of range');
        let str = `\r${print.CONSTANTS.CURSOR_HIDE}${doneChar.repeat(current)}${undoneChar.repeat(max - current)} ${current}/${max}`;
        /* show the cursor when finish */
        (current === max) && (str += print.CONSTANTS.CURSOR_SHOW);
        return stdoutWrite(str);
    }
}

class PercentLineProgress extends LineProgress {
    frame(percentage) {
        const { max, doneChar, undoneChar } = this;
        if (percentage > 1) return Promise.reject('invalid percentage');
        const colored = Math.floor(max * percentage);
        let str = `\r${print.CONSTANTS.CURSOR_HIDE}${doneChar.repeat(colored)}${undoneChar.repeat(max - colored)} ${(percentage*100).toFixed(2)}%`;
        /* show the cursor when finish */
        (percentage === 1) && (str += print.CONSTANTS.CURSOR_SHOW);
        return stdoutWrite(str);
    }
}

module.exports = { BlockProgress, LineProgress, PercentLineProgress };
