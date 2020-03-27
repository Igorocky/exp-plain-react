'use strict';

const LearnSequenceApp = () => {
    const NUM_OF_HUNDREDS = 2
    const ELEMS_TO_LEARN = "ELEMS_TO_LEARN"
    const FOCUSED_ELEM_IDX = "FOCUSED_ELEM_IDX"
    const MODE = "MODE"
    const MODE_SEQ = "MODE_SEQ"
    const MODE_RND = "MODE_RND"
    const MIN_ELEM_IDX_UI = "MIN_ELEM_IDX_UI"
    const MIN_ELEM_IDX = "MIN_ELEM_IDX"
    const MAX_ELEM_IDX_UI = "MAX_ELEM_IDX_UI"
    const MAX_ELEM_IDX = "MAX_ELEM_IDX"

    const [state, setState] = useState(() => createState({
        mode:MODE_SEQ,
        minElemIdxUi:1,
        maxElemIdxUi:NUM_OF_HUNDREDS*100
    }))

    function createState({prevState, mode, minElemIdxUi, maxElemIdxUi}) {
        function oneOf(value, attrName) {
            return hasValue(value)?value:prevState[attrName]
        }

        const newMode = oneOf(mode, MODE);

        const newMinElemIdxUi = oneOf(minElemIdxUi, MIN_ELEM_IDX_UI);
        const newMinElemIdx = newMode==MODE_RND?(newMinElemIdxUi===""?0:newMinElemIdxUi-1):0;

        const newMaxElemIdxUi = oneOf(maxElemIdxUi, MAX_ELEM_IDX_UI);
        const newMaxElemIdx = newMode==MODE_RND?(newMaxElemIdxUi===""?0:newMaxElemIdxUi-1):NUM_OF_HUNDREDS*100;

        return {
            [ELEMS_TO_LEARN]: PI_DIGITS.split('').map(e => ({value:parseInt(e)})),
            [FOCUSED_ELEM_IDX]: newMode==MODE_RND?newMinElemIdx:0,
            [MODE]: newMode,
            [MIN_ELEM_IDX_UI]: newMinElemIdxUi,
            [MIN_ELEM_IDX]: newMinElemIdx,
            [MAX_ELEM_IDX_UI]: newMaxElemIdxUi,
            [MAX_ELEM_IDX]: newMaxElemIdx,
        }
    }

    useEffect(() => {
        document.addEventListener(KEYDOWN_LISTENER_NAME, onKeyDown)
        return () => document.removeEventListener(KEYDOWN_LISTENER_NAME, onKeyDown)
    }, [state])

    function calcUserInputDigit(keyCode) {
        if (48 <= keyCode && keyCode <= 57) {
            return keyCode - 48
        } else if (96 <= keyCode && keyCode <= 105) {
            return keyCode - 96
        } else {
            return null
        }
    }

    function onKeyDown(event) {
        const userInputDigit = calcUserInputDigit(event.keyCode)
        if (hasValue(userInputDigit)) {
            setState(old => onDigitEntered(old, userInputDigit))
        }
    }

    function nextFocusedElemIdx(state) {
        if (state[MODE] == MODE_SEQ) {
            state = set(state, FOCUSED_ELEM_IDX, state[FOCUSED_ELEM_IDX]+1)
        } else {
            const minIdx = state[MIN_ELEM_IDX]
            const maxIdx = state[MAX_ELEM_IDX]
            const closedElems = state[ELEMS_TO_LEARN]
                .map((e,i) => ({elem:e, idx:i}))
                .filter(({elem, idx}) => minIdx <= idx && idx <= maxIdx && !elem.opened)
            if (closedElems.length > 0) {
                state = set(state, FOCUSED_ELEM_IDX, closedElems[randomInt(0,closedElems.length-1)].idx)
            } else {
                state = createState({prevState:state})
                state = set(state, FOCUSED_ELEM_IDX, randomInt(minIdx,maxIdx))
            }
        }
        return state
    }

    function onDigitEntered(state, userInputDigit) {
        const focusedElemIdx = state[FOCUSED_ELEM_IDX]
        const elemsToLearn = state[ELEMS_TO_LEARN]
        const currElem = elemsToLearn[focusedElemIdx]
        if (currElem.value == userInputDigit) {
            state = set(state, ELEMS_TO_LEARN, modify(elemsToLearn, focusedElemIdx, e => ({...e, opened: true})))
            state = nextFocusedElemIdx(state)
        } else {
            state = set(state, ELEMS_TO_LEARN, modify(elemsToLearn, focusedElemIdx, e => ({...e, failed: true})))
        }
        return state
    }


    function openCloseElemsInRow(state, startIdxClicked) {
        const start = startIdxClicked
        const end = startIdxClicked+9
        const elemsToLearn = state[ELEMS_TO_LEARN]
        const elemsInRow = ints(start, end).map(i => elemsToLearn[i])
        const atLeastOneElemIsOpened = elemsInRow.find(e => e.opened)
        state = set(state, ELEMS_TO_LEARN,
            elemsToLearn.map((e,i) => {
                if (start <= i && i <= end) {
                    return {...e, opened:!atLeastOneElemIsOpened, failed:false}
                } else {
                    return e
                }
            })
        )
        return state
    }

    function getIntProp({minValue, maxValue, defaultValue, value}) {
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

    function renderTextField({label, value, onChange, width}) {
        return RE.Toolbar({variant: "dense"},
            RE.Typography({key:"Typography", edge: "start"}, label),
            RE.InputBase({
                key: "InputBase",
                onKeyDown: onKeyDown,
                value: value,
                variant: "outlined",
                onChange: onChange?onChange:()=>null,
                style: {
                    background: "white",
                    padding:"0px 5px",
                    borderRadius: "5px",
                    marginLeft: "5px",
                    width: width+"px"
                }
            })
        )
    }

    function setElemIdxBoundary(paramName, newValue) {
        setState(createState({
            prevState:state,
            [paramName]: getIntProp({minValue: 1, maxValue: NUM_OF_HUNDREDS * 100, defaultValue: "", value: newValue})
        }))
    }

    function renderElemsRangeSelector() {
        return RE.Fragment({},
            renderTextField({label:"от", value: state[MIN_ELEM_IDX_UI], width:60,
                onChange: e => setElemIdxBoundary("minElemIdxUi", e.target.value)
            }),
            renderTextField({label:"до", value: state[MAX_ELEM_IDX_UI], width:60,
                onChange: e => setElemIdxBoundary("maxElemIdxUi", e.target.value)
            })
        )
    }

    function renderSettings() {
        const fontSize = 25
        const commonStyle = {fontSize: fontSize}
        return RE.Fragment({},
            RE.Select({
                    value:state[MODE],
                    onChange: event => setState(old => createState({prevState:old, mode:event.target.value})),
                    style:{...commonStyle, color:"white"}
                },
                RE.MenuItem({value:MODE_SEQ, style:{...commonStyle, color:"black"}},
                    "Последовательно"
                ),
                RE.MenuItem({value:MODE_RND, style:{...commonStyle, color:"black"}},
                    "Случайно"
                )
            ),
            state[MODE]==MODE_RND
                ?renderElemsRangeSelector()
                :null
        )
    }

    return RE.Fragment({},
        RE.AppBar({},
            RE.Toolbar({},renderSettings())
        ),
        RE.Container.row.left.top({style: {marginTop:"50px"}},{style:{margin:"30px"}},
            ints(0,NUM_OF_HUNDREDS-1).map(numberOfHundreds => re(TableOfElems, {
                numberOfHundreds:numberOfHundreds,
                elems: state[ELEMS_TO_LEARN],
                focusedElemIdx: state[FOCUSED_ELEM_IDX],
                minElemIdx: state[MIN_ELEM_IDX],
                maxElemIdx: state[MAX_ELEM_IDX],
                onElemLeftClicked: idxClicked => setState(old => set(old, FOCUSED_ELEM_IDX, idxClicked)),
                onRowLeftClicked: startIdxClicked => setState(old => openCloseElemsInRow(old, startIdxClicked)),
                onDigitLeftClicked: userInputDigit => setState(old => onDigitEntered(old, userInputDigit)),
            }))
        )
    )
}