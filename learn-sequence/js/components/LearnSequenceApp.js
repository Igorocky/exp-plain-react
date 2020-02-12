'use strict';

const LearnSequenceApp = () => {
    const [elemsToLearn, setElemsToLearn] = useState(() => PI_DIGITS.split('').map(e => ({value:parseInt(e)})))
    const [focusedElemIdx, setFocusedElemIdx] = useState(0)

    useEffect(() => {
        document.addEventListener(KEYDOWN_LISTENER_NAME, onKeyDown)
        return () => document.removeEventListener(KEYDOWN_LISTENER_NAME, onKeyDown)
    }, [focusedElemIdx])

    function onKeyDown(event) {
        if (48 <= event.keyCode && event.keyCode <= 57) {
            const userInputDigit = event.keyCode-48
            setElemsToLearn(oldElemsToLearn => {
                return oldElemsToLearn.map((e, i) => {
                    if (focusedElemIdx == i) {
                        if (e.value == userInputDigit) {
                            setFocusedElemIdx(focusedElemIdx + 1)
                            return {...e, opened: true}
                        } else {
                            return {...e, failed: true}
                        }
                    } else {
                        return e
                    }
                })
            })
        }
    }

    function openCloseElemsInRow(startIdxClicked) {
        setElemsToLearn(oldElemsToLearn => {
            const start = startIdxClicked
            const end = startIdxClicked+9
            const elemsInRow = ints(start, end).map(i => oldElemsToLearn[i])
            const atLeastOneElemIsOpened = elemsInRow.reduce((a,e) => a || e.opened, false)
            return oldElemsToLearn.map((e,i) => {
                if (start <= i && i <= end) {
                    return {...e, opened:!atLeastOneElemIsOpened, failed:false}
                } else {
                    return e
                }
            })
        })
    }

    return RE.Container.row.left.top({},{style:{margin:"30px"}},
        ints(0,1).map(numberOfHundreds => re(TableOfElems, {
            numberOfHundreds:numberOfHundreds,
            focusedElemIdx:focusedElemIdx,
            onElemLeftClicked: idxClicked => setFocusedElemIdx(idxClicked),
            onRowLeftClicked: openCloseElemsInRow,
            elems: elemsToLearn
        }))
    )
}