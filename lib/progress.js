const { digitCalc } = require('./assist');
const sequence = require('./sequence');

class Progress {
    constructor(stdout = process.stdout) {
        this.finalState = null;
        this.free = true;
        this.stdout = stdout;
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

    async write(str) {
        return new Promise((res, rej) => {
            this.stdout.write(str, e => e ? rej(e) : res());
        });
    }
}

class BlockProgress extends Progress {
    constructor(lineSize = 20, stateList = [], expectState = 1, stdout) {
        super(stdout);
        this.counter = 0;
        this.total = 0;
        this.lineSize = Math.min(lineSize, Math.floor(this.stdout.columns/2));
        this.stateList = stateList.map(color => sequence.colorString('  ', undefined, color));
        this.expectState = expectState;

        this._resizeListener = this._resizeListener.bind(this);
        this.stdout.on('resize', this._resizeListener);
    }

    _resizeListener() {
        const { lineSize, stdout, total } = this;
        this.lineSize = Math.min(lineSize, Math.floor(stdout.columns/2));
        this.jumpChar = sequence.verticalBack(total, this.lineSize);
        this.endChar = sequence.verticalForward(total, this.lineSize);
    }

    init(total) {
        this.total = total;
        this.list = Array(total).fill(0);
        this.jumpChar = sequence.verticalBack(total, this.lineSize);
        this.endChar = sequence.verticalForward(total, this.lineSize);
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
        str += `${sequence.CONSTANTS.CURSOR_HIDE}\r`;
        /* if the end, sequence next line and show the cursor */
        str += (counter === list.length) ? `${sequence.CONSTANTS.CURSOR_SHOW}\n` : jumpChar;
        /* write to stdout */
        return this.write(str);
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
        this.write(`${sequence.CONSTANTS.CURSOR_SHOW}${this.endChar}\n`);
        /* remove the listener from stdout */
        this.stdout.off('resize', this._resizeListener);
    }
}

class LineProgress extends Progress {
    constructor(max = 10, { doneColor = sequence.CONSTANTS.BACKGROUND.GREEN, undoneColor = sequence.CONSTANTS.BACKGROUND.WHITE, stdout } = {}) {
        super(stdout);
        this.max = max;

        const maxSize = this.stdout.columns - digitCalc(max) * 2 - 1;
        if (max > maxSize) {
            throw new Error(`max: ${max} is larger than max acceptable width ${maxSize}`);
        }

        this.doneChar = sequence.colorString(' ', undefined, doneColor);
        this.undoneChar = sequence.colorString(' ', undefined, undoneColor);
    }

    frame(current) {
        const { max, doneChar, undoneChar } = this;
        if (current < 0 || current > max) {
            throw new Error('invalid state');
        }
        let str = `\r${sequence.CONSTANTS.CURSOR_HIDE}${doneChar.repeat(current)}${undoneChar.repeat(max - current)} ${current}/${max}`;
        /* show the cursor when finish */
        (current === max) && (str += sequence.CONSTANTS.CURSOR_SHOW);
        return this.write(str);
    }
}

class PercentLineProgress extends Progress {

    constructor(max = 10, { doneColor = sequence.CONSTANTS.BACKGROUND.GREEN, undoneColor = sequence.CONSTANTS.BACKGROUND.WHITE, stdout } = {}) {
        super(stdout);
        this.max = Math.min(max, Math.floor(this.stdout.columns) - 7);
        this.doneChar = sequence.colorString(' ', undefined, doneColor);
        this.undoneChar = sequence.colorString(' ', undefined, undoneColor);
        this._resizeListener = this._resizeListener.bind(this);
        this.stdout.on('resize', this._resizeListener);
    }

    _resizeListener() {
        const { max, stdout: { columns } } = this;
        this.max = Math.min(max, Math.floor(columns) - 7);
    }

    frame(percentage) {
        if(percentage < 0 || percentage > 1) throw new Error('invalid state');
        const { max, doneChar, undoneChar } = this;
        const colored = Math.floor(max * percentage);
        let str = `\r${sequence.CONSTANTS.CURSOR_HIDE}${doneChar.repeat(colored)}${undoneChar.repeat(max - colored)} ${(percentage*100).toFixed(2)}%`;
        /* show the cursor when finish */
        (percentage === 1) && (str += sequence.CONSTANTS.CURSOR_SHOW);
        return this.write(str);
    }
}

module.exports = { BlockProgress, LineProgress, PercentLineProgress };
