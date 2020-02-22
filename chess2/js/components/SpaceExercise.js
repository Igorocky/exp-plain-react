'use strict';

const SpaceExercise = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const {renderChessboard, showImageOnCell, hideImageOnAllCells, checkCell, uncheckAllCells} =
        useChessboard({cellSize:72, configName:configName})
    const [chessboardIsShown, setChessboardIsShown] = useState(false)

    const questionDivSize = 150
    const questionDivSizePx = questionDivSize+"px"
    const questionFontSize = questionDivSize*120/150
    const questionFontSizePx = questionFontSize+"px"
    const divStyle = {width: questionDivSizePx, height: questionDivSizePx, fontSize: questionFontSizePx}

    function getNewRndElemSelector() {
        return randomElemSelector({
            allElems: ints(0,63)
        })
    }

    function renderQuestion() {
        const currentCellAbsNumber = rndElemSelector.currentElem;
        return RE.div({style: {...divStyle,}},
            RE.Container.row.center.top({},{},
                cellNumToCellName(currentCellAbsNumber)
            )
        )
    }

    function nextQuestion() {
        setRndElemSelector(old => old.next())
        setChessboardIsShown(false)
        hideImageOnAllCells()
        uncheckAllCells()
    }

    function showChessBoard() {
        setChessboardIsShown(true)
        const curCell = absNumToCell(rndElemSelector.currentElem)
        getCellsOfSameShape(curCell).forEach(c => showImageOnCell(c))
        checkCell(curCell)
    }

    return RE.Container.row.left.top({},{style:{marginRight:"20px"}},
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderQuestion(),
            RE.div({}, "Iteration: " + rndElemSelector.iterationNumber),
            RE.div({}, "Remaining elements: " + rndElemSelector.remainingElems.length),
            RE.Button({onClick: () => chessboardIsShown?nextQuestion():showChessBoard()}, "Next"),
        ),
        chessboardIsShown?renderChessboard({}):null,
    )
}

