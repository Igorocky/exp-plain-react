'use strict';

const VisionExercise = ({configName}) => {
    const [rndElemSelector, setRndElemSelector] = useState(() => getNewRndElemSelector())
    const [question, setQuestion] = useState(rndElemSelector.getCurrentElem())
    const [userAnswerIsIncorrect, setUserAnswerIsIncorrect] = useState(false)
    const {renderChessboard} = useChessboard({cellSize:72, configName:configName})
    const [isCoordsMode, setIsCoordsMode] = useState(true)

    function getNewRndElemSelector() {
        return new RandomElemSelector({
            elems: ints(0,63)
        })
    }

    function cellNumToCellName(cellNum) {
        return getCellName(absNumToCell(cellNum))
    }

    const onCellClicked = cell => {
        const userAnswerIsCorrect = getCellName(cell) == cellNumToCellName(question)
        setUserAnswerIsIncorrect(!userAnswerIsCorrect)
        if (userAnswerIsCorrect) {
            rndElemSelector.loadNextElem()
            setQuestion(rndElemSelector.getCurrentElem())
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

    function renderQuestion() {
        const cellName = cellNumToCellName(rndElemSelector.getCurrentElem());
        if (isCoordsMode) {
            return RE.div({
                    style:{
                        color: userAnswerIsIncorrect?"red":"black",
                        border: userAnswerIsIncorrect?"solid 3px red":null,
                        fontSize:"100px"
                    }
                },
                cellName
            )
        } else {
            const size = "120px"
            return RE.div({
                style: {width: size, height: size, border: userAnswerIsIncorrect?"solid 3px red":null},
                onClick: () => onClick(coords)
            }, RE.img( {
                    src:"chess-board-configs/" + configName + "/" + cellName + ".png",
                    className: "cell-img"
                })
            )
        }
    }

    return RE.Container.row.left.center({},{style:{marginRight:"20px"}},
        renderChessboard({onCellClicked:onCellClicked}),
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderModeSelector(),
            renderQuestion(),
            RE.div({}, "Iteration: " + rndElemSelector.getIterationNumber()),
            RE.div({}, "Remaining elements: " + rndElemSelector.getRemainingElements()),
        ),
    )
}

