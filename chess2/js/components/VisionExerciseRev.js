'use strict';

const VisionExerciseRev = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const {renderChessboard, checkCell, uncheckAllCells} = useChessboard({cellSize:72, configName:configName})
    const [phaseQuestion, setPhaseQuestion] = useState(true)

    useEffect(() => checkCell(absNumToCell(rndElemSelector.getCurrentElem())), [])

    function getNewRndElemSelector() {
        return new RandomElemSelector({
            elems: ints(0,63)
        })
    }

    function cellNumToCellName(cellNum) {
        return getCellName(absNumToCell(cellNum))
    }

    const onCellClicked = cell => {
        setPhaseQuestion(!phaseQuestion)
        if (!phaseQuestion) {
            uncheckAllCells()
            rndElemSelector.loadNextElem()
            checkCell(absNumToCell(rndElemSelector.getCurrentElem()))
        }
    }

    return RE.Container.row.left.bottom({},{style:{marginRight:"20px"}},
        renderChessboard({onCellClicked:onCellClicked}),
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            RE.div({style:{fontSize:"100px"}},
                phaseQuestion?"":cellNumToCellName(rndElemSelector.getCurrentElem())
            ),
            RE.div({}, "Iteration: " + rndElemSelector.getIterationNumber()),
            RE.div({}, "Remaining elements: " + rndElemSelector.getRemainingElements()),
        ),
    )
}

