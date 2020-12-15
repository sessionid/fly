const delay = (timeout) => new Promise(res => setTimeout(res, timeout));
const randNatural = (ceil) => Math.floor(Math.random() * ceil);
const shuffle = (list) => {
    let i = list.length;
    while (i) {
        const rand = randNatural(i--);
        [list[i], list[rand]] = [list[rand], list[i]];
    }
    return list;
};

export { delay, randNatural, shuffle };