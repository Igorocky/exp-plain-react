'use strict';

const VISION_EXERCISE_STAGE_ASK = "VISION_EXERCISE_STAGE_ASK"
const VISION_EXERCISE_STAGE_ANSWER = "VISION_EXERCISE_STAGE_ANSWER"
const VISION_EXERCISE_STAGE_REPEAT_ASK = "VISION_EXERCISE_STAGE_REPEAT_ASK"
const VISION_EXERCISE_STAGE_REPEAT_ANSWER = "VISION_EXERCISE_STAGE_REPEAT_ANSWER"

const VISION_EXERCISE_UP = String.fromCharCode(9653)
const VISION_EXERCISE_DOWN = String.fromCharCode(9663)
const VISION_EXERCISE_LEFT = String.fromCharCode(9667)
const VISION_EXERCISE_RIGHT = String.fromCharCode(9657)
const VISION_EXERCISE_N3 = String.fromCharCode(8867)
const VISION_EXERCISE_N9 = String.fromCharCode(8866)
const VISION_EXERCISE_N12 = String.fromCharCode(8868)
const VISION_EXERCISE_N6 = String.fromCharCode(8869)

const VisionExercise = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const [question, setQuestion] = useState(rndElemSelector.currentElem)
    const [userAnswerIsIncorrect, setUserAnswerIsIncorrect] = useState(false)
    const [isCoordsMode, setIsCoordsMode] = useState(true)
    const [stage, setStage] = useState(VISION_EXERCISE_STAGE_ASK)
    const [recentCells, setRecentCells] = useState([])
    const [cons] = useState(() => getAllPossibleConnections())
    const [conCounts, setConCounts] = useState(() => ints(0,cons.length-1).map(i => 0))

    const numOfCellsToRemember = 4

    useEffect(() => {
        document.addEventListener(KEYDOWN_LISTENER_NAME, onKeyDown)
        return () => document.removeEventListener(KEYDOWN_LISTENER_NAME, onKeyDown)
    }, [rndElemSelector])

    function getAllPossibleConnections() {
        return ints(0,63).map(i => absNumToCell(i)).flatMap(from =>
            knightMovesFrom(from)
                .map(to => ({from:from, to:to}))
                .filter(con => isValidCell(con.to))
        )
    }

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

    function isUserInputCorrect(correctCell, cell, event) {
        const userSelectsBlack = event.nativeEvent.button==1
        const userColorIsCorrect = userSelectsBlack?isBlackCell(cell):isWhiteCell(cell)
        return equalCells(correctCell, cell) && userColorIsCorrect
    }

    function nextQuestion() {
        setRndElemSelector(oldRndElemSelector => {
            const newRndElemSelector = oldRndElemSelector.next();
            setQuestion(newRndElemSelector.currentElem)
            setStage(VISION_EXERCISE_STAGE_ASK)
            return newRndElemSelector
        })
    }

    function onCellClicked(cell,event) {
        if (stage == VISION_EXERCISE_STAGE_ASK || stage == VISION_EXERCISE_STAGE_ANSWER) {
            onCellClickedNormalMode(cell, event)
        } else {
            onCellClickedRepeatMode(cell, event)
        }
    }

    function absNumToCon(i) {
        return cons[i]
    }

    function idxOfCon(from,to) {
        return cons
            .map((con,idx) => ({con:con, idx:idx}))
            .filter(conIdx => equalCells(conIdx.con.from, from) && equalCells(conIdx.con.to, to))
            .map(conIdx => conIdx.idx)[0]
    }

    function calcHDir(from, to) {
        if (from.x+1 < to.x) {//right
            if (from.y < to.y) {
                return VISION_EXERCISE_N3+VISION_EXERCISE_UP
            } else {
                return VISION_EXERCISE_N3+VISION_EXERCISE_DOWN
            }
        } else if (to.x+1 < from.x) {//left
            if (from.y < to.y) {
                return VISION_EXERCISE_UP+VISION_EXERCISE_N9
            } else {
                return VISION_EXERCISE_DOWN+VISION_EXERCISE_N9
            }
        } if (from.y+1 < to.y) {//top
            if (from.x < to.x) {
                return VISION_EXERCISE_N12+VISION_EXERCISE_RIGHT
            } else {
                return VISION_EXERCISE_LEFT+VISION_EXERCISE_N12
            }
        } else if (to.y+1 < from.y) {//bottom
            if (from.x < to.x) {
                return VISION_EXERCISE_N6+VISION_EXERCISE_RIGHT
            } else {
                return VISION_EXERCISE_LEFT+VISION_EXERCISE_N6
            }
        }
    }

    function getRandomKnightMoveFrom(baseCell) {
        const possibleNightMoves = knightMovesFrom(baseCell)
        const possibleConnections = conCounts
            .map((c,i) => ({cnt:c,idx:i,...absNumToCon(i)}))
            .filter(conInfo => possibleNightMoves.find(to => equalCells(to, conInfo.to)))
        const minCnt = arrMin(
            possibleConnections.map(conInfo => conInfo.cnt)
        )
        const destCellsWithMinCnt = possibleConnections
            .filter(conInfo => conInfo.cnt == minCnt)
        return destCellsWithMinCnt[randomInt(0, destCellsWithMinCnt.length-1)]
    }

    function onCellClickedNormalMode(cell,event) {
        if (stage == VISION_EXERCISE_STAGE_ASK) {
            const correctCell = absNumToCell(question);
            const userAnswerIsCorrect = isUserInputCorrect(correctCell, cell, event)
            setUserAnswerIsIncorrect(!userAnswerIsCorrect)
            if (userAnswerIsCorrect) {
                const randomConnection = getRandomKnightMoveFrom(correctCell);
                randomConnection.hDir = calcHDir(correctCell, randomConnection.to)
                if (numOfCellsToRemember > 0) {
                    setRecentCells(old => [...old, randomConnection])
                }
                setStage(VISION_EXERCISE_STAGE_ANSWER)
            }
        } else if (stage == VISION_EXERCISE_STAGE_ANSWER) {
            if (numOfCellsToRemember > 0 && recentCells.length >= numOfCellsToRemember) {
                setStage(VISION_EXERCISE_STAGE_REPEAT_ASK)
            } else {
                nextQuestion()
            }
        }
    }

    function onCellClickedRepeatMode(cell,event) {
        if (stage == VISION_EXERCISE_STAGE_REPEAT_ASK) {
            const userAnswerIsCorrect = isUserInputCorrect(recentCells[0].to, cell, event)
            setUserAnswerIsIncorrect(!userAnswerIsCorrect)
            if (userAnswerIsCorrect) {
                setConCounts(inc(conCounts, idxOfCon(recentCells[0].from, recentCells[0].to)))
                setStage(VISION_EXERCISE_STAGE_REPEAT_ANSWER)
            }
        } else if (stage == VISION_EXERCISE_STAGE_REPEAT_ANSWER) {
            if (recentCells.length > 1) {
                setRecentCells(old => old.slice(1,old.length))
                setStage(VISION_EXERCISE_STAGE_REPEAT_ASK)
            } else {
                resetRecentCells()
            }
        }
    }

    function resetRecentCells() {
        nextQuestion()
        setRecentCells([])
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

    function renderQuestion() {
        const questionFontSize = 100
        const questionFontSizePx = questionFontSize + "px"
        const questionDivSizePx = questionFontSize*1.5 + "px"
        const currCell = absNumToCell(question);
        return RE.Container.row.center.center({
                style:{
                    color: userAnswerIsIncorrect?"red":"black",
                    border: userAnswerIsIncorrect?"solid 3px red":null,
                    fontSize:questionFontSizePx,
                    width: questionDivSizePx,
                    height: questionDivSizePx,
                },
            }, {},
            getTextToShowOnChessboard(currCell)
        )
    }

    const cellSize = profVal(PROFILE_MOBILE, 43, PROFILE_FUJ, 75, PROFILE_FUJ_FULL, 95)

    function getWhiteBlackCells() {
        if (stage == VISION_EXERCISE_STAGE_ANSWER) {
            const currCell = absNumToCell(rndElemSelector.currentElem)
            return {
                whiteCells:isWhiteCell(currCell)?[currCell]:null,
                blackCells:isBlackCell(currCell)?[currCell]:null,
            }
        } else if (stage == VISION_EXERCISE_STAGE_REPEAT_ANSWER && recentCells.length > 0) {
            const currCell = recentCells[0].to
            return {
                whiteCells:isWhiteCell(currCell)?[currCell]:null,
                blackCells:isBlackCell(currCell)?[currCell]:null,
            }
        } else {
            return {}
        }
    }

    function getTextToShowOnChessboard(currCell) {
        if (stage == VISION_EXERCISE_STAGE_ASK || stage == VISION_EXERCISE_STAGE_ANSWER) {
            return getCellName(currCell)
        } else {
            if (recentCells.length > 0) {
                return (numOfCellsToRemember-recentCells.length+1) + recentCells[0].hDir
            } else {
                return recentCells.length
            }
        }
    }

    function renderChessboard() {
        return re(SvgChessBoard,{
            cellSize: cellSize,
            onCellLeftClicked: onCellClicked,
            colorOfCellNameToShow: userAnswerIsIncorrect?"red":"green",
            drawCells: false,
            ...getWhiteBlackCells(),
        })
    }

    return RE.Container.row.left.top({},{style:{marginRight:"20px"}},
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderChessboard({onCellClicked:onCellClicked}),
            RE.div({}, "Iteration: " + rndElemSelector.iterationNumber),
            RE.div({}, "Remaining elements: " + rndElemSelector.remainingElems.length),
            RE.div({},
                "Counts: min=" + arrMin(conCounts)
                + ", max=" + arrMax(conCounts)
                + ", sum=" + arrSum(conCounts)),
        ),
        RE.Container.col.top.left({},{},
            RE.Button({onClick: resetRecentCells}, "Reset recent cells"),
            renderQuestion()
        )
    )
}

