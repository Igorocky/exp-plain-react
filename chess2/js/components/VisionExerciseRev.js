'use strict';

const VisionExerciseRev = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const {renderChessboard, checkCell, uncheckAllCells, showImageOnCell, hideImageOnAllCells} = useChessboard({cellSize:72, configName:configName})
    const [phaseQuestion, setPhaseQuestion] = useState(true)
    const [isCoordsMode, setIsCoordsMode] = useState(true)

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
            hideImageOnAllCells()
            rndElemSelector.loadNextElem()
            checkCell(absNumToCell(rndElemSelector.getCurrentElem()))
        } else {
            if (!isCoordsMode) {
                uncheckAllCells()
                showImageOnCell(absNumToCell(rndElemSelector.getCurrentElem()))
            }
        }
    }

    function renderModeSelector() {
        return RE.FormControl({component:"fieldset"},
            RE.FormLabel({component:"legend"},"Mode"),
            RE.RadioGroup({
                    row: true,
                    value: isCoordsMode+"",
                    onChange: event => setIsCoordsMode(event.target.value == "true")
                },
                RE.FormControlLabel({label: "Coords", value: "true", control: RE.Radio({})}),
                RE.FormControlLabel({label: "Img", value: "false", control: RE.Radio({})}),
            )
        )
    }

    function renderAnswer() {
        const cellName = cellNumToCellName(rndElemSelector.getCurrentElem());
        if (!phaseQuestion) {
            if (isCoordsMode) {
                return RE.div({style:{fontSize:"100px"}},
                    phaseQuestion?"":cellName
                )
            }
        } else {
            return null
        }
    }

    return RE.Container.row.left.bottom({},{style:{marginRight:"20px"}},
        renderChessboard({onCellClicked:onCellClicked}),
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderAnswer(),
            renderModeSelector(),
            RE.div({}, "Iteration: " + rndElemSelector.getIterationNumber()),
            RE.div({}, "Remaining elements: " + rndElemSelector.getRemainingElements()),
            RE.Button({onClick:onCellClicked}, "Next")
        ),
    )
}

