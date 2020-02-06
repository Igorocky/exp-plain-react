'use strict';

const LINES = ints(1,46)
const CIRCLES = ints(LINES[LINES.length-1]+1,LINES[LINES.length-1]+64)
const ROOKS = ints(CIRCLES[CIRCLES.length-1]+1,CIRCLES[CIRCLES.length-1]+64)
const BISHOPS = ints(ROOKS[ROOKS.length-1]+1,ROOKS[ROOKS.length-1]+64)
const FOOTPRINTS = [...LINES,...CIRCLES,...ROOKS,...BISHOPS]

const Connections = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const {renderChessboard, checkCell, uncheckAllCells, showImageOnCell, hideImageOnAllCells} = useChessboard({cellSize:72, configName:configName})
    const [phaseQuestion, setPhaseQuestion] = useState(true)

    function getNewRndElemSelector() {
        return new RandomElemSelector({
            elems: FOOTPRINTS.filter(i => {
                const type = getConnectionType(i)

                // return type.diagonal && type.length > 1
                // return type.horizontal || type.vertical

                return hasValue(type.knight)
                // return hasValue(type.rook)
                // return hasValue(type.bishop)

                // const cellNum = type.knight
                // return hasValue(cellNum) && [0].includes(cellNum % 12)
             })
        })
    }

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

    function createRay(x, y, dx, dy) {
        const result = [{x:x,y:y}]
        let nextCell = {x:result[0].x+dx,y:result[0].y+dy}
        while (isValidCell(nextCell)) {
            result.push(nextCell)
            nextCell = {x:nextCell.x+dx,y:nextCell.y+dy}
        }
        return result;
    }

    function createRayH(x, y, dirHour) {
        const dir = hourToDir(dirHour)
        return createRay(x,y,dir.dx,dir.dy)
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

    function moveToCellRelatively(baseCell,dx,dy) {
        return {x:baseCell.x+dx, y:baseCell.y+dy}
    }

    function knightMovesFrom(cell) {
        return _.filter([
            moveToCellRelatively(cell,-2,-1),
            moveToCellRelatively(cell,-2,+1),
            moveToCellRelatively(cell,-1,+2),
            moveToCellRelatively(cell,+1,+2),
            moveToCellRelatively(cell,+2,+1),
            moveToCellRelatively(cell,+2,-1),
            moveToCellRelatively(cell,+1,-2),
            moveToCellRelatively(cell,-1,-2)
        ], c => isValidCell(c))
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

    const onCellClicked = cell => {
        setPhaseQuestion(!phaseQuestion)
        if (!phaseQuestion) {
            uncheckAllCells()
            hideImageOnAllCells()
            rndElemSelector.loadNextElem()
        } else {
            createCellsByConnectionNumber(rndElemSelector.getCurrentElem()).forEach(c => showImageOnCell(c))
        }
    }

    function renderQuestion() {
        return RE.div({style:{fontSize:"100px"}},
            getConnectionType(rndElemSelector.getCurrentElem()).symbol
        )
    }

    return RE.Container.row.left.top({},{style:{marginRight:"20px"}},
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderQuestion(),
            RE.div({}, "Iteration: " + rndElemSelector.getIterationNumber()),
            RE.div({}, "Remaining elements: " + rndElemSelector.getRemainingElements()),
            RE.Button({onClick:onCellClicked}, "Next")
        ),
        !phaseQuestion?renderChessboard({onCellClicked:onCellClicked}):null,
    )
}

