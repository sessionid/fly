/* calc number of digits */
const digitCalc = (number, radix = 10) => {
    let total = 1;
    if (number < 0) radix *= -1;
    while(number = Math.floor(number/radix)) total += 1;
    return total;
}

export { digitCalc };