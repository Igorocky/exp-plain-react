'use strict';

const LearnSequenceApp = () => {
    const [elemsToLearn, setElemsToLearn] = useState(() => ints(0,400).map(e => ({value:e%10})))
    const [focusedElemIdx, setFocusedElemIdx] = useState(1)

    function openCloseElemsInRow(startIdxClicked) {
        setElemsToLearn(oldElemsToLearn => {
            const start = startIdxClicked
            const end = startIdxClicked+9
            const elemsInRow = ints(start, end).map(i => oldElemsToLearn[i])
            const atLeastOneElemIsOpened = elemsInRow.reduce((a,e) => a || e.opened, false)
            return oldElemsToLearn.map((e,i) => {
                if (start <= i && i <= end) {
                    return {...e, opened:!atLeastOneElemIsOpened}
                } else {
                    return e
                }
            })
        })
    }

    return RE.Container.row.left.top({},{style:{margin:"30px"}},
        ints(0,0).map(numberOfHundreds => re(TableOfElems, {
            numberOfHundreds:numberOfHundreds,
            focusedElemIdx:focusedElemIdx,
            focusedElemBackgroundColor:"orange",
            onElemLeftClicked: idxClicked => setFocusedElemIdx(idxClicked),
            onRowLeftClicked: openCloseElemsInRow,
            elems: elemsToLearn
        }))
    )
}