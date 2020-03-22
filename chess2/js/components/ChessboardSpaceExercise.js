'use strict';

const CHESSBOARD_SPACE_EXERCISE_STAGE_ASK = "CHESSBOARD_SPACE_EXERCISE_STAGE_ASK"
const CHESSBOARD_SPACE_EXERCISE_STAGE_ANSWER = "CHESSBOARD_SPACE_EXERCISE_STAGE_ANSWER"
const CHESSBOARD_SPACE_EXERCISE_STAGE_REPEAT_ASK = "CHESSBOARD_SPACE_EXERCISE_STAGE_REPEAT_ASK"
const CHESSBOARD_SPACE_EXERCISE_STAGE_REPEAT_ANSWER = "CHESSBOARD_SPACE_EXERCISE_STAGE_REPEAT_ANSWER"

const CHESSBOARD_SPACE_EXERCISE_UP = String.fromCharCode(9653)
const CHESSBOARD_SPACE_EXERCISE_DOWN = String.fromCharCode(9663)
const CHESSBOARD_SPACE_EXERCISE_LEFT = String.fromCharCode(9667)
const CHESSBOARD_SPACE_EXERCISE_RIGHT = String.fromCharCode(9657)
const CHESSBOARD_SPACE_EXERCISE_N3 = String.fromCharCode(8867)
const CHESSBOARD_SPACE_EXERCISE_N9 = String.fromCharCode(8866)
const CHESSBOARD_SPACE_EXERCISE_N12 = String.fromCharCode(8868)
const CHESSBOARD_SPACE_EXERCISE_N6 = String.fromCharCode(8869)

const ChessboardSpaceExercise = ({configName}) => {
    const STAGE = "STAGE"
    const RND_ELEM_SELECTOR = "RND_ELEM_SELECTOR"
    const USER_ANSWER_IS_CORRECT = "USER_ANSWER_IS_CORRECT"
    const RECENT_CELLS = "RECENT_CELLS"
    const numOfCellsToRemember = 0
    const cellSize = profVal(PROFILE_MOBILE, 43, PROFILE_FUJ, 75, PROFILE_FUJ_FULL, 95)

    const [state, setState] = useState(() => createState())

    function createState() {
        return {
            [STAGE]: CHESSBOARD_SPACE_EXERCISE_STAGE_ASK,
            [RND_ELEM_SELECTOR]: randomElemSelector({allElems: ints(0,63)}),
            [USER_ANSWER_IS_CORRECT]: true,
            [RECENT_CELLS]: [],
        }
    }

    function onCellClicked(state,cell,nativeEvent) {
        const stage = state[STAGE]
        if (stage == CHESSBOARD_SPACE_EXERCISE_STAGE_ASK || stage == CHESSBOARD_SPACE_EXERCISE_STAGE_ANSWER) {
            return onCellClickedNormalMode(state, cell, nativeEvent)
        } else {
            return onCellClickedRepeatMode(state, cell, nativeEvent)
        }
    }

    function isUserInputCorrect(correctCell, cell, nativeEvent) {
        const userSelectsBlack = nativeEvent.button==1
        const userColorIsCorrect = userSelectsBlack?isBlackCell(correctCell):isWhiteCell(correctCell)
        return equalCells(correctCell, cell) && userColorIsCorrect
    }

    function onCellClickedNormalMode(state, cell, nativeEvent) {
        const stage = state[STAGE]
        if (stage == CHESSBOARD_SPACE_EXERCISE_STAGE_ASK) {
            const correctCell = absNumToCell(state[RND_ELEM_SELECTOR].currentElem);
            const userAnswerIsCorrect = isUserInputCorrect(correctCell, cell, nativeEvent)
            state = set(state, USER_ANSWER_IS_CORRECT, userAnswerIsCorrect)
            if (userAnswerIsCorrect) {
                if (numOfCellsToRemember > 0) {
                    state = set(state, RECENT_CELLS, [...(state[RECENT_CELLS]), {from:correctCell}])
                }
                state = set(state, STAGE, CHESSBOARD_SPACE_EXERCISE_STAGE_ANSWER)
            }
        } else if (stage == CHESSBOARD_SPACE_EXERCISE_STAGE_ANSWER) {
            if (numOfCellsToRemember > 0 && state[RECENT_CELLS].length >= numOfCellsToRemember) {
                state = set(state, STAGE, CHESSBOARD_SPACE_EXERCISE_STAGE_REPEAT_ASK)
            } else {
                state = nextQuestion(state)
            }
        }
        return state
    }

    function nextQuestion(state) {
        state = set(state, RND_ELEM_SELECTOR, state[RND_ELEM_SELECTOR].next())
        state = set(state, STAGE, CHESSBOARD_SPACE_EXERCISE_STAGE_ASK)
        return state
    }

    function getTextToShowOnChessboard(currCell) {
        const stage = state[STAGE]
        if (stage == CHESSBOARD_SPACE_EXERCISE_STAGE_ASK || stage == CHESSBOARD_SPACE_EXERCISE_STAGE_ANSWER) {
            return getCellName(currCell)
        } else {
            // if (recentCells.length > 0) {
            //     return (numOfCellsToRemember-recentCells.length+1) + recentCells[0].hDir
            // } else {
            //     return recentCells.length
            // }
        }
    }

    function renderQuestion() {
        const questionFontSize = 100
        const questionFontSizePx = questionFontSize + "px"
        const questionDivSizePx = questionFontSize*1.5 + "px"
        const currCell = absNumToCell(state[RND_ELEM_SELECTOR].currentElem);
        return RE.Container.row.center.center({
                style:{
                    color: state[USER_ANSWER_IS_CORRECT]?"black":"red",
                    border: state[USER_ANSWER_IS_CORRECT]?null:"solid 3px red",
                    fontSize:questionFontSizePx,
                    width: questionDivSizePx,
                    height: questionDivSizePx,
                },
            }, {},
            getTextToShowOnChessboard(currCell)
        )
    }

    function getWhiteBlackCells() {
        const stage = state[STAGE]
        const recentCells = state[RECENT_CELLS]
        if (stage == CHESSBOARD_SPACE_EXERCISE_STAGE_ANSWER) {
            const currCell = absNumToCell(state[RND_ELEM_SELECTOR].currentElem)
            return {
                whiteCells:isWhiteCell(currCell)?[currCell]:null,
                blackCells:isBlackCell(currCell)?[currCell]:null,
            }
        } else if (stage == CHESSBOARD_SPACE_EXERCISE_STAGE_REPEAT_ANSWER && recentCells.length > 0) {
            const currCell = recentCells[0].to
            return {
                whiteCells:isWhiteCell(currCell)?[currCell]:null,
                blackCells:isBlackCell(currCell)?[currCell]:null,
            }
        } else {
            return {}
        }
    }

    function renderChessboard() {
        return re(SvgChessBoard,{
            cellSize: cellSize,
            onCellLeftClicked: (cell,nativeEvent) => setState(old => onCellClicked(old,cell,nativeEvent)),
            colorOfCellNameToShow: state[USER_ANSWER_IS_CORRECT]?"green":"blue",
            drawCells: false,
            ...getWhiteBlackCells(),
        })
    }

    return RE.Container.row.left.top({},{style:{marginRight:"20px"}},
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderChessboard(),
            RE.div({}, "Iteration: " + state[RND_ELEM_SELECTOR].iterationNumber),
            RE.div({}, "Remaining elements: " + state[RND_ELEM_SELECTOR].remainingElems.length),
            // RE.div({},
            //     "Counts: min=" + arrMin(conCounts)
            //     + ", max=" + arrMax(conCounts)
            //     + ", sum=" + arrSum(conCounts)),
        ),
        RE.Container.col.top.left({},{},
            RE.Button({/*onClick: resetRecentCells*/}, "Reset recent cells"),
            renderQuestion()
        )
    )

}

