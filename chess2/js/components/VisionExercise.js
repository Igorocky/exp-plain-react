'use strict';

const VisionExercise = ({configName}) => {
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
    const MOBILE_MODE = "MOBILE_MODE"
    const ALWAYS_SHOW_QUESTION_CELL_NAME = "ALWAYS_SHOW_QUESTION_CELL_NAME"
    const QUESTION_CELL_NAME_IS_SHOWN = "QUESTION_CELL_NAME_IS_SHOWN"
    const SETTINGS_TO_STORE_TO_LOCAL_STORAGE = [
        CONNECTION_TYPES, LINE_LENGTH_MIN, LINE_LENGTH_MAX, PATH_LENGTH, NUM_OF_CELLS_TO_REMEMBER, MOBILE_MODE,
        ALWAYS_SHOW_QUESTION_CELL_NAME
    ]
    const SETTINGS_DIALOG_OPENED = "SETTINGS_DIALOG_OPENED"
    const cellSize = profVal(PROFILE_MOBILE, 43, PROFILE_FUJ, 75, PROFILE_FUJ_FULL, 95)

    const [state, setState] = useState(() => createState({
        connectionTypes:[
            CONNECTION_TYPE_SAME_CELL,
            CONNECTION_TYPE_KNIGHT,
            CONNECTION_TYPE_LINE,
        ],
        lineLengthMin:2,
        lineLengthMax:4,
        pathLength:6,
        numOfCellsToRemember:1,
        mobileMode:true
    }))
    const [settings, setSettings] = useState(state)

    useEffect(() => restoreSettingsFromLocalStorage(), [])

    function createState({prevState, connectionTypes, lineLengthMin, lineLengthMax, pathLength, numOfCellsToRemember,
                         mobileMode, alwaysShowQuestionCellName}) {
        function firstDefined(value, attrName, defVal) {
            return value !== undefined ? value : (prevState ? prevState[attrName] : defVal)
        }

        connectionTypes = firstDefined(connectionTypes, CONNECTION_TYPES)
        lineLengthMin = firstDefined(lineLengthMin, LINE_LENGTH_MIN)
        lineLengthMax = firstDefined(lineLengthMax, LINE_LENGTH_MAX)
        pathLength = firstDefined(pathLength, PATH_LENGTH)
        numOfCellsToRemember = firstDefined(numOfCellsToRemember, NUM_OF_CELLS_TO_REMEMBER)
        mobileMode = firstDefined(mobileMode, MOBILE_MODE)
        alwaysShowQuestionCellName = firstDefined(alwaysShowQuestionCellName, ALWAYS_SHOW_QUESTION_CELL_NAME, false)

        if (connectionTypes.length == 1 && connectionTypes.includes(CONNECTION_TYPE_SAME_CELL)) {
            pathLength = 1
        }
        const allConnections = createAllConnections({
            connectionTypes:connectionTypes,
            lineLengthMin:lineLengthMin,
            lineLengthMax:lineLengthMax,
        })
        return {
            [STAGE]: STAGE_ASK,
            [RND_ELEM_SELECTOR]: randomElemSelector({allElems: ints(0,63)}),
            [USER_ANSWER_IS_CORRECT]: true,
            [NUM_OF_CELLS_TO_REMEMBER]: numOfCellsToRemember,
            [PATH_LENGTH]: pathLength,
            [RECENT_CELLS]: [],
            [CONNECTION_TYPES]: connectionTypes,
            [LINE_LENGTH_MIN]: lineLengthMin,
            [LINE_LENGTH_MAX]: lineLengthMax,
            [CONNECTIONS]: allConnections,
            [COUNTS]: ints(0, allConnections.length-1).map(i => 0),
            [MOBILE_MODE]: mobileMode,
            [SETTINGS_DIALOG_OPENED]: false,
            [QUESTION_CELL_NAME_IS_SHOWN]: false,
            [ALWAYS_SHOW_QUESTION_CELL_NAME]: alwaysShowQuestionCellName,
        }
    }

    function createAllConnections({connectionTypes, lineLengthMin, lineLengthMax}) {
        return [
            ...(connectionTypes.includes(CONNECTION_TYPE_SAME_CELL)?createSameCellConnections():[]),
            ...(connectionTypes.includes(CONNECTION_TYPE_KNIGHT)?createKnightConnections():[]),
            ...(connectionTypes.includes(CONNECTION_TYPE_LINE)?createLineConnections(lineLengthMin, lineLengthMax):[]),
        ].map((con, idx) => ({...con, idx:idx}))

    }

    function createSameCellConnections() {
        return ints(0,63).map(absNumToCell)
            .map(from => ({from:from, to:from, relSym:"o"}))
    }

    function createKnightConnections() {
        return ints(0,63).map(absNumToCell)
            .flatMap(from =>
                knightMovesFrom(from).map(to => ({from:from, to:to, relSym:calcSymbolForKnightMove(from,to)}))
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
                        .map(con => ({...con, relSym:calcSymbolForLineMove(con.from,con.to)+con.len}))
                })
            )
    }

    function calcSymbolForKnightMove(from, to) {
        if (from.x+1 < to.x) {//right
            return from.y < to.y ? N3+UP : N3+DOWN
        } else if (to.x+1 < from.x) {//left
            return from.y < to.y ? N9+UP : N9+DOWN
        } if (from.y+1 < to.y) {//top
            return from.x < to.x ? N12+RIGHT : N12+LEFT
        } else if (to.y+1 < from.y) {//bottom
            return from.x < to.x ? N6+RIGHT : N6+LEFT
        }
    }

    function calcSymbolForLineMove(from, to) {
        if (from.x < to.x) {
            if (from.y < to.y) {
                return RIGHT_UP
            } else if (from.y == to.y) {
                return RIGHT
            } else {
                return RIGHT_DOWN
            }
        } else if (from.x == to.x) {
            if (from.y < to.y) {
                return UP
            } else {
                return DOWN
            }
        } else {
            if (from.y < to.y) {
                return LEFT_UP
            } else if (from.y == to.y) {
                return LEFT
            } else {
                return LEFT_DOWN
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
        const userSelectsBlack = nativeEvent.button==1
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
            recentCells[0].seq.forEach(con => {
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
        return state[ALWAYS_SHOW_QUESTION_CELL_NAME] || state[MOBILE_MODE] || state[QUESTION_CELL_NAME_IS_SHOWN]
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
            return RE.Container.col.top.left({}, {},
                RE.span({style: questionStyle},
                    RE.span({
                            onClick:() => setState(old => set(old, QUESTION_CELL_NAME_IS_SHOWN, true)),
                            style: {cursor:"pointer"}
                        },
                        question
                    )
                ),
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

    function saveSettingsToLocalStorage(settings) {
        const settingsToStore = SETTINGS_TO_STORE_TO_LOCAL_STORAGE
            .reduce((m,e) => ({...m, [e]:settings[e]}), {})
        window.localStorage.setItem("VisionExercise.settings", JSON.stringify(settingsToStore))
    }

    function restoreSettingsFromLocalStorage() {
        const settingsStr = window.localStorage.getItem("VisionExercise.settings")
        if (settingsStr) {
            const settingsFromLocalStorage = JSON.parse(settingsStr)
            setSettings(oldSettings => {
                function getSettingsValue(propName) {
                    return {[propName]:nvl(settingsFromLocalStorage[propName], oldSettings[propName])}
                }
                const newSettings = {
                    ...oldSettings,
                    ...(
                        SETTINGS_TO_STORE_TO_LOCAL_STORAGE
                            .reduce((m,e) => ({...m, ...getSettingsValue(e)}), {})
                    )
                }
                updateStateFromSettings(newSettings)
                return newSettings
            })
        }
    }

    function updateStateFromSettings(settings) {
        function intOrUndef(value) {
            if (value !== "") {
                return value
            }
        }
        setState(old => createState({
            prevState:old,
            connectionTypes: settings[CONNECTION_TYPES],
            lineLengthMin: intOrUndef(settings[LINE_LENGTH_MIN]),
            lineLengthMax: intOrUndef(settings[LINE_LENGTH_MAX]),
            pathLength: intOrUndef(settings[PATH_LENGTH]),
            numOfCellsToRemember: intOrUndef(settings[NUM_OF_CELLS_TO_REMEMBER]),
            mobileMode: settings[MOBILE_MODE],
            alwaysShowQuestionCellName: settings[ALWAYS_SHOW_QUESTION_CELL_NAME],
        }))
        saveSettingsToLocalStorage(settings)
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
                        onClick: () => updateStateFromSettings(settings),
                    },
                        "Save"
                    ),
                )
            ),
            RE.table({style:{marginTop:"80px"}},
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
                        RE.td({},"Num of cells to remember"),
                        RE.td({},
                            renderIntPropTextField({propName: NUM_OF_CELLS_TO_REMEMBER,
                                value:settings[NUM_OF_CELLS_TO_REMEMBER]}),
                        ),
                    ),
                    RE.tr({},
                        RE.td({},"Mobile mode"),
                        RE.td({},
                            RE.Checkbox({
                                checked:settings[MOBILE_MODE],
                                onChange: () => setSettings(old => set(old, MOBILE_MODE, !settings[MOBILE_MODE]))
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

    function renderConnectionTypeCheckbox(type, label) {
        return RE.FormControlLabel({
            label:label,
            control:RE.Checkbox({
                checked:settings[CONNECTION_TYPES].includes(type),
                onChange: () => setSettings(old => checkConnectionType(settings, type))
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
            setSettings(state)
        }
        setState(old => set(old, SETTINGS_DIALOG_OPENED, opened))
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

    return RE.Container.row.left.top({},{style:{marginRight:"20px"}},
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderChessboard(),
            RE.div({}, "Iteration: " + state[RND_ELEM_SELECTOR].iterationNumber),
            RE.div({}, "Remaining elements: " + state[RND_ELEM_SELECTOR].remainingElems.length),
            RE.div({},
                "Counts: min=" + arrMin(state[COUNTS])
                + ", max=" + arrMax(state[COUNTS])
                + ", sum=" + arrSum(state[COUNTS])),
        ),
        RE.Container.col.top.left({},{},
            RE.Container.row.left.top({},{},
                RE.Button({onClick: () => setState(resetRecentCells)}, "Reset recent cells"),
                RE.Button({onClick: () => console.log(state)}, "View State"),
                RE.Button({onClick: () => openCloseSettingsDialog(true)}, "Settings"),
            ),
            renderQuestion()
        ),
        state[SETTINGS_DIALOG_OPENED]?renderSettings():null,
    )

}

