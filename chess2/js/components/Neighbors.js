'use strict';

const Neighbors = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const {renderChessboard, checkCell, uncheckAllCells, showImageOnCell, hideImageOnAllCells} = useChessboard({cellSize:72, configName:configName})
    const [phaseQuestion, setPhaseQuestion] = useState(true)

    function getNewRndElemSelector() {
        return new RandomElemSelector({
            elems: ints(0,63)
        })
    }

    function isValidCell(cell) {
        return 0 <= cell.x && cell.x < 8 && 0 <= cell.y && cell.y < 8
    }

    function moveToCellRelatively(baseCell,dx,dy) {
        return {x:baseCell.x+dx, y:baseCell.y+dy}
    }

    function neighborsOf(cell) {
        return _.filter([
            moveToCellRelatively(cell,-1,-1),
            moveToCellRelatively(cell,-1,0),
            moveToCellRelatively(cell,-1,+1),
            moveToCellRelatively(cell,0,-1),
            moveToCellRelatively(cell,0,+1),
            moveToCellRelatively(cell,1,-1),
            moveToCellRelatively(cell,1,0),
            moveToCellRelatively(cell,1,+1),
        ], c => isValidCell(c))
    }

    function getNeighborsForCellNumber(cellNumber) {
        const currCell = absNumToCell(cellNumber);
        return [currCell, ...neighborsOf(currCell)]
    }

    function cellNumToCellName(cellNum) {
        return getCellName(absNumToCell(cellNum))
    }

    const onCellClicked = cell => {
        setPhaseQuestion(!phaseQuestion)
        if (!phaseQuestion) {
            hideImageOnAllCells()
            rndElemSelector.loadNextElem()
        } else {
            getNeighborsForCellNumber(rndElemSelector.getCurrentElem()).forEach(c => showImageOnCell(c))
        }
    }

    function renderQuestion() {
        return RE.div({style:{fontSize:"100px"}},
            cellNumToCellName(rndElemSelector.getCurrentElem())
        )
    }

    return RE.Container.row.left.top({},{style:{marginRight:"20px"}},
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderQuestion(),
            RE.div({}, "Iteration: " + rndElemSelector.getIterationNumber()),
            RE.div({}, "Remaining elements: " + rndElemSelector.getRemainingElements()),
            RE.Button({onClick:onCellClicked}, "Next")
        ),
        !phaseQuestion?renderChessboard({onCellClicked:onCellClicked}):null,
    )
}

