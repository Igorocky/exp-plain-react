'use strict';

function getDirectionTitle(dir) {
    return dir?"Img->Coords":"Coords->Img"
}

const ImgToCoordsExercise = ({configName}) => {
    const [settings, setSettings] = useState({dirImgToCoords:true})
    const [settingsDialogOpened, setSettingsDialogOpened] = useState(false)
    const [rndElemSelector, setRndElemSelector] = useState(getNewRndElemSelector())
    const [rndElemSelectorId, setRndElemSelectorId] = useState(1)
    const flipPhaseRef = useRef(null)
    const cellSize = "150px"
    const divStyle = {width: cellSize, height: cellSize, fontSize: "120px"}

    function getNewRndElemSelector() {
        return new RandomElemSelector({
            elems: _.map(ints(0,63), cellNumToCard)
        })
    }

    function cellNumToCard(cellNum) {
        return {cellName: getCellName(absNumToCell(cellNum))}
    }

    function renderImage(card) {
        return RE.div({style: divStyle}, RE.Container.row.center.top({},{},
            RE.img({
                src:"chess-board-configs/" + configName + "/" + card.cellName + ".png",
                className: "cell-img"
            })
        ))
    }

    function renderCoords(card) {
        return RE.div({style: divStyle}, RE.Container.row.center.top({},{},
            card.cellName
        ))
    }

    function renderSettings() {
        if (!settingsDialogOpened) {
            return RE.Button({onClick: () => setSettingsDialogOpened(true), color:"primary"},"Settings")
        } else {
            return re(ImgToCoordsSettingsDialog,{
                settings:settings,
                onSave: newSettings => {
                    setSettings(newSettings)
                    setSettingsDialogOpened(false)
                    setRndElemSelector(getNewRndElemSelector())
                    setRndElemSelectorId(prevId => prevId+1)
                },
                onCancel: () => setSettingsDialogOpened(false)
            })
        }
    }

    function renderExercise() {
        return re(CardsExercise, {
            key:rndElemSelectorId,
            rndElemSelector:rndElemSelector,
            renderQuestion: card => settings.dirImgToCoords?renderImage(card):renderCoords(card),
            renderAnswer: card => settings.dirImgToCoords?renderCoords(card):renderImage(card),
            flipPhaseRef:flipPhaseRef,
            onIterationComplete: () => setSettingsDialogOpened(true)
        })
    }
    
    function renderNextButton() {
        return RE.Button({
                onClick: ()=>apply(flipPhaseRef.current), size:"large",
                style:{height:"100px", width:"100px"}},
            "Next"
        )
    }

    function renderExerciseDescription() {
        return RE.Container.row.center.top({},{},
            RE.div({style:{fontSize: "30px"}}, getDirectionTitle(settings.dirImgToCoords))
        )
    }

    return RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
        renderSettings(),
        renderExerciseDescription(),
        renderExercise(),
        renderNextButton()
    )
}

const ImgToCoordsSettingsDialog = ({settings, onSave, onCancel}) => {
    const [dirImgToCoords, setDirImgToCoords] = useState(settings.dirImgToCoords)

    function getDirValue() {
        return dirImgToCoords?"ic":"ci"
    }

    function handleDirChange(event) {
        setDirImgToCoords("ic" == event.target.value)
    }

    function renderDirSelector() {
        return RE.FormControl({component:"fieldset"},
            RE.FormLabel({component:"legend"},"Direction"),
            RE.RadioGroup({value:getDirValue(), onChange: handleDirChange, row:true},
                RE.FormControlLabel({label: getDirectionTitle(true), value: "ic", control: RE.Radio({})}),
                RE.FormControlLabel({label: getDirectionTitle(false), value: "ci", control: RE.Radio({})}),
            )
        )
    }

    function renderButtons() {
        return RE.Container.row.left.top({}, {},
            RE.Button(
                {onClick: () => onSave({dirImgToCoords: dirImgToCoords}), color: "primary"},
                "Save"
            ),
            RE.Button(
                {onClick: () => onCancel()},
                "Cancel"
            )
        )
    }

    return RE.Container.col.top.center({},{},RE.Paper({style:{padding:"10px"}},
        renderButtons(),
        renderDirSelector()
    ))
}