'use strict';

const LearnSequenceApp = () => {
    const ELEMS_TO_LEARN = "ELEMS_TO_LEARN"
    const FOCUSED_ELEM_IDX = "FOCUSED_ELEM_IDX"

    const [state, setState] = useState(() => createState())

    function createState() {
        return {
            [ELEMS_TO_LEARN]: PI_DIGITS.split('').map(e => ({value:parseInt(e)})),
            [FOCUSED_ELEM_IDX]: 0
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

    function onDigitEntered(state, userInputDigit) {
        const focusedElemIdx = state[FOCUSED_ELEM_IDX]
        const elemsToLearn = state[ELEMS_TO_LEARN]
        const currElem = elemsToLearn[focusedElemIdx]
        if (currElem.value == userInputDigit) {
            state = set(state, FOCUSED_ELEM_IDX, focusedElemIdx+1)
            state = set(state, ELEMS_TO_LEARN, modify(elemsToLearn, focusedElemIdx, e => ({...e, opened: true})))
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

    return RE.Container.row.left.top({},{style:{margin:"30px"}},
        ints(0,1).map(numberOfHundreds => re(TableOfElems, {
            numberOfHundreds:numberOfHundreds,
            elems: state[ELEMS_TO_LEARN],
            focusedElemIdx: state[FOCUSED_ELEM_IDX],
            onElemLeftClicked: idxClicked => setState(old => set(old, FOCUSED_ELEM_IDX, idxClicked)),
            onRowLeftClicked: startIdxClicked => setState(old => openCloseElemsInRow(old, startIdxClicked)),
            onDigitLeftClicked: userInputDigit => setState(old => onDigitEntered(old, userInputDigit)),
        }))
    )
}