'use strict';

const KnightPath = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const {renderChessboard, checkCell, uncheckAllCells, showImageOnAllCells, hideImageOnAllCells} = useChessboard({cellSize:72, configName:configName})
    const [phaseQuestion, setPhaseQuestion] = useState(true)

    function getNewRndElemSelector() {
        return new RandomElemSelector({
            // elems: product(ints(0,63),ints(0,63))
            elems: [...product(ints(0,7),ints(56,63)), ...product([0,8,16,24,32,40,48,56],[7,15,23,31,39,47,55,63])]
        })
    }

    function cellNumToCellName(cellNum) {
        return getCellName(absNumToCell(cellNum))
    }

    const onCellClicked = cell => {
        setPhaseQuestion(!phaseQuestion)
        if (!phaseQuestion) {
            uncheckAllCells()
            hideImageOnAllCells()
            rndElemSelector.loadNextElem()
        } else {
            checkCell(absNumToCell(rndElemSelector.getCurrentElem()[0]))
            checkCell(absNumToCell(rndElemSelector.getCurrentElem()[1]))
            showImageOnAllCells()
        }
    }

    function renderQuestion() {
        const cell1Name = cellNumToCellName(rndElemSelector.getCurrentElem()[0]);
        const cell2Name = cellNumToCellName(rndElemSelector.getCurrentElem()[1]);
        return RE.div({style:{fontSize:"100px"}},
            cell1Name + String.fromCharCode(8594) + cell2Name
        )
    }

    return RE.Container.row.left.bottom({},{style:{marginRight:"20px"}},
        renderChessboard({onCellClicked:onCellClicked}),
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderQuestion(),
            RE.div({}, "Iteration: " + rndElemSelector.getIterationNumber()),
            RE.div({}, "Remaining elements: " + rndElemSelector.getRemainingElements()),
            RE.Button({onClick:onCellClicked}, "Next")
        ),
    )
}

