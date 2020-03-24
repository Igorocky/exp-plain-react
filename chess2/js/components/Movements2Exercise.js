'use strict';

const Movements2Exercise = ({configName}) => {
    const RIGHT = String.fromCharCode(8594);
    const RIGHT_UP = String.fromCharCode(8599);
    const RIGHT_DOWN = String.fromCharCode(8600);
    const UP = String.fromCharCode(8593);
    const DOWN = String.fromCharCode(8595);
    const LEFT = String.fromCharCode(8592);
    const LEFT_UP = String.fromCharCode(8598);
    const LEFT_DOWN = String.fromCharCode(8601);
    const N3 = String.fromCharCode(8867)
    const N9 = String.fromCharCode(8866)
    const N12 = String.fromCharCode(8868)
    const N6 = String.fromCharCode(8869)

    const CURR_CONNECTION = "CURR_CONNECTION"
    const CONNECTIONS = "CONNECTIONS"
    const COUNTS = "COUNTS"
    const CONNECTION_TYPES = "CONNECTION_TYPES"
    const CONNECTION_TYPE_KNIGHT = "CONNECTION_TYPE_KNIGHT"
    const CONNECTION_TYPE_LINE = "CONNECTION_TYPE_LINE"
    const LINE_LENGTH_MIN = "LINE_LENGTH_MIN"
    const LINE_LENGTH_MAX = "LINE_LENGTH_MAX"

    const [state, setState] = useState(() => createState({
        connectionTypes:[
            CONNECTION_TYPE_KNIGHT,
            // CONNECTION_TYPE_LINE,
        ],
        lineLengthMin:2,
        lineLengthMax:5,
    }))

    const cellSize = profVal(PROFILE_MOBILE, 110, PROFILE_FUJ, 180) + "px"
    const tdStyle = {width: cellSize, height: cellSize, fontSize:"5em"}

    function createState({connectionTypes, lineLengthMin, lineLengthMax}) {
        const allConnections = createAllConnections({
            connectionTypes:connectionTypes,
            lineLengthMin:lineLengthMin,
            lineLengthMax:lineLengthMax,
        })
        const currConnection = allConnections[randomInt(0,allConnections.length-1)];
        return {
            [CURR_CONNECTION]: currConnection,
            [CONNECTION_TYPES]: connectionTypes,
            [LINE_LENGTH_MIN]: lineLengthMin,
            [LINE_LENGTH_MAX]: lineLengthMax,
            [CONNECTIONS]: allConnections,
            [COUNTS]: inc(ints(0, allConnections.length-1).map(i => 0), currConnection.idx)
        }
    }

    function createAllConnections({connectionTypes, lineLengthMin, lineLengthMax}) {
        return [
            ...(connectionTypes.includes(CONNECTION_TYPE_KNIGHT)?createKnightConnections():[]),
            ...(connectionTypes.includes(CONNECTION_TYPE_LINE)?createLineConnections(lineLengthMin, lineLengthMax):[]),
        ].map((con, idx) => ({...con, idx:idx}))

    }

    function createKnightConnections() {
        return ints(0,63).map(absNumToCell)
            .flatMap(from =>
                knightMovesFrom(from).map(to => ({from:from, to:to, ...calcSymbolForKnightMove(from,to)}))
            )
    }

    function createLineConnections(lineLengthMin, lineLengthMax) {
        return ints(0,63).map(absNumToCell)
            .flatMap(from =>
                [11,12,1,9,3,7,6,5].flatMap(h => {
                    const ray = rayHFrom(from.x, from.y, h)
                    return ray
                        .map((to,idx) => ({from:from, to:to, len:idx+1, dir:hourToDir(h)}))
                        .filter(con => lineLengthMin <= con.len && con.len <= lineLengthMax)
                        .map(con => ({...con, ...calcSymbolForLineMove(con.from,con.to,con.len)}))
                })
            )
    }

    function calcSymbolForKnightMove(from, to) {
        let result
        if (from.x+1 < to.x) {//right
            result = from.y < to.y
                ? {relSym:N3+UP, dir: hourToDir(12), cellContent:RIGHT}
                : {relSym:N3+DOWN, dir: hourToDir(6), cellContent:RIGHT}
        } else if (to.x+1 < from.x) {//left
            result = from.y < to.y
                ? {relSym:N9+UP, dir: hourToDir(12), cellContent:LEFT}
                : {relSym:N9+DOWN, dir: hourToDir(6), cellContent:LEFT}
        } if (from.y+1 < to.y) {//top
            result = from.x < to.x
                ? {relSym:N12+RIGHT, dir: hourToDir(3), cellContent:UP}
                : {relSym:N12+LEFT, dir: hourToDir(9), cellContent:UP}
        } else if (to.y+1 < from.y) {//bottom
            result = from.x < to.x
                ? {relSym:N6+RIGHT, dir: hourToDir(3), cellContent:DOWN}
                : {relSym:N6+LEFT, dir: hourToDir(9), cellContent:DOWN}
        }
        result.renderQuestion = () => renderCells({
            centralContent:() => renderImage(from),
            contents:[{dir:result.dir, content:() => result.cellContent}]
        })
        return result
    }

    function calcSymbolForLineMove(from, to, length) {
        let result
        if (from.x < to.x) {
            if (from.y < to.y) {
                result = {relSym:RIGHT_UP, dir:hourToDir(2)}
            } else if (from.y == to.y) {
                result = {relSym:RIGHT, dir:hourToDir(3)}
            } else {
                result = {relSym:RIGHT_DOWN, dir:hourToDir(4)}
            }
        } else if (from.x == to.x) {
            if (from.y < to.y) {
                result = {relSym:UP, dir:hourToDir(12)}
            } else {
                result = {relSym:DOWN, dir:hourToDir(6)}
            }
        } else {
            if (from.y < to.y) {
                result = {relSym:LEFT_UP, dir:hourToDir(10)}
            } else if (from.y == to.y) {
                result = {relSym:LEFT, dir:hourToDir(9)}
            } else {
                result = {relSym:LEFT_DOWN, dir:hourToDir(8)}
            }
        }
        result.renderQuestion = () => renderCells({
            centralContent:() => renderImage(from),
            contents:[{dir:result.dir, content:() => length}]
        })
        return result
    }

    function conCanBeChosen({prevCon, con}) {
        return equalCells(prevCon.to, con.from)
            && (!prevCon || !prevCon.dir || !con.dir || !isOppositeDir(prevCon.dir, con.dir))
            && (!prevCon || !equalCells(prevCon.from, con.to))
    }

    function selectRandomConnection({prevCon, cons, counts}) {
        const possibleCons = cons
            .filter(con => conCanBeChosen({prevCon:prevCon, con:con}))
        if (possibleCons.length == 0) {
            throw "possibleCons.length == 0"
        }
        const minCnt = arrMin(possibleCons.map(con => counts[con.idx]))
        const consWithMinCnt = possibleCons.filter(con => counts[con.idx] == minCnt)
        return consWithMinCnt[randomInt(0, consWithMinCnt.length-1)]
    }

    function onNextClicked(state) {
        state = set(state, CURR_CONNECTION, selectRandomConnection({
            prevCon: state[CURR_CONNECTION],
            cons: state[CONNECTIONS],
            counts: state[COUNTS]
        }))
        state = set(state, COUNTS, inc(state[COUNTS], state[CURR_CONNECTION].idx))
        return state
    }

    function renderQuestion() {
        return state[CURR_CONNECTION].renderQuestion()
    }

    function getContentForDir(cellDir, contents) {
        const availableContents = contents.filter(({dir, content}) => isSameDir(cellDir, dir))
        if (availableContents.length > 0) {
            return availableContents[0].content
        } else {
            return () => ""
        }
    }

    function renderImage(cell) {
        if (isValidCell(cell)) {
            return RE.img({
                src:"chess-board-configs/" + configName + "/" + getCellName(cell) + ".png",
                className: "cell-img"
            })
        } else {
            return ""
        }
    }

    function renderCell(content) {
        return RE.td({style: tdStyle},
            RE.Container.row.center.top({},{}, content())
        )
    }

    function renderCells({centralContent, contents}) {
        return RE.table({className: "chessboard"}, RE.tbody({},
            RE.tr({},
                renderCell(getContentForDir({dx:-1,dy:1}, contents)),
                renderCell(getContentForDir({dx:0,dy:1}, contents)),
                renderCell(getContentForDir({dx:1,dy:1}, contents)),
            ),
            RE.tr({},
                renderCell(getContentForDir({dx:-1,dy:0}, contents)),
                renderCell(centralContent),
                renderCell(getContentForDir({dx:1,dy:0}, contents)),
            ),
            RE.tr({},
                renderCell(getContentForDir({dx:-1,dy:-1}, contents)),
                renderCell(getContentForDir({dx:0,dy:-1}, contents)),
                renderCell(getContentForDir({dx:1,dy:-1}, contents)),
            ),
        ))
    }

    return RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
        renderQuestion(),
        RE.Container.row.left.center({},{},
            RE.div({},
                "Counts: min=" + arrMin(state[COUNTS])
                + ", max=" + arrMax(state[COUNTS])
                + ", sum=" + arrSum(state[COUNTS])
            ),
            RE.Button({onClick: () => console.log(state)}, "View State"),
        ),
        RE.Button({onClick: () => setState(oldState => onNextClicked(oldState)), style:{height:"100px", width:"100px"}}, "Next"),
    )
}

