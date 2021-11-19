export function checkModules() {
    let error = false;

    return error;
}

export function getDistanceClassic(pointA, pointB) {
    return Math.sqrt(Math.pow((pointA.x - pointB.x), 2) + Math.pow((pointA.y - pointB.y), 2));
}

export function measureDistance(pointA, pointB) {
    const ray = new Ray({ x: pointA.x, y: pointA.y }, { x: pointB.x, y: pointB.y });
    const segments = [{ ray }];
    let dist = canvas.grid.measureDistances(segments, { gridSpaces: true })[0]
    return dist;
}

export function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

export function strikeThrough(text) {
    return text
        .split('')
        .map(char => char + '\u0336')
        .join('')
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex(r, g, b) {
    return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function getCenter(pos, width = 1) {
    return ({ x: pos.x + ((canvas.grid.size / 2) * width), y: pos.y + ((canvas.grid.size / 2) * width) });
}

export function getTileCenter(tile) {
    //return position offset by tile width/2 and height/2
    return ({ x: tile.x + (tile.width / 2), y: tile.y + (tile.height / 2) })
}

export async function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


function firstGM() {
    return game.users.find(u => u.isGM && u.active);
}

export function isFirstGM() {
    return game.user.id === firstGM()?.id;
}

export function getDBOptions(rawSet) {
    let options = {};
    let setOptions = Sequencer.Database.getPathsUnder(rawSet);
    //console.log(setOptions)
    if (setOptions) {
        setOptions.forEach((elem) => {
            options[elem] = capitalizeFirstLetter(elem);
        });
        //console.log(options);
    }
    return options;
}

export function isMidiActive() {
    if (game.modules.get("midi-qol")?.active) {
        return true;
    }
    return false;
}