'use strict';

const ConnectionsAudio = ({}) => {
    const [rndElemSelector, setRndElemSelector] = useState(getNewRndElemSelector)

    const {say, symbolDelay, dotDuration, dashDuration,
        openSpeechSettings, renderSettings:renderSpeechSettings, refreshStateFromSettings:refreshSpeechStateFromSettings,
        printState:printSpeechComponentState} = useSpeechComponent()

    const {init:initListReader, onSymbolsChanged:onSymbolsChangedInListReader} = useListReader()

    useEffect(() => initListReader({
        say,
        title: {
            say: () => say(getCurrTaskDescription()),
        },
        elems: [
            {
                say: () => say(getCurrTaskDescription()),
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
        const xStr = XX[rndElemSelector.currentElem.x].toUpperCase()
        return MORSE_ARR.find(({sym}) => sym == xStr).word + ", " + YY[rndElemSelector.currentElem.y] + "."
    }

    function getNewRndElemSelector() {
        return randomElemSelector({
            allElems: ints(0,63).map(absNumToCell)
        })
    }

    const textColor = "white"
    const bgColor = "black"
    return RE.Fragment({},
        re(MorseTouchDiv2, {
            dotDuration,
            dashDuration,
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

