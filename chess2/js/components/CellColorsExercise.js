'use strict';

const CellColorsExercise = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const [question, setQuestion] = useState(rndElemSelector.currentElem)
    const [userAnswerIsIncorrect, setUserAnswerIsIncorrect] = useState(false)

    function getNewRndElemSelector() {
        return randomElemSelector({allElems: ints(0,63)})
    }

    function cellNumToCellName(cellNum) {
        return getCellName(absNumToCell(cellNum))
    }

    const onCellClicked = (event) => {
        const userSelectsBlack = event.nativeEvent.button==1
        const cell = absNumToCell(question);
        const userColorIsCorrect = userSelectsBlack?isBlackCell(cell):isWhiteCell(cell)
        const userAnswerIsCorrect = (getCellName(cell) == cellNumToCellName(question)) && userColorIsCorrect
        setUserAnswerIsIncorrect(!userAnswerIsCorrect)
        if (userAnswerIsCorrect) {
            setRndElemSelector(oldRndElemSelector => {
                const newRndElemSelector = oldRndElemSelector.next();
                setQuestion(newRndElemSelector.currentElem)
                return newRndElemSelector
            })
        }
    }

    function renderQuestion() {
        const questionFontSize = 100
        const questionDivSizePx = questionFontSize*1.5 + "px"
        const cellName = cellNumToCellName(rndElemSelector.currentElem);
        return RE.Container.row.center.center({
                style:{
                    color: userAnswerIsIncorrect?"red":"black",
                    border: userAnswerIsIncorrect?"solid 3px red":null,
                    fontSize:questionFontSize + "px",
                    // cursor:"pointer",
                    width: questionDivSizePx,
                    height: questionDivSizePx,
                },
                className: "lightgrey-background-on-hover",
                onMouseDown: onCellClicked
            }, {},
            cellName
        )
    }

    return RE.Container.row.left.top({},{style:{marginRight:"20px"}},
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderQuestion(),
            RE.div({}, "Iteration: " + rndElemSelector.iterationNumber),
            RE.div({}, "Remaining elements: " + rndElemSelector.remainingElems.length),
        )
    )
}

