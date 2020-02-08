'use strict';

function diag0Length(x, y) {
    return Math.min(x,y) + 8 - Math.max(x,y)
}

function getDiag0Symbol(cellAbsNum) {
    const cell = absNumToCell(cellAbsNum)
    const length = diag0Length(cell.x, cell.y)
    if (cell.y >= cell.x) {
        return length + "/"
    } else {
        return "/" + length
    }
}

function getDiag1Symbol(cellAbsNum) {
    const cell = absNumToCell(cellAbsNum)
    const length = diag0Length(cell.x, 7-cell.y)
    if (cell.x + cell.y <= 7) {
        return length + "\\"
    } else {
        return "\\" + length
    }
}

const CONNECTIONS_INFO = ints(0,63).map(i => ({
    c:cellNumToCellName(i),
    d:[getDiag0Symbol(i), getDiag1Symbol(i)],
    n:knightMovesFrom(absNumToCell(i)).map(getCellName)
}))

const ALL_CONNECTIONS = "ALL_CONNECTIONS"
const LINE_CONNECTIONS = "LINE_CONNECTIONS"
const DIAG_CONNECTIONS = "DIAG_CONNECTIONS"
const KNIGHT_CONNECTIONS = "KNIGHT_CONNECTIONS"

const ConnectionsRev = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const [commandStr, setCommandStr] = useState(null)
    const [userInputIsCorrect, setUserInputIsCorrect] = useState(true)
    const [selectedConnectionType, setSelectedConnectionType] = useState(ALL_CONNECTIONS)

    const cellSize = "150px"
    const divStyle = {width: cellSize, height: cellSize, fontSize: "120px",
        border:userInputIsCorrect?"none":"5px solid red"}

    function getNewRndElemSelector() {
        return new RandomElemSelector({elems: ints(0,63)})
    }

    function onKeyDown(event) {
        if (event.keyCode == ENTER_KEY_CODE){
            if (isUserInputCorrect(commandStr)) {
                setUserInputIsCorrect(true)
                rndElemSelector.loadNextElem()
                setCommandStr(null)
            } else {
                setUserInputIsCorrect(false)
            }
        }
    }

    function renderTextField() {
        return re('input', {
            type:"text",
            autoFocus: true,
            style: {fontSize: "20px", width:"300px"},
            onKeyDown: onKeyDown,
            value: commandStr?commandStr:"",
            variant: "outlined",
            onChange: e => setCommandStr(e.target.value)
        })
    }

    function renderQuestion() {
        return RE.div({style: divStyle}, RE.Container.row.center.top({},{},
            RE.img({
                src:"chess-board-configs/" + configName
                    + "/" + cellNumToCellName(rndElemSelector.getCurrentElem()) + ".png",
                className: "cell-img"
            }),
        ))
    }

    //f4 /6 \\7 e2d3g2h3h5g6e6d5
    function isUserInputCorrect(userInput) {
        const currCellInfo = CONNECTIONS_INFO[rndElemSelector.getCurrentElem()]

        if (selectedConnectionType == ALL_CONNECTIONS) {
            const parts = userInput.split(" ")
            const linesMatch = currCellInfo.c == parts[0]
            const diagonalsMatch = compareArrays(currCellInfo.d, [unifyDiag(parts[1]), unifyDiag(parts[2])])
            const knightsMatch = compareArrays(currCellInfo.n, splitKnightCells(parts[3]))
            return linesMatch && diagonalsMatch && knightsMatch
        } else if (selectedConnectionType == LINE_CONNECTIONS) {
            return  currCellInfo.c == userInput
        } else if (selectedConnectionType == DIAG_CONNECTIONS) {
            const parts = userInput.split(" ")
            return compareArrays(currCellInfo.d, [unifyDiag(parts[0]), unifyDiag(parts[1])])
        } else if (selectedConnectionType == KNIGHT_CONNECTIONS) {
            return compareArrays(currCellInfo.n, splitKnightCells(userInput))
        }
    }

    function splitKnightCells(knightCells) {
        return knightCells ? knightCells.split(/(?<=\d)(?=\w)/) : []
    }

    function unifyDiag(diag) {
        if (diag == "\\8") {
            return "8\\"
        } else if (diag == "/8") {
            return "8/"
        } else {
            return diag
        }
    }

    function compareArrays(expected, actual) {
        if (expected.length != actual.length) {
            return false
        }
        for (let i = 0; i < actual.length; i++) {
            if (!expected.includes(actual[i])) {
                return false
            }
        }
        return true
    }

    function renderConnectionTypeSelector() {
        return RE.FormControl({component:"fieldset"},
            RE.FormLabel({component:"legend"},"Connection type"),
            RE.RadioGroup({
                    value: selectedConnectionType,
                    onChange: event => {
                        setSelectedConnectionType(event.target.value)
                        setRndElemSelector(getNewRndElemSelector())
                    }
                },
                RE.FormControlLabel({label: "All types", value: ALL_CONNECTIONS,
                    control: RE.Radio({})}),
                RE.FormControlLabel({label: "Lines", value: LINE_CONNECTIONS,
                    control: RE.Radio({})}),
                RE.FormControlLabel({label: "Diagonals", value: DIAG_CONNECTIONS,
                    control: RE.Radio({})}),
                RE.FormControlLabel({label: "Knight", value: KNIGHT_CONNECTIONS,
                    control: RE.Radio({})}),
            )
        )
    }

    return RE.Container.row.left.top({},{style:{marginRight:"20px"}},
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderQuestion(),
            RE.div({}, "Iteration: " + rndElemSelector.getIterationNumber()),
            RE.div({}, "Remaining elements: " + rndElemSelector.getRemainingElements()),
            // JSON.stringify(CONNECTIONS_INFO[rndElemSelector.getCurrentElem()]),
            renderTextField(),
            renderConnectionTypeSelector(),
        ),
    )
}

