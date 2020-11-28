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
            }).catch(e => { if (e) throw e });
        } else {
            this.finalState = newState;
        }
    }
}

class BlockProgress extends Progress {
    constructor(lineSize = 20, stateList = [], expectState = 1) {
        super();
        this.lineSize = lineSize;
        this.stateList = stateList.map(color => print.colorString('  ', undefined, color));
        this.counter = 0;
        this.expectState = expectState;
    }

    init(total) {
        this.list = Array(total).fill(0);
        this.jumpChar = print.verticalBack(total, this.lineSize);
        this.endChar = print.verticalForward(total, this.lineSize);
    }

    frame(idx, state) {
        const { list, stateList, jumpChar, lineSize, counter } = this;
        list[idx] = state;

        let str = list.reduce((str, state, idx) => {
            str += stateList[state];
            if (!((idx + 1) % lineSize)) str += '\n';
            return str;
        }, '');

        /* back to the head */
        str += `${print.CONSTANTS.CURSOR_HIDE}\r`;
        /* if the end, print next line and show the cursor */
        str += (counter === list.length) ? `${print.CONSTANTS.CURSOR_SHOW}\n` : jumpChar;
        /* write to stdout */
        return stdoutWrite(str);
    }

    update(idx, state) {
        const { stateList, list } = this;
        if (state >= 0 && state < stateList.length && idx >= 0 && idx < list.length) {
            if (state === this.expectState) {
                this.counter += 1;
            }
            super.update(idx, state);
        } else {
            throw new Error('invalid state');
        }
    }

    end() {
        this.finalState = null;
        stdoutWrite(`${print.CONSTANTS.CURSOR_SHOW}${this.endChar}\n`);
    }
}

class LineProgress extends Progress {
    constructor(max = 10, { doneColor = print.CONSTANTS.BACKGROUND.GREEN, undoneColor = print.CONSTANTS.BACKGROUND.WHITE } = {}) {
        super();
        this.max = max;
        this.doneChar = print.colorString(' ', undefined, doneColor);
        this.undoneChar = print.colorString(' ', undefined, undoneColor);
    }

    frame(current) {
        const { max, doneChar, undoneChar } = this;
        if (current < 0 || current > max) {
            throw new Error('invalid state');
        }
        let str = `\r${print.CONSTANTS.CURSOR_HIDE}${doneChar.repeat(current)}${undoneChar.repeat(max - current)} ${current}/${max}`;
        /* show the cursor when finish */
        (current === max) && (str += print.CONSTANTS.CURSOR_SHOW);
        return stdoutWrite(str);
    }
}

class PercentLineProgress extends LineProgress {

    frame(percentage) {
        if(percentage < 0 || percentage > 1) throw new Error('invalid state');
        const { max, doneChar, undoneChar } = this;
        const colored = Math.floor(max * percentage);
        let str = `\r${print.CONSTANTS.CURSOR_HIDE}${doneChar.repeat(colored)}${undoneChar.repeat(max - colored)} ${(percentage*100).toFixed(2)}%`;
        /* show the cursor when finish */
        (percentage === 1) && (str += print.CONSTANTS.CURSOR_SHOW);
        return stdoutWrite(str);
    }
}

module.exports = { BlockProgress, LineProgress, PercentLineProgress };
