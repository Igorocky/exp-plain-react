'use strict';

const ConnectionsAudio = ({}) => {
    const [rndElemSelector, setRndElemSelector] = useState(getNewRndElemSelector)

    const {say, symbolDelay, dotDuration,
        openSpeechSettings, renderSettings:renderSpeechSettings, refreshStateFromSettings:refreshSpeechStateFromSettings,
        printState:printSpeechComponentState} = useSpeechComponent()

    const {init:initListReader, onSymbolsChanged:onSymbolsChangedInListReader} = useListReader()

    useEffect(() => initListReader({
        say,
        title: getCurrTaskDescription(),
        elems: [
            {
                say: () => say("Go to next cell."),
                onEnter: () => setRndElemSelector(old => old.next())
            },
            {
                say: () => say("Elements remaining: " + rndElemSelector.remainingElems.length),
            },
            {
                say: () => say("Iteration number: " + rndElemSelector.iterationNumber),
            }
        ]
    }), [rndElemSelector])

    function getCurrTaskDescription() {
        return XX[rndElemSelector.currentElem.x].toUpperCase() + ". " + YY[rndElemSelector.currentElem.y] + "."
    }

    function getNewRndElemSelector() {
        return randomElemSelector({
            allElems: ints(0,63).map(absNumToCell)
        })
    }

    const textColor = "black"
    const bgColor = "white"
    return RE.Fragment({},
        re(MorseTouchDiv2, {
            dotDuration,
            symbolDelay,
            onSymbolsChange: onSymbolsChangedInListReader,
            bgColor,
            textColor,
            controls: RE.Container.row.left.center({},{},
                RE.Button({style:{color:textColor}, onClick: openSpeechSettings}, "Settings"),
                RE.Button({style:{color:textColor}, onClick: refreshSpeechStateFromSettings}, "Reload"),
                RE.Button({style:{color:textColor}, onClick: printSpeechComponentState}, "State"),
            )
        }),
        renderSpeechSettings()
    )
}

