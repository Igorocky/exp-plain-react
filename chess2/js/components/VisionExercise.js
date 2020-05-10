'use strict';

const VisionExercise = ({configName}) => {
    const LOC_STOR_NAME = "VisionExercise.settings"
    const STAGE_ASK = "STAGE_ASK"
    const STAGE_ANSWER = "STAGE_ANSWER"
    const STAGE_REPEAT_ASK = "STAGE_REPEAT_ASK"
    const STAGE_REPEAT_ANSWER = "STAGE_REPEAT_ANSWER"

    const TR_UP = String.fromCharCode(9653)
    const TR_DOWN = String.fromCharCode(9663)
    const TR_LEFT = String.fromCharCode(9667)
    const TR_RIGHT = String.fromCharCode(9657)
    const RIGHT = String.fromCharCode(8594);
    const RIGHT_UP = String.fromCharCode(8599);
    const RIGHT_DOWN = String.fromCharCode(8600);
    const UP = String.fromCharCode(8593);
    const DOWN = String.fromCharCode(8595);
    const LEFT = String.fromCharCode(8592);
    const LEFT_UP = String.fromCharCode(8598);
    const LEFT_DOWN = String.fromCharCode(8601);
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
    const NUM_OF_CELLS_TO_REMEMBER = "NUM_OF_CELLS_TO_REMEMBER"
    const PATH_LENGTH = "PATH_LENGTH"
    const CONNECTION_TYPES = "CONNECTION_TYPES"
    const CONNECTION_TYPE_SAME_CELL = "CONNECTION_TYPE_SAME_CELL"
    const CONNECTION_TYPE_KNIGHT = "CONNECTION_TYPE_KNIGHT"
    const CONNECTION_TYPE_LINE = "CONNECTION_TYPE_LINE"
    const LINE_LENGTH_MIN = "LINE_LENGTH_MIN"
    const LINE_LENGTH_MAX = "LINE_LENGTH_MAX"
    const X_COORD_MIN = "X_COORD_MIN"
    const X_COORD_MAX = "X_COORD_MAX"
    const Y_COORD_MIN = "Y_COORD_MIN"
    const Y_COORD_MAX = "Y_COORD_MAX"
    const CELL_COLOR_WHITE = "WHITE"
    const CELL_COLOR_BLACK = "BLACK"
    const CELL_COLOR_ALL = "ALL"
    const CELL_COLOR = "CELL_COLOR"
    const AUDIO_MODE = "AUDIO_MODE"
    const ALWAYS_SHOW_QUESTION_CELL_NAME = "ALWAYS_SHOW_QUESTION_CELL_NAME"
    const QUESTION_CELL_NAME_IS_SHOWN = "QUESTION_CELL_NAME_IS_SHOWN"
    const SETTINGS_TO_STORE_TO_LOCAL_STORAGE = [
        CONNECTION_TYPES, LINE_LENGTH_MIN, LINE_LENGTH_MAX, PATH_LENGTH, NUM_OF_CELLS_TO_REMEMBER,
        ALWAYS_SHOW_QUESTION_CELL_NAME,
        X_COORD_MIN, X_COORD_MAX, Y_COORD_MIN, Y_COORD_MAX, CELL_COLOR
    ]
    const cellSize = profVal(PROFILE_MOBILE, 43, PROFILE_FUJ, 75, PROFILE_FUJ_FULL, 95, PROFILE_FUJ_BENQ, 115)

    const [state, setState] = useState(() => createState({}))
    const [settings, setSettings] = useState(null)

    const {say, symbolDelay, dotDuration, dashDuration,
        openSpeechSettings, renderSettings:renderSpeechSettings, refreshStateFromSettings:refreshSpeechStateFromSettings,
        printState:printSpeechComponentState} = useSpeechComponent()

    const {init:initListReader, onSymbolsChanged:onSymbolsChangedInListReader} = useListReader()

    useEffect(() => updateStateFromSettings(
        readSettingsFromLocalStorage({localStorageKey: LOC_STOR_NAME, attrsToRead: SETTINGS_TO_STORE_TO_LOCAL_STORAGE})
    ), [])

    useEffect(() => {
        if (state[AUDIO_MODE]) {
            if (state[STAGE] != STAGE_REPEAT_ASK) {
                setState(goToQuestionStateForMobileMode)
            } else {
                reInitListReader()
            }
        }
    }, [state[AUDIO_MODE], state[STAGE], state[RND_ELEM_SELECTOR]])

    function createState({prevState, params}) {
        function firstDefinedInner(attrName, defVal) {
            return firstDefined(attrName, params, prevState, defVal)
        }

        const connectionTypes = firstDefinedInner(CONNECTION_TYPES, [
            CONNECTION_TYPE_SAME_CELL,
            CONNECTION_TYPE_KNIGHT,
            CONNECTION_TYPE_LINE,
        ])
        const lineLengthMin = firstDefinedInner(LINE_LENGTH_MIN,2)
        const lineLengthMax = firstDefinedInner(LINE_LENGTH_MAX, 4)
        let pathLength = firstDefinedInner(PATH_LENGTH, 6)
        if (connectionTypes.length == 1 && connectionTypes.includes(CONNECTION_TYPE_SAME_CELL)) {
            pathLength = 1
        }
        const xCoordMin = firstDefinedInner(X_COORD_MIN, 0)
        const xCoordMax = firstDefinedInner(X_COORD_MAX, 7)
        const yCoordMin = firstDefinedInner(Y_COORD_MIN, 0)
        const yCoordMax = firstDefinedInner(Y_COORD_MAX, 7)
        const cellColor = firstDefinedInner(CELL_COLOR, CELL_COLOR_ALL)

        const xCoordFilter = x => xCoordMin <= x && x <= xCoordMax
        const yCoordFilter = y => yCoordMin <= y && y <= yCoordMax
        const cellColorFilter = cell =>
            cellColor == CELL_COLOR_WHITE && isWhiteCell(cell)
            || cellColor == CELL_COLOR_BLACK && isBlackCell(cell)
            || cellColor == CELL_COLOR_ALL
        const cellFilter = cell => xCoordFilter(cell.x) && yCoordFilter(cell.y) && cellColorFilter(cell)

        const numOfCellsToRemember = firstDefinedInner(NUM_OF_CELLS_TO_REMEMBER, 1)
        const audioMode = firstDefinedInner(AUDIO_MODE, false)
        const alwaysShowQuestionCellName = firstDefinedInner(ALWAYS_SHOW_QUESTION_CELL_NAME, false)

        const allConnections = createAllConnections({
            connectionTypes:connectionTypes,
            lineLengthMin:lineLengthMin,
            lineLengthMax:lineLengthMax,
        })
            .filter(con => cellFilter(con.from) && cellFilter(con.to))
            .map((con, idx) => ({...con, idx:idx}))
        return {
            [STAGE]: STAGE_ASK,
            [RND_ELEM_SELECTOR]: randomElemSelector({
                allElems: ints(0,63)
                    .map(i => ({idx:i,cell:absNumToCell(i)}))
                    .filter(({cell}) => cellFilter(cell))
                    .map(({idx}) => idx)
            }),
            [USER_ANSWER_IS_CORRECT]: true,
            [NUM_OF_CELLS_TO_REMEMBER]: numOfCellsToRemember,
            [PATH_LENGTH]: pathLength,
            [RECENT_CELLS]: [],
            [CONNECTION_TYPES]: connectionTypes,
            [LINE_LENGTH_MIN]: lineLengthMin,
            [LINE_LENGTH_MAX]: lineLengthMax,
            [CONNECTIONS]: allConnections,
            [COUNTS]: ints(0, allConnections.length-1).map(i => 0),
            [AUDIO_MODE]: audioMode,
            [QUESTION_CELL_NAME_IS_SHOWN]: false,
            [ALWAYS_SHOW_QUESTION_CELL_NAME]: alwaysShowQuestionCellName,
            [X_COORD_MIN]: xCoordMin,
            [X_COORD_MAX]: xCoordMax,
            [Y_COORD_MIN]: yCoordMin,
            [Y_COORD_MAX]: yCoordMax,
            [CELL_COLOR]: cellColor,
        }
    }

    function reInitListReader() {
        const startCell = absNumToCell(state[RND_ELEM_SELECTOR].currentElem)
        const recentCells = state[RECENT_CELLS];
        const currPath = recentCells[0].seq
        const targetCell = getCorrectAnswerForRecentCells(recentCells)
        initListReader({
            say,
            title: {
                say: () => say("Calculate target square."),
            },
            sayFirstElem: true,
            elems: [
                {
                    say: () => say("Start square is, " + cellToTextToSay(startCell)),
                },
                ...currPath.map(con => ({
                    say: () => say(con.relSymSay)
                })),
                {
                    say: () => say("Target is"),
                },
                {
                    say: () => say(cellToTextToSay(targetCell)),
                    onEnter: () => setState(old => goToQuestionStateForMobileMode(simulateClickOnCorrectCell(old)))
                }
            ]
        })
    }

    function simulateClickOnCorrectCell(state) {
        const stage = state[STAGE]
        if (stage == STAGE_ASK || stage == STAGE_ANSWER) {
            const correctCell = absNumToCell(state[RND_ELEM_SELECTOR].currentElem)
            const nativeEvent = {button:isBlackCell(correctCell)?1:0}
            return onCellClicked(state,correctCell,nativeEvent)
        } else {
            const recentCells = state[RECENT_CELLS]
            const correctCell = getCorrectAnswerForRecentCells(recentCells)
            const nativeEvent = {button:isBlackCell(correctCell)?1:0}
            return onCellClicked(state,correctCell,nativeEvent)
        }
    }

    function goToQuestionStateForMobileMode(state) {
        while (state[STAGE] != STAGE_REPEAT_ASK) {
            state = simulateClickOnCorrectCell(state)
        }
        return state
    }

    function cellToTextToSay({x,y}) {
        const xStr = XX[x].toUpperCase()
        return MORSE_ARR.find(({sym}) => sym == xStr).word + ", " + YY[y]
    }

    function createAllConnections({connectionTypes, lineLengthMin, lineLengthMax}) {
        return [
            ...(connectionTypes.includes(CONNECTION_TYPE_SAME_CELL)?createSameCellConnections():[]),
            ...(connectionTypes.includes(CONNECTION_TYPE_KNIGHT)?createKnightConnections():[]),
            ...(connectionTypes.includes(CONNECTION_TYPE_LINE)?createLineConnections(lineLengthMin, lineLengthMax):[]),
        ]
    }

    function createSameCellConnections() {
        return ints(0,63).map(absNumToCell)
            .map(from => ({from:from, to:from, relSym:"o"}))
    }

    function createKnightConnections() {
        return ints(0,63).map(absNumToCell)
            .flatMap(from =>
                knightMovesFrom(from).map(to => ({from:from, to:to, ...calcSymbolForKnightMove(from,to)}))
            )
    }

    function createLineConnections(lineLengthMin, lineLengthMax) {
        return ints(0,63).map(absNumToCell)
            .flatMap(from =>
                [11,12,1,9,3,7,6,5].flatMap(h => {
                    const ray = rayHFrom(from.x, from.y, h)
                    return ray
                        .map((to,idx) => ({from:from, to:to, len:idx+1, dir:hourToDir(h)}))
                        .filter(con => lineLengthMin <= con.len && con.len <= lineLengthMax)
                        .map(con => ({...con, ...calcSymbolForLineMove(con.from,con.to,con.len)}))
                })
            )
    }

    function calcSymbolForKnightMove(from, to) {
        if (from.x+1 < to.x) {//right
            if (from.y < to.y) {
                return {relSym: N3+UP, relSymSay: "two."}
            } else {
                return {relSym: N3+DOWN, relSymSay: "four."}
            }
        } else if (to.x+1 < from.x) {//left
            if (from.y < to.y) {
                return {relSym: N9+UP, relSymSay: "ten."}
            } else {
                return {relSym: N9+DOWN, relSymSay: "eight."}
            }
        } if (from.y+1 < to.y) {//top
            if (from.x < to.x) {
                return {relSym: N12+RIGHT, relSymSay: "one."}
            } else {
                return {relSym: N12+LEFT, relSymSay: "eleven."}
            }
        } else if (to.y+1 < from.y) {//bottom
            if (from.x < to.x) {
                return {relSym: N6+RIGHT, relSymSay: "five."}
            } else {
                return {relSym: N6+LEFT, relSymSay: "seven."}
            }
        }
    }

    function calcSymbolForLineMove(from, to, len) {
        if (from.x < to.x) {
            if (from.y < to.y) {
                return {relSym:RIGHT_UP+len, relSymSay: "two, " + len}
            } else if (from.y == to.y) {
                return {relSym:RIGHT+len, relSymSay: "three, " + len}
            } else {
                return {relSym:RIGHT_DOWN+len, relSymSay: "four, " + len}
            }
        } else if (from.x == to.x) {
            if (from.y < to.y) {
                return {relSym:UP+len, relSymSay: "twelve, " + len}
            } else {
                return {relSym:DOWN+len, relSymSay: "six, " + len}
            }
        } else {
            if (from.y < to.y) {
                return {relSym:LEFT_UP+len, relSymSay: "ten, " + len}
            } else if (from.y == to.y) {
                return {relSym:LEFT+len, relSymSay: "nine, " + len}
            } else {
                return {relSym:LEFT_DOWN+len, relSymSay: "eight, " + len}
            }
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
        const userSelectsBlack = nativeEvent.button==1 || nativeEvent.button==2
        const userColorIsCorrect = userSelectsBlack?isBlackCell(correctCell):isWhiteCell(correctCell)
        return equalCells(correctCell, cell) && userColorIsCorrect
    }

    function conCanBeChosen({prevCon, from, con}) {
        return equalCells(from, con.from)
            && (!prevCon || !prevCon.dir || !con.dir || !isOppositeDir(prevCon.dir, con.dir))
            && (!prevCon || !equalCells(prevCon.from, con.to))
    }

    function selectRandomConnection({prevCon, from, cons, counts}) {
        const possibleCons = cons
            .filter(con => conCanBeChosen({prevCon:prevCon, from:from, con:con}))
        if (possibleCons.length == 0) {
            throw "possibleCons.length == 0"
        }
        const minCnt = arrMin(possibleCons.map(con => counts[con.idx]))
        const consWithMinCnt = possibleCons.filter(con => counts[con.idx] == minCnt)
        return consWithMinCnt[randomInt(0, consWithMinCnt.length-1)]
    }

    function selectSequenceOfConnections({length, from, cons, counts}) {
        const result = []
        let prevCon
        while (result.length < length) {
            const con = selectRandomConnection({prevCon:prevCon, from:from, cons:cons, counts:counts});
            result.push(con)
            prevCon = con
            from = con.to
            counts = inc(counts, con.idx)
        }
        if (result.length == 0) {
            result.push({
                from:from,
                to:from,
                idx:-1
            })
        }
        return result
    }

    function putCellToRecentCells(state, cell) {
        return set(state, RECENT_CELLS, [...(state[RECENT_CELLS]),
                {
                    seq:selectSequenceOfConnections({
                        length: state[PATH_LENGTH],
                        from: cell,
                        cons: state[CONNECTIONS],
                        counts: state[COUNTS]
                    })
                }
        ])
    }

    function onCellClickedNormalMode(state, cell, nativeEvent) {
        const stage = state[STAGE]
        const numOfCellsToRemember = state[NUM_OF_CELLS_TO_REMEMBER]
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
        const curPath = recentCells[0].seq
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
            recentCells[0].seq.filter(con => !(con.idx===-1)).forEach(con => {
                state = set(state, COUNTS, inc(state[COUNTS], con.idx))
            })
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
        state = set(state, USER_ANSWER_IS_CORRECT, true)
        return state
    }

    function nextQuestion(state) {
        state = set(state, RND_ELEM_SELECTOR, state[RND_ELEM_SELECTOR].next())
        state = set(state, STAGE, STAGE_ASK)
        state = set(state, QUESTION_CELL_NAME_IS_SHOWN, false)
        return state
    }

    function showQuestionCellName() {
        return state[ALWAYS_SHOW_QUESTION_CELL_NAME] || state[AUDIO_MODE] || state[QUESTION_CELL_NAME_IS_SHOWN]
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
            const numOfCellsToRemember = state[NUM_OF_CELLS_TO_REMEMBER]
            const question = showQuestionCellName()
                ? getCellName(currPath[0].from)
                : numOfCellsToRemember - recentCells.length + 1
            return RE.Container.row.left.top({},{},
                RE.span({style: questionStyle},
                    RE.span({
                            onClick:() => setState(old => set(old, QUESTION_CELL_NAME_IS_SHOWN, true)),
                            style: {cursor:"pointer"}
                        },
                        question
                    )
                ),
                RE.Container.col.top.left({}, {},
                    currPath.map(con => RE.span({style:{fontSize:questionFontSize*0.5+"px",}}, con.relSym))
                )
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

    function updateStateFromSettings(settings) {
        function intOrUndef(value) {
            if (value !== "") {
                return value
            }
        }
        settings = {
            ...settings,
            [LINE_LENGTH_MIN]: intOrUndef(settings[LINE_LENGTH_MIN]),
            [LINE_LENGTH_MAX]: intOrUndef(settings[LINE_LENGTH_MAX]),
            [PATH_LENGTH]: intOrUndef(settings[PATH_LENGTH]),
            [NUM_OF_CELLS_TO_REMEMBER]: intOrUndef(settings[NUM_OF_CELLS_TO_REMEMBER]),
        }
        setState(old => createState({prevState:old, params:settings}))
    }

    function applySettings() {
        updateStateFromSettings(settings)
        saveSettingsToLocalStorage({
            settings:settings, attrsToSave: SETTINGS_TO_STORE_TO_LOCAL_STORAGE, localStorageKey: LOC_STOR_NAME
        })
        openCloseSettingsDialog(false)
    }

    function renderSettings() {
        return RE.Dialog({fullScreen:true, open:true},
            RE.AppBar({},
                RE.Toolbar({},
                    RE.Button({
                        edge:"start",
                        variant:"contained",
                        onClick: () => openCloseSettingsDialog(false),
                        style: {marginRight: "20px"}},
                        "Close"
                    ),
                    RE.Button({
                        variant:"contained",
                        onClick: applySettings,
                    },
                        "Save"
                    ),
                )
            ),
            RE.table({style:{marginTop:"80px"}, className: "settings-table"},
                RE.tbody({},
                    RE.tr({},
                        RE.td({},"Connection types"),
                        RE.td({},
                            renderConnectionTypeCheckbox(CONNECTION_TYPE_SAME_CELL, "Same cell"),
                            renderConnectionTypeCheckbox(CONNECTION_TYPE_LINE, "Line"),
                            renderConnectionTypeCheckbox(CONNECTION_TYPE_KNIGHT, "Knight"),
                        ),
                    ),
                    RE.tr({},
                        RE.td({},"Min line length"),
                        RE.td({},
                            renderIntPropTextField({propName: LINE_LENGTH_MIN, value:settings[LINE_LENGTH_MIN]}),
                        ),
                    ),
                    RE.tr({},
                        RE.td({},"Max line length"),
                        RE.td({},
                            renderIntPropTextField({propName: LINE_LENGTH_MAX, value:settings[LINE_LENGTH_MAX]}),
                        ),
                    ),
                    RE.tr({},
                        RE.td({},"Path length"),
                        RE.td({},
                            renderIntPropTextField({propName: PATH_LENGTH, value:settings[PATH_LENGTH]}),
                        ),
                    ),
                    RE.tr({},
                        RE.td({},"X range"),
                        RE.td({},
                            renderRangeSelector({
                                min: settings[X_COORD_MIN],
                                max: settings[X_COORD_MAX],
                                setMin: newVal => setSettings(old => set(old, X_COORD_MIN, newVal)),
                                setMax: newVal => setSettings(old => set(old, X_COORD_MAX, newVal)),
                            }),
                        ),
                    ),
                    RE.tr({},
                        RE.td({},"Y range"),
                        RE.td({},
                            renderRangeSelector({
                                min: settings[Y_COORD_MIN],
                                max: settings[Y_COORD_MAX],
                                setMin: newVal => setSettings(old => set(old, Y_COORD_MIN, newVal)),
                                setMax: newVal => setSettings(old => set(old, Y_COORD_MAX, newVal)),
                            }),
                        ),
                    ),
                    RE.tr({},
                        RE.td({},"Cell color"),
                        RE.td({},
                            RE.Select({
                                    value:settings[CELL_COLOR],
                                    onChange: event => {
                                        const newValue = event.target.value;
                                        setSettings(old => set(old, CELL_COLOR, newValue))
                                    },
                                },
                                RE.MenuItem({value:CELL_COLOR_ALL}, "White & Black"),
                                RE.MenuItem({value:CELL_COLOR_WHITE}, "White"),
                                RE.MenuItem({value:CELL_COLOR_BLACK}, "Black"),
                            )
                        ),
                    ),
                    RE.tr({},
                        RE.td({},"Num of cells to remember"),
                        RE.td({},
                            renderIntPropTextField({propName: NUM_OF_CELLS_TO_REMEMBER,
                                value:settings[NUM_OF_CELLS_TO_REMEMBER]}),
                        ),
                    ),
                    RE.tr({},
                        RE.td({},"Audio mode"),
                        RE.td({},
                            RE.Checkbox({
                                checked:settings[AUDIO_MODE],
                                onChange: () => setSettings(old => set(old, AUDIO_MODE, !settings[AUDIO_MODE])),
                                disabled:
                                    settings[NUM_OF_CELLS_TO_REMEMBER] != 1
                                    || createState({prevState:state,params:settings})[CONNECTIONS].length == 0
                                    || (settings[CONNECTION_TYPES].length == 1 && settings[CONNECTION_TYPES].includes(CONNECTION_TYPE_SAME_CELL))
                            })
                        ),
                    ),
                    RE.tr({},
                        RE.td({},"Always show cell name in question"),
                        RE.td({},
                            RE.Checkbox({
                                checked:settings[ALWAYS_SHOW_QUESTION_CELL_NAME],
                                onChange: () => setSettings(old => set(
                                    old, ALWAYS_SHOW_QUESTION_CELL_NAME, !settings[ALWAYS_SHOW_QUESTION_CELL_NAME]
                                ))
                            })
                        ),
                    ),
                )
            )
        )
    }

    function renderRangeSelector({min, max, setMin, setMax}) {
        return RE.div({style:{width:"170px", marginTop: "50px"}},
            RE.Slider({
                value:[min, max],
                onChange: (event, newValue) => {
                    const [newMin,newMax] = newValue
                    setMin(Math.min(newMin,newMax))
                    setMax(Math.max(newMin,newMax))
                },
                step:1,
                min:0,
                max:7,
                valueLabelDisplay:"on"
            })
        )
    }

    function renderConnectionTypeCheckbox(type, label) {
        return RE.FormControlLabel({
            label:label,
            control:RE.Checkbox({
                checked:settings[CONNECTION_TYPES].includes(type),
                onChange: () => setSettings(old => checkConnectionType(old, type))
            })
        })
    }

    function checkConnectionType(settings, type) {
        const connectionTypes = settings[CONNECTION_TYPES];
        if (connectionTypes.includes(type)) {
            settings = set(settings, CONNECTION_TYPES, connectionTypes.filter(t => t!==type))
        } else {
            settings = set(settings, CONNECTION_TYPES, [...connectionTypes, type])
        }
        if (settings[CONNECTION_TYPES].length == 0) {
            settings = set(settings, CONNECTION_TYPES, connectionTypes)
        }
        return settings
    }

    function openCloseSettingsDialog(opened) {
        if (opened) {
            setSettings({...state})
        } else {
            setSettings(null)
        }
    }

    function getIntValue({minValue, maxValue, defaultValue, value}) {
        minValue = nvl(minValue, -1000)
        maxValue = nvl(maxValue, 1000)
        defaultValue = nvl(defaultValue, "")
        value = value.replace(/\D/g, "")
        if (value == "") {
            return defaultValue
        } else {
            const valueInt = parseInt(value)
            if (minValue <= valueInt && valueInt <= maxValue) {
                return valueInt
            } else {
                return defaultValue
            }
        }
    }

    function renderTextField({value, onChange, width}) {
        return RE.TextField({
            value: value,
            variant: "outlined",
            onChange: onChange?onChange:()=>null,
            style: {
                borderRadius: "5px",
                width: (width?width:100)+"px"
            }
        })
    }

    function renderIntPropTextField({propName, value}) {
        return renderTextField({
            value: value,
            onChange: e => {
                const newValue = e.target.value
                setSettings(old => set(old, propName, getIntValue({value:newValue})))
            },
        })
    }

    if (!state[AUDIO_MODE]) {
        return RE.Container.row.left.top({},{style:{marginRight:"20px"}},
            RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
                renderChessboard(),
                RE.div({},
                    "Iteration: " + state[RND_ELEM_SELECTOR].iterationNumber
                    + "  Remaining elements: " + state[RND_ELEM_SELECTOR].remainingElems.length
                ),
                RE.div({}, "Number of connections: " + state[CONNECTIONS].length),
                RE.div({},
                    "Counts: min=" + arrMin(state[COUNTS])
                    + ", max=" + arrMax(state[COUNTS])
                    + ", sum=" + (state[COUNTS].length ? arrSum(state[COUNTS]) : 0)),
            ),
            RE.Container.col.top.left({},{},
                RE.Container.row.left.top({},{},
                    RE.Button({onClick: () => setState(resetRecentCells)}, "Reset recent cells"),
                    RE.Button({onClick: () => console.log(state)}, "View State"),
                    RE.Button({onClick: () => openCloseSettingsDialog(true)}, "Settings"),
                ),
                renderQuestion()
            ),
            settings?renderSettings():null,
        )
    } else {
        const textColor = "white"
        const bgColor = "black"
        return RE.Fragment({},
            re(MorseTouchDiv2, {
                dotDuration,
                dashDuration,
                symbolDelay,
                onSymbolsChange: onSymbolsChangedInListReader,
                bgColor,
                textColor,
                controls: RE.Container.row.left.center({},{},
                    RE.Button({style:{color:textColor}, onClick: openSpeechSettings}, "Settings"),
                    RE.Button({style:{color:textColor}, onClick: refreshSpeechStateFromSettings}, "Reload"),
                    RE.Button({style:{color:textColor}, onClick: printSpeechComponentState}, "State"),
                )
            }),
            renderSpeechSettings()
        )
    }

}

