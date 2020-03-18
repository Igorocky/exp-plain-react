'use strict';

const VisionExercise = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const [question, setQuestion] = useState(rndElemSelector.currentElem)
    const [userAnswerIsIncorrect, setUserAnswerIsIncorrect] = useState(false)
    const [isCoordsMode, setIsCoordsMode] = useState(true)

    useEffect(() => {
        document.addEventListener(KEYDOWN_LISTENER_NAME, onKeyDown)
        return () => document.removeEventListener(KEYDOWN_LISTENER_NAME, onKeyDown)
    }, [rndElemSelector])

    function onKeyDown(event) {
        if (event.keyCode == SPACE_KEY_CODE || event.keyCode == ENTER_KEY_CODE) {
            questionAreaClicked()
        }
    }

    function quadrantFilter(q) {
        return i => {
            const c = absNumToCell(i)
            if (q == 1) {
                return 0 <= c.x && c.x <= 3 && 0 <= c.y && c.y <= 3
            } else if (q == 2) {
                return 4 <= c.x && c.x <= 7 && 0 <= c.y && c.y <= 3
            } else if (q == 3) {
                return 0 <= c.x && c.x <= 3 && 4 <= c.y && c.y <= 7
            } else if (q == 4) {
                return 4 <= c.x && c.x <= 7 && 4 <= c.y && c.y <= 7
            }
        }
    }

    function getNewRndElemSelector() {
        return randomElemSelector({
            allElems: ints(0,63)
                // .filter(quadrantFilter(1))
                // .filter(isWhiteCellI)
        })
    }

    function cellNumToCellName(cellNum) {
        return getCellName(absNumToCell(cellNum))
    }

    const onCellClicked = (cell,event) => {
        const userSelectsBlack = event.nativeEvent.shiftKey
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

    const cellSize = profVal(PROFILE_MOBILE, 43, PROFILE_FUJ, 75)

    function renderChessboard() {
        return re(SvgChessBoard,{
            cellSize: cellSize,
            onCellLeftClicked: onCellClicked,
            cellNameToShow: cellNumToCellName(rndElemSelector.currentElem),
            colorOfCellNameToShow: userAnswerIsIncorrect?"red":"green",
            drawCells: false
        })
    }

    return RE.Container.row.left.top({},{style:{marginRight:"20px"}},
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderChessboard({onCellClicked:onCellClicked}),
            RE.div({}, "Iteration: " + rndElemSelector.iterationNumber),
            RE.div({}, "Remaining elements: " + rndElemSelector.remainingElems.length),
        )
    )
}

