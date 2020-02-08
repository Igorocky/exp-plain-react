'use strict';

const Connections = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const {renderChessboard, checkCell, uncheckAllCells, showImageOnCell, hideImageOnAllCells} = useChessboard({cellSize:72, configName:configName})
    const [phaseQuestion, setPhaseQuestion] = useState(true)

    function getNewRndElemSelector() {
        return new RandomElemSelector({
            elems: FOOTPRINTS.filter(i => {
                const type = getConnectionType(i)

                return type.diagonal && type.length > 1
                // return type.horizontal || type.vertical
                // return type.vertical
                // return type.horizontal

                // return hasValue(type.knight)
                // return hasValue(type.rook)
                // return hasValue(type.bishop)

                // const cellNum = type.knight
                // return hasValue(cellNum) && [0].includes(cellNum % 12)
             })
        })
    }

    const onCellClicked = cell => {
        setPhaseQuestion(!phaseQuestion)
        if (!phaseQuestion) {
            uncheckAllCells()
            hideImageOnAllCells()
            rndElemSelector.loadNextElem()
        } else {
            createCellsByConnectionNumber(rndElemSelector.getCurrentElem()).forEach(c => showImageOnCell(c))
        }
    }

    function renderQuestion() {
        return RE.div({style:{fontSize:"100px"}},
            getConnectionType(rndElemSelector.getCurrentElem()).symbol
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

