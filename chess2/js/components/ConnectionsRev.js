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

const ConnectionsRev = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const [commandStr, setCommandStr] = useState(null)
    const [userInputIsCorrect, setUserInputIsCorrect] = useState(true)

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
        const parts = userInput.split(" ")
        const currCellInfo = CONNECTIONS_INFO[rndElemSelector.getCurrentElem()]
        return currCellInfo.c == parts[0]
            && compareArrays(currCellInfo.d, [parts[1], parts[2]])
            && compareArrays(currCellInfo.n, parts[3].split(/(?<=\d)(?=\w)/))
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

    return RE.Container.row.left.top({},{style:{marginRight:"20px"}},
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderQuestion(),
            RE.div({}, "Iteration: " + rndElemSelector.getIterationNumber()),
            RE.div({}, "Remaining elements: " + rndElemSelector.getRemainingElements()),
            // JSON.stringify(CONNECTIONS_INFO[rndElemSelector.getCurrentElem()]),
            renderTextField()
        ),
    )
}

