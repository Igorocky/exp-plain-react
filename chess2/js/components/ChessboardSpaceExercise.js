'use strict';

const ChessboardSpaceExercise = ({configName}) => {
    const STAGE_ASK = "STAGE_ASK"
    const STAGE_ANSWER = "STAGE_ANSWER"
    const STAGE_REPEAT_ASK = "STAGE_REPEAT_ASK"
    const STAGE_REPEAT_ANSWER = "STAGE_REPEAT_ANSWER"

    const UP = String.fromCharCode(9653)
    const DOWN = String.fromCharCode(9663)
    const LEFT = String.fromCharCode(9667)
    const RIGHT = String.fromCharCode(9657)
    const N3 = String.fromCharCode(8867)
    const N9 = String.fromCharCode(8866)
    const N12 = String.fromCharCode(8868)
    const N6 = String.fromCharCode(8869)

    const STAGE = "STAGE"
    const RND_ELEM_SELECTOR = "RND_ELEM_SELECTOR"
    const USER_ANSWER_IS_CORRECT = "USER_ANSWER_IS_CORRECT"
    const RECENT_CELLS = "RECENT_CELLS"
    const CONNECTIONS = "CONNECTIONS"
    const COUNTS = "COUNTS"
    const numOfCellsToRemember = 1
    const cellSize = profVal(PROFILE_MOBILE, 43, PROFILE_FUJ, 75, PROFILE_FUJ_FULL, 95)

    const [state, setState] = useState(() => createState())

    function createState() {
        const allConnections = createAllConnections();
        return {
            [STAGE]: STAGE_ASK,
            [RND_ELEM_SELECTOR]: randomElemSelector({allElems: ints(0,63)}),
            [USER_ANSWER_IS_CORRECT]: true,
            [RECENT_CELLS]: [],
            [CONNECTIONS]: allConnections,
            [COUNTS]: ints(0, allConnections.length-1).map(i => 0)
        }
    }

    function createAllConnections() {
        return [
            ...createKnightConnections()
        ].map((con, idx) => ({...con, idx:idx}))

    }

    function createKnightConnections() {
        return ints(0,63).map(absNumToCell)
            .flatMap(from =>
                knightMovesFrom(from).map(to => ({from:from, to:to, relSym:calcSymbolForKnightMove(from,to)}))
            )
    }

    function calcSymbolForKnightMove(from, to) {
        if (from.x+1 < to.x) {//right
            return from.y < to.y ? N3+UP : N3+DOWN
        } else if (to.x+1 < from.x) {//left
            return from.y < to.y ? UP+N9 : DOWN+N9
        } if (from.y+1 < to.y) {//top
            return from.x < to.x ? N12+RIGHT : LEFT+N12
        } else if (to.y+1 < from.y) {//bottom
            return from.x < to.x ? N6+RIGHT : LEFT+N6
        }
    }

    function onCellClicked(state,cell,nativeEvent) {
        const stage = state[STAGE]
        if (stage == STAGE_ASK || stage == STAGE_ANSWER) {
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

    function selectRandomConnection({from, cons, counts}) {
        const possibleCons = cons.filter(con => equalCells(con.from, from))
        const minCnt = arrMin(possibleCons.map(con => counts[con.idx]))
        const consWithMinCnt = possibleCons.filter(con => counts[con.idx] == minCnt)
        return consWithMinCnt[randomInt(0, consWithMinCnt.length-1)]
    }

    function selectSequenceOfConnections({length, from, cons, counts}) {
        const result = []
        while (result.length < length) {
            const con = selectRandomConnection({from:from, cons:cons, counts:counts});
            result.push(con)
            from = con.to
            counts = inc(counts, con.idx)
        }
        return result
    }

    function putCellToRecentCells(state, cell) {
        return set(state, RECENT_CELLS, [...(state[RECENT_CELLS]),
                {
                    seq:selectSequenceOfConnections({
                        length: 2,
                        from: cell,
                        cons: state[CONNECTIONS],
                        counts: state[COUNTS]
                    })
                }
        ])
    }

    function onCellClickedNormalMode(state, cell, nativeEvent) {
        const stage = state[STAGE]
        if (stage == STAGE_ASK) {
            const correctCell = absNumToCell(state[RND_ELEM_SELECTOR].currentElem)
            const userAnswerIsCorrect = isUserInputCorrect(correctCell, cell, nativeEvent)
            state = set(state, USER_ANSWER_IS_CORRECT, userAnswerIsCorrect)
            if (userAnswerIsCorrect) {
                if (numOfCellsToRemember > 0) {
                    state = putCellToRecentCells(state, correctCell)
                }
                state = set(state, STAGE, STAGE_ANSWER)
            }
        } else if (stage == STAGE_ANSWER) {
            if (numOfCellsToRemember > 0 && state[RECENT_CELLS].length >= numOfCellsToRemember) {
                state = set(state, STAGE, STAGE_REPEAT_ASK)
            } else {
                state = nextQuestion(state)
            }
        }
        return state
    }

    function getCorrectAnswerForRecentCells(recentCells) {
        const curPath = recentCells[recentCells.length-1].seq
        return curPath[curPath.length-1].to
    }

    function onCellClickedRepeatMode(state, cell, nativeEvent) {
        const stage = state[STAGE]
        const recentCells = state[RECENT_CELLS];
        if (stage == STAGE_REPEAT_ASK) {
            const correctCell = getCorrectAnswerForRecentCells(recentCells)
            const userAnswerIsCorrect = isUserInputCorrect(correctCell, cell, nativeEvent)
            state = set(state, USER_ANSWER_IS_CORRECT, userAnswerIsCorrect)
            if (userAnswerIsCorrect) {
                state = set(state, STAGE, STAGE_REPEAT_ANSWER)
            }
        } else if (stage == STAGE_REPEAT_ANSWER) {
            if (recentCells.length > 1) {
                state = set(state, RECENT_CELLS, recentCells.slice(1,recentCells.length))
                state = set(state, STAGE, STAGE_REPEAT_ASK)
            } else {
                state = resetRecentCells(state)
            }
        }
        return state
    }

    function resetRecentCells(state) {
        state = nextQuestion(state)
        state = set(state, RECENT_CELLS, [])
        return state
    }

    function nextQuestion(state) {
        state = set(state, RND_ELEM_SELECTOR, state[RND_ELEM_SELECTOR].next())
        state = set(state, STAGE, STAGE_ASK)
        return state
    }

    function renderQuestion() {
        const questionFontSize = 100
        const questionFontSizePx = questionFontSize + "px"
        const questionDivSizePx = questionFontSize*1.5 + "px"
        const currCell = absNumToCell(state[RND_ELEM_SELECTOR].currentElem);
        const stage = state[STAGE]
        const userAnswerIsCorrect = state[USER_ANSWER_IS_CORRECT];
        const questionStyle = {
            color: userAnswerIsCorrect?"black":"red",
            border: userAnswerIsCorrect?null:"solid 3px red",
            fontSize:questionFontSizePx,
            width: questionDivSizePx,
            height: questionDivSizePx,
        }
        if (stage == STAGE_ASK || stage == STAGE_ANSWER) {
            return RE.Container.row.center.center({style:questionStyle,}, {},
                getCellName(currCell)
            )
        } else if (stage == STAGE_REPEAT_ASK || stage == STAGE_REPEAT_ANSWER) {
            const recentCells = state[RECENT_CELLS]
            const currPath = recentCells[0].seq
            return RE.Container.col.top.left({}, {},
                RE.span({style: questionStyle},numOfCellsToRemember - recentCells.length + 1),
                currPath.map(con => RE.span({style:{fontSize:questionFontSize*0.5+"px",}}, con.relSym))
            )
        }
    }

    function getWhiteBlackCells() {
        const stage = state[STAGE]
        const recentCells = state[RECENT_CELLS]
        if (stage == STAGE_ANSWER) {
            const currCell = absNumToCell(state[RND_ELEM_SELECTOR].currentElem)
            return {
                whiteCells:isWhiteCell(currCell)?[currCell]:null,
                blackCells:isBlackCell(currCell)?[currCell]:null,
            }
        } else if (stage == STAGE_REPEAT_ANSWER && recentCells.length > 0) {
            const currCell = getCorrectAnswerForRecentCells(recentCells)
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
            RE.Button({onClick: () => setState(resetRecentCells)}, "Reset recent cells"),
            renderQuestion()
        )
    )

}

