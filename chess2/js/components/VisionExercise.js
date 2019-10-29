'use strict';

const VisionExercise = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(getNewRndElemSelector())
    const [question, setQuestion] = useState(rndElemSelector.getCurrentElem())
    const [userAnswerIsIncorrect, setUserAnswerIsIncorrect] = useState(false)
    const {renderChessboard} = useChessboard({cellSize:72, configName:configName})

    function getNewRndElemSelector() {
        return new RandomElemSelector({
            elems: ints(0,63)
        })
    }

    function cellNumToCellName(cellNum) {
        return getCellName(absNumToCell(cellNum))
    }

    const onCellClicked = cell => {
        const userAnswerIsCorrect = getCellName(cell) == cellNumToCellName(question)
        setUserAnswerIsIncorrect(!userAnswerIsCorrect)
        if (userAnswerIsCorrect) {
            rndElemSelector.loadNextElem()
            setQuestion(rndElemSelector.getCurrentElem())
        }
    }

    return RE.Container.row.left.center({},{style:{marginRight:"20px"}},
        renderChessboard({onCellClicked:onCellClicked}),
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            RE.div({style:{color: userAnswerIsIncorrect?"red":"black", fontSize:"100px"}},
                cellNumToCellName(rndElemSelector.getCurrentElem())
            ),
            RE.div({}, "Iteration: " + rndElemSelector.getIterationNumber()),
            RE.div({}, "Remaining elements: " + rndElemSelector.getRemainingElements()),
        ),
    )
}

