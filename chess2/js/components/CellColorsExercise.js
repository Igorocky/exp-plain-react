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

    function renderAnswerButton(isBlack) {
        return RE.Button({
            onClick:() => onCellClicked({nativeEvent:{button:isBlack?1:0}}),
            style:{
                height:"100px",
                width:"100px",
                hidden: true,
                ...(isBlack
                    ?{backgroundColor:"black", color: "white"}
                    :{border: "1px solid black"}
                ),
            },
        }, "")
    }

    return RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
        renderQuestion(),
        RE.span({},
            "Iteration: " + rndElemSelector.iterationNumber
            + ", Remaining elements: " + rndElemSelector.remainingElems.length
        ),
        RE.Container.col.top.left({style:{paddingLeft:"200px"}},{style:{margin:"10px"}},
            renderAnswerButton(false),
            renderAnswerButton(true),
        )
    )
}

