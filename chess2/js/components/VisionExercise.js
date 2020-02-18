'use strict';

const VisionExercise = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const [question, setQuestion] = useState(rndElemSelector.currentElem)
    const [userAnswerIsIncorrect, setUserAnswerIsIncorrect] = useState(false)
    const [chessboardIsShown, setChessboardIsShown] = useState(false)
    const [isCoordsMode, setIsCoordsMode] = useState(true)

    useEffect(() => {
        document.addEventListener(KEYDOWN_LISTENER_NAME, onKeyDown)
        return () => document.removeEventListener(KEYDOWN_LISTENER_NAME, onKeyDown)
    }, [rndElemSelector])

    function onKeyDown(event) {
        if (event.keyCode == SPACE_KEY_CODE) {
            questionAreaClicked()
        }
    }

    function getNewRndElemSelector() {
        return randomElemSelector({
            allElems: ints(0,63)
                // .map(i => [i,absNumToCell(i)])
                // .filter(([i,c]) => 0<=c.x && c.x<=3 && 0<=c.y && c.y<=3)
                // .map(([i,c]) => i)
        })
    }

    function cellNumToCellName(cellNum) {
        return getCellName(absNumToCell(cellNum))
    }

    const onCellClicked = cell => {
        const userAnswerIsCorrect = getCellName(cell) == cellNumToCellName(question)
        setUserAnswerIsIncorrect(!userAnswerIsCorrect)
        if (userAnswerIsCorrect) {
            setRndElemSelector(oldRndElemSelector => {
                const newRndElemSelector = oldRndElemSelector.next();
                setQuestion(newRndElemSelector.currentElem)
                setChessboardIsShown(false)
                return newRndElemSelector
            })
        }
    }

    function renderModeSelector() {
        return RE.FormControl({component:"fieldset"},
            RE.FormLabel({component:"legend"},"Mode"),
            RE.RadioGroup({
                    row: true,
                    value: isCoordsMode+"",
                    onChange: event => setIsCoordsMode(event.target.value == "true")
                },
                RE.FormControlLabel({label: "Coords", value: "true", control: RE.Radio({})}),
                RE.FormControlLabel({label: "Img", value: "false", control: RE.Radio({})}),
            )
        )
    }

    function questionAreaClicked() {
        setChessboardIsShown(true)
    }

    function renderQuestion() {
        const questionFontSize = 100
        const questionFontSizePx = questionFontSize + "px"
        const questionDivSizePx = questionFontSize*1.5 + "px"
        const cellName = cellNumToCellName(rndElemSelector.currentElem);
        if (isCoordsMode) {
            return RE.Container.row.center.center({
                    style:{
                        color: userAnswerIsIncorrect?"red":"black",
                        border: userAnswerIsIncorrect?"solid 3px red":null,
                        fontSize:questionFontSizePx,
                        cursor:"pointer",
                        width: questionDivSizePx,
                        height: questionDivSizePx,
                    },
                    className: "lightgrey-background-on-hover",
                    onClick: questionAreaClicked
                }, {},
                cellName
            )
        } else {
            const size = "120px"
            return RE.div({
                style: {width: size, height: size, border: userAnswerIsIncorrect?"solid 3px red":null},
                onClick: () => onClick(coords)
            }, RE.img( {
                    src:"chess-board-configs/" + configName + "/" + cellName + ".png",
                    className: "cell-img"
                })
            )
        }
    }

    function renderChessboard() {
        return re(SvgChessBoard,{
            onCellLeftClicked: onCellClicked
        })
    }

    return RE.Container.row.left.top({},{style:{marginRight:"20px"}},
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            // renderModeSelector(),
            renderQuestion(),
            RE.div({}, "Iteration: " + rndElemSelector.iterationNumber),
            RE.div({}, "Remaining elements: " + rndElemSelector.remainingElems.length),
        ),
        chessboardIsShown?renderChessboard({onCellClicked:onCellClicked}):null,
    )
}

