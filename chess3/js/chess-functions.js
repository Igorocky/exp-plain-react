'use strict';

const profile = (prof, superProf) => [prof, ...(superProf?superProf:[])]
const PROFILE_DEFAULT = profile("PROFILE_DEFAULT")
const PROFILE_MOBILE = profile("PROFILE_MOBILE", PROFILE_DEFAULT)
const PROFILE_FUJ = profile("PROFILE_FUJ", PROFILE_DEFAULT)
const PROFILE_FUJ_FULL = profile("PROFILE_FUJ_FULL", PROFILE_FUJ)
const PROFILE_FUJ_BENQ = profile("PROFILE_FUJ_BENQ", PROFILE_FUJ)

const PROFILE = PROFILE_MOBILE

const ENTER_KEY_CODE = 13
const ESC_KEY_CODE = 27
const SPACE_KEY_CODE = 32
const LEFT_KEY_CODE = 37
const UP_KEY_CODE = 38
const RIGHT_KEY_CODE = 39
const DOWN_KEY_CODE = 40
const KEY_CODE_H = 72
const KEY_CODE_J = 74
const KEY_CODE_K = 75
const KEY_CODE_L = 76

const KEYDOWN_LISTENER_NAME = 'keydown'
const MOUSEDOWN_LISTENER_NAME = 'mousedown'
const MOUSEUP_LISTENER_NAME = 'mouseup'

const SIGNAL_TYPE_SINE = "sine"
const SIGNAL_TYPE_SQUARE = "square"
const SIGNAL_TYPE_SAWTOOTH = "sawtooth"
const SIGNAL_TYPE_TRIANGLE = "triangle"

const XX = ["a","b","c","d","e","f","g","h"]
const YY = ["1","2","3","4","5","6","7","8"]

function randomElemSelector({allElems, remainingElems, iterationNumber}) {
    const newState = {allElems: allElems, remainingElems: remainingElems, iterationNumber: iterationNumber}
    if (!hasValue(remainingElems) || remainingElems.length==0) {
        newState.remainingElems = [...allElems]
        newState.iterationNumber = hasValue(iterationNumber) ? iterationNumber + 1 : 1
    }
    newState.remainingElems = _.shuffle(newState.remainingElems)
    newState.currentElem = _.first(newState.remainingElems)
    newState.remainingElems = _.rest(newState.remainingElems)
    newState.next = () => randomElemSelector(newState)
    return newState
}


function getCellName({x,y}) {
    return XX[x] + YY[y]
}

function isBlackCell({x,y}) {
    return (x+y)%2 == 0
}

function isWhiteCell(cell) {
    return !isBlackCell(cell)
}

function isBlackCellI(i) {
    return isBlackCell(absNumToCell(i))
}

function isWhiteCellI(i) {
    return isWhiteCell(absNumToCell(i))
}

function cellToAbsNum(cell) {
    return cell.y*8 + cell.x
}

function absNumToCell(num) {
    return {x:num%8, y:Math.floor(num/8)}
}

function isValidCell(cell) {
    return 0 <= cell.x && cell.x < 8 && 0 <= cell.y && cell.y < 8
}

function hourToDir(hour) {
    if (hour == 10 || hour == 11) return {dx:-1, dy:1}
    if (hour == 12) return {dx:0, dy:1}
    if (hour == 1 || hour == 2) return {dx:1, dy:1}
    if (hour == 9) return {dx:-1, dy:0}
    if (hour == 3) return {dx:1, dy:0}
    if (hour == 7 || hour == 8) return {dx:-1, dy:-1}
    if (hour == 6) return {dx:0, dy:-1}
    if (hour == 4 || hour == 5) return {dx:1, dy:-1}
}

function moveToCellRelatively(baseCell,dir) {
    return {x:baseCell.x+dir.dx, y:baseCell.y+dir.dy}
}

function cellNumToCellName(cellNum) {
    return getCellName(absNumToCell(cellNum))
}

function equalCells(c1, c2) {
    return c1.x === c2.x && c1.y === c2.y
}

function isSameDir(dir1, dir2) {
    return dir1.dx == dir2.dx && dir1.dy == dir2.dy
}

function isOppositeDir(dir1, dir2) {
    return dir1.dx == -dir2.dx && dir1.dy == -dir2.dy
}

function isNextDir(dir1, dir2) {
    return dir1.dx == dir2.dx && Math.abs(dir1.dy - dir2.dy) == 1
        || dir1.dy == dir2.dy && Math.abs(dir1.dx - dir2.dx) == 1
}

function profVal(...values) {
    const numOfPairs = values.length / 2
    let profIdx = 0
    while (profIdx < PROFILE.length) {
        const profName = PROFILE[profIdx]
        for (let i = 0; i < numOfPairs; i++) {
            const pairIdx = i*2
            if (values[pairIdx][0] === profName) {
                return values[pairIdx+1]
            }
        }
        profIdx++
    }
}

function disableScrollOnMouseDown(event) {
    if(event.button==1){
        event.preventDefault()
    }
}

function saveSettingsToLocalStorage({settings, attrsToSave, localStorageKey}) {
    const settingsToSave = attrsToSave.reduce((acc,attr) => ({...acc, [attr]:settings[attr]}), {})
    window.localStorage.setItem(localStorageKey, JSON.stringify(settingsToSave))
}

function readSettingsFromLocalStorage({localStorageKey, attrsToRead}) {
    const settingsStr = window.localStorage.getItem(localStorageKey)
    if (settingsStr) {
        const settingsFromLocalStorage = JSON.parse(settingsStr)
        return attrsToRead.reduce((acc,attr) => ({...acc, [attr]:settingsFromLocalStorage[attr]}), {})
    } else {
        return {}
    }
}
