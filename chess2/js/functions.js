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
const UP_KEY_CODE = 38
const DOWN_KEY_CODE = 40
const SPACE_KEY_CODE = 32

const KEYDOWN_LISTENER_NAME = 'keydown'
const MOUSEDOWN_LISTENER_NAME = 'mousedown'
const MOUSEUP_LISTENER_NAME = 'mouseup'

const XX = ["a","b","c","d","e","f","g","h"]
const YY = ["1","2","3","4","5","6","7","8"]

function hasValue(variable) {
    return variable !== undefined && variable !== null
}

function randomInt(min, max) {
    return min + Math.floor(Math.random()*((max-min)+1))
}

function ints(start, end) {
    let i = start
    const res = [];
    while (i <= end) {
        res.push(i)
        i++
    }
    return res
}

function flatMap(list, func) {
    const res = []
    _.each(list, elem=>res.push(...func(elem)))
    return res
}

function product(...lists) {
    if (_.size(lists) == 0) return [[]]
    return flatMap(_.first(lists), elem=>_.map(product(..._.rest(lists)), rightPart=>[elem,...rightPart]))
}

function clone(obj, modifiers) {
    return {...(obj?obj:{}), ...(modifiers?modifiers:{})}
}

function apply(func, ...args) {
    if (func) {
        return func(...args)
    }
}

class RandomElemSelector {
    constructor({elems}) {
        this.origElems = elems
        this.reset()
    }

    getCurrentElem() {
        return this.state.currentElem
    }

    getIterationNumber() {
        return this.state.iterationNumber
    }

    getRemainingElements() {
        return _.size(this.state.elemsToAsk)
    }

    reset() {
        this.state = {elemsToAsk: [], iterationNumber:0}
        this.loadNextElem()
    }

    loadNextElem() {
        let elemsToAsk = this.state.elemsToAsk
        if (_.size(elemsToAsk)==0) {
            elemsToAsk = [...this.origElems]
            this.state.iterationNumber += 1
        }
        elemsToAsk = _.shuffle(elemsToAsk)
        this.state.currentElem = _.first(elemsToAsk)
        this.state.elemsToAsk = _.rest(elemsToAsk)
    }
}

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

const LINES = ints(1,46)
const CIRCLES = ints(LINES[LINES.length-1]+1,LINES[LINES.length-1]+64)
const ROOKS = ints(CIRCLES[CIRCLES.length-1]+1,CIRCLES[CIRCLES.length-1]+64)
const BISHOPS = ints(ROOKS[ROOKS.length-1]+1,ROOKS[ROOKS.length-1]+64)
const FOOTPRINTS = [...LINES,...CIRCLES,...ROOKS,...BISHOPS]

function lineNumberToDirH(lineNumber) {
    if (lineNumber <= 15) {
        return 2
    } else if (lineNumber <= 30) {
        return 4
    } else if (lineNumber <= 38) {
        return 12
    } else if (lineNumber <= 46) {
        return 3
    }
}

function isValidCell(cell) {
    return 0 <= cell.x && cell.x < 8 && 0 <= cell.y && cell.y < 8
}

function createRayH(x, y, dirHour) {
    const dir = hourToDir(dirHour)
    return createRay(x,y,dir.dx,dir.dy)
}
function rayHFrom(x, y, dirHour) {
    const dir = hourToDir(dirHour)
    return rayFrom(x,y,dir.dx,dir.dy)
}
function createRay(x, y, dx, dy) {
    return [{x:x,y:y}, ...rayFrom(x, y, dx, dy)]
}
function rayFrom(x, y, dx, dy) {
    const result = []
    let nextCell = {x:x+dx,y:y+dy}
    while (isValidCell(nextCell)) {
        result.push(nextCell)
        nextCell = {x:nextCell.x+dx,y:nextCell.y+dy}
    }
    return result;
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

function knightMovesFrom(cell) {
    return [
        moveToCellRelatively(cell,{dx:-2,dy:-1}),
        moveToCellRelatively(cell,{dx:-2,dy:+1}),
        moveToCellRelatively(cell,{dx:-1,dy:+2}),
        moveToCellRelatively(cell,{dx:+1,dy:+2}),
        moveToCellRelatively(cell,{dx:+2,dy:+1}),
        moveToCellRelatively(cell,{dx:+2,dy:-1}),
        moveToCellRelatively(cell,{dx:+1,dy:-2}),
        moveToCellRelatively(cell,{dx:-1,dy:-2})
    ].filter(isValidCell)
}

function createCellsByConnectionNumber(connectionNumber) {
    if (connectionNumber <= 8) {
        return createRayH(0,8-connectionNumber, lineNumberToDirH(connectionNumber))
    } else if (connectionNumber <= 15) {
        return createRayH(connectionNumber-8,0, lineNumberToDirH(connectionNumber))
    } else if (connectionNumber <= 23) {
        return createRayH(23-connectionNumber,7, lineNumberToDirH(connectionNumber))
    } else if (connectionNumber <= 30) {
        return createRayH(0,30-connectionNumber, lineNumberToDirH(connectionNumber))
    } else if (connectionNumber <= 38) {
        return createRayH(connectionNumber - 31,0, lineNumberToDirH(connectionNumber))
    } else if (connectionNumber <= 46) {
        return createRayH(0,connectionNumber - 39, lineNumberToDirH(connectionNumber))
    } else if (connectionNumber <= CIRCLES[CIRCLES.length-1]) {
        const currCell = absNumToCell(connectionNumber-CIRCLES[0]);
        return [currCell, ...knightMovesFrom(currCell)]
    } else if (connectionNumber <= ROOKS[ROOKS.length-1]) {
        const currCell = absNumToCell(connectionNumber-ROOKS[0]);
        return [
            ...createRayH(currCell.x, currCell.y, 12),
            ...createRayH(currCell.x, currCell.y, 6),
            ...createRayH(currCell.x, currCell.y, 3),
            ...createRayH(currCell.x, currCell.y, 9),
        ]
    } else if (connectionNumber <= BISHOPS[BISHOPS.length-1]) {
        const currCell = absNumToCell(connectionNumber-BISHOPS[0]);
        return [
            ...createRayH(currCell.x, currCell.y, 1),
            ...createRayH(currCell.x, currCell.y, 7),
            ...createRayH(currCell.x, currCell.y, 4),
            ...createRayH(currCell.x, currCell.y, 10),
        ]
    }
}

function getDirForLine(cells) {
    if (_.size(cells) == 1) {
        const x = cells[0].x
        const y = cells[0].y
        if (x == 0 && y == 0 || x != 0 && y != 0) {
            return 4
        } else {
            return 2
        }
    } else {
        const dx = cells[0].x-cells[1].x
        const dy = cells[0].y-cells[1].y
        if (dx == 0) {
            return 12
        } else if (dy == 0) {
            return 3
        } else if (dx < 0 && dy < 0 || dx > 0 && dy > 0) {
            return 2
        } else {
            return 4
        }
    }
}

function getConnectionType(connectionNumber) {
    if (connectionNumber <= LINES[LINES.length-1]) {
        const allCells = createCellsByConnectionNumber(connectionNumber)
        const length = _.size(allCells);
        const dir = getDirForLine(allCells)
        if (dir == 12) {
            return {typeNum: 1, vertical:true, symbol: String.fromCharCode(97+allCells[0].x)}
        } else if (dir == 3) {
            return {typeNum: 2, horizontal:true, symbol: new String(allCells[0].y+1)}
        } else if (dir == 2) {
            const color = length%2==0?0:1
            if (allCells[0].y >= allCells[0].x) {
                return {typeNum: 3, diagonal:true, length: length, color: color, above: true, symbol: length + "/"}
            } else {
                return {typeNum: 4, diagonal:true, length: length, color: color, above: false, symbol: "/" + length}
            }
        } else if (dir == 4) {
            const color = length%2==0?1:0
            if (allCells[0].x + allCells[0].y <= 7) {
                return {typeNum: 5, diagonal:true, length: length, color: color, above: false, symbol: length + "\\"}
            } else {
                return {typeNum: 6, diagonal:true, length: length, color: color, above: true, symbol: "\\" + length}
            }
        }
    } else if (connectionNumber <= CIRCLES[CIRCLES.length-1]) {
        const cellNum = connectionNumber-CIRCLES[0]
        return {typeNum: 7, knight:cellNum, symbol: "N " + cellNumToCellName(cellNum)}
    } else if (connectionNumber <= ROOKS[ROOKS.length-1]) {
        const cellNum = connectionNumber-ROOKS[0]
        return {typeNum: 8, rook:cellNum, symbol: "R " + cellNumToCellName(cellNum)}
    } else if (connectionNumber <= BISHOPS[BISHOPS.length-1]) {
        const cellNum = connectionNumber-BISHOPS[0]
        return {typeNum: 9, bishop:cellNum, symbol: "B " + cellNumToCellName(cellNum)}
    }
}

function cellNumToCellName(cellNum) {
    return getCellName(absNumToCell(cellNum))
}

function cellsOfSameType(blackBase) {
    function rightCorrespondence({x,y}) {
        return {x:x+4, y:y}
    }
    function centerSymmetry({x,y}) {
        return {x: 7-x, y: 7-y}
    }
    const whiteBase = {x:3-blackBase.x, y:blackBase.y}
    return [blackBase, whiteBase]
        .flatMap(c => [c, rightCorrespondence(c), centerSymmetry(c), centerSymmetry(rightCorrespondence(c))])
}

const LEFT_FOOT = cellsOfSameType(A1)
const RIGHT_FOOT = cellsOfSameType(C1)
const STOMACH = cellsOfSameType(B2)
const LEFT_SHOULDER = cellsOfSameType(A3)
const RIGHT_SHOULDER = cellsOfSameType(C3)
const HEAD = cellsOfSameType(B4)
const HAND = cellsOfSameType(D2)
const SHOVEL = cellsOfSameType(D4)

const CELL_SHAPES = ints(0,7).map(i => [
    LEFT_FOOT[i],
    RIGHT_FOOT[i],
    STOMACH[i],
    LEFT_SHOULDER[i],
    RIGHT_SHOULDER[i],
    HEAD[i],
    HAND[i],
    SHOVEL[i],
])

function getCellsOfSameShape(cell) {
    for (let i = 0; i < 8; i++) {
        if (arrayOfCellsContainsCell(CELL_SHAPES[i], cell)) {
            return CELL_SHAPES[i].map(({x,y}) => ({x:x,y:y}))
        }
    }
}

function arrayOfCellsContainsCell(arr, cell) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].x == cell.x && arr[i].y == cell.y) {
            return true
        }
    }
    return false
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

function arrMin(arr) {
    return Math.min.apply(Math, arr)
}

function arrMax(arr) {
    return Math.max.apply(Math, arr)
}

function arrSum(arr) {
    return arr.reduce((a,b) => a+b)
}

function inc(arr, idx) {
    return modify(arr, idx, i => i+1)
}

function modify(arr, idx, modifier) {
    return [...arr.slice(0,idx), modifier(arr[idx]), ...(idx >= arr.length-1 ? [] : arr.slice(idx+1,arr.length))]
}

function useTimer({onTimer, defaultDelay}) {
    const [autoNextCnt, setAutoNextCnt] = useState(null)
    const [autoNextDelay, setAutoNextDelay] = useState(defaultDelay?defaultDelay:1500)

    useEffect(() => {
        if (autoNextCnt) {
            setTimeout(
                () => {
                    onTimer()
                    setAutoNextCnt(c => c?c+1:null)
                },
                autoNextDelay
            )
        }
    }, [autoNextCnt])

    function startPauseTimer() {
        if (!autoNextCnt) {
            const newDelay = prompt("Repeat delay", autoNextDelay);
            if (newDelay == null) {
                return
            }
            setAutoNextDelay(newDelay)
            setAutoNextCnt(1)
        } else {
            setAutoNextCnt(null)
        }
    }

    return [startPauseTimer, autoNextCnt != null]
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

function set(obj, attrName, newValue) {
    return {...obj, [attrName]:newValue}
}

function nvl(...args) {
    for (let i = 0; i < args.length; i++) {
        if (hasValue(args[i])) {
            return args[i]
        }
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

const BEEP_TYPE_SINE = "sine"
const BEEP_TYPE_SQUARE = "square"
const BEEP_TYPE_SAWTOOTH = "sawtooth"
const BEEP_TYPE_TRIANGLE = "triangle"
let AUDIO_CTX = null
function beep({durationMillis, frequencyHz, volume, type, callback}) {
    if (!AUDIO_CTX) {
        AUDIO_CTX = new (window.AudioContext || window.webkitAudioContext || window.audioContext)
    }
    const oscillator = AUDIO_CTX.createOscillator()
    const gainNode = AUDIO_CTX.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(AUDIO_CTX.destination)

    oscillator.frequency.value = frequencyHz?frequencyHz:440
    oscillator.type = type?type:BEEP_TYPE_SINE
    oscillator.onended = callback?callback:undefined
    gainNode.gain.value = volume?volume:1

    oscillator.start()
    oscillator.stop(AUDIO_CTX.currentTime + ((durationMillis || 500) / 1000));
}

function firstDefined(attrName, o1, o2, defVal) {
    const v1 = o1 ? o1[attrName] : undefined
    if (v1 !== undefined) {
        return v1
    }
    const v2 = o2 ? o2[attrName] : undefined
    if (v2 !== undefined) {
        return v2
    }
    return defVal
}

function withDefault(value, defVal) {
    return hasValue(value) ? value : defVal
}