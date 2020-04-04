"use strict";

const MorseExercise = ({}) => {
    const LOCAL_STORAGE_KEY = "MorseExercise.settings"
    const VOICE = "VOICE"
    const VOICE_OBJ = "VOICE_OBJ"
    const RATE = "RATE"
    const PITCH = "PITCH"
    const GROUPS_TO_LEARN = "GROUPS_TO_LEARN"
    const RND = "RND"
    const SYMBOL_DELAY = "SYMBOL_DELAY"
    const DASH_DURATION = "DASH_DURATION"

    const ATTRS_TO_SAVE_TO_LOC_STORAGE = [VOICE, RATE, PITCH, GROUPS_TO_LEARN, SYMBOL_DELAY, DASH_DURATION]
    const ELEMS_IN_GROUP_TO_LEARN = 6

    const MORSE = [{sym:"0", code:"-----"}, {sym:"1", code:".----"}, {sym:"2", code:"..---"}, {sym:"3", code:"...--"}, {sym:"4", code:"....-"}, {sym:"5", code:"....."}, {sym:"6", code:"-...."}, {sym:"7", code:"--..."}, {sym:"8", code:"---.."}, {sym:"9", code:"----."}, {sym:"A", code:".-"}, {sym:"B", code:"-..."}, {sym:"C", code:"-.-."}, {sym:"D", code:"-.."}, {sym:"E", code:"."}, {sym:"F", code:"..-."}, {sym:"G", code:"--."}, {sym:"H", code:"...."}, {sym:"I", code:".."}, {sym:"J", code:".---"}, {sym:"K", code:"-.-"}, {sym:"L", code:".-.."}, {sym:"M", code:"--"}, {sym:"N", code:"-."}, {sym:"O", code:"---"}, {sym:"P", code:".--."}, {sym:"Q", code:"--.-"}, {sym:"R", code:".-."}, {sym:"S", code:"..."}, {sym:"T", code:"-"}, {sym:"U", code:"..-"}, {sym:"V", code:"...-"}, {sym:"W", code:".--"}, {sym:"X", code:"-..-"}, {sym:"Y", code:"-.--"}, {sym:"Z", code:"--.."}]

    const [state, setState] = useState(() => createState({}))
    const [settings, setSettings] = useState(null)

    const touchDiv = useRef(null)
    const inputLog = useRef([])
    const inputView = useRef(null)
    const timeout = useRef(null)

    useEffect(
        () => updateStateFromSettings(false,
            readSettingsFromLocalStorage({
                localStorageKey: LOCAL_STORAGE_KEY,
                attrsToRead: ATTRS_TO_SAVE_TO_LOC_STORAGE
            })
        ),
        []
    )

    useEffect(() => {
        window.speechSynthesis.onvoiceschanged = () => {
            setState(old => {
                const voice = getVoice(old[VOICE])
                return createState({prevState:old, voice:voice?voice.voiceURI:old[VOICE]})
            })
        }
    }, [])

    function getCurrentTime() {
        return new Date().getTime()
    }

    function onMouseDown() {
        const curTime = getCurrentTime()
        if (inputLog.current.length) {
            const lst = inputLog.current[inputLog.current.length-1]
            if (!lst.up || curTime - lst.up > state[SYMBOL_DELAY]) {
                inputLog.current = []
            }
        }
        inputLog.current.push({down: getCurrentTime()})
    }

    function onMouseUp() {
        window.clearTimeout(timeout.current)
        if (inputLog.current.length) {
            const lastInput = inputLog.current[inputLog.current.length-1];
            lastInput.up = getCurrentTime()
            lastInput.dur = lastInput.up - lastInput.down
            timeout.current = window.setTimeout(guessSymbol, state[SYMBOL_DELAY])
            rerenderInput()
        }
    }

    function rerenderInput() {
        setInputView(
            inputLogToString()
            + JSON.stringify(state[RND].currentElem)
            + " Iteration: " + state[RND].iterationNumber
            + ", Remains: " + state[RND].remainingElems.length
        )
    }

    function guessSymbol() {
        const code = inputLogToString()
        const found = MORSE.filter(m => m.code == code)
        if (found.length && found[0].sym == state[RND].currentElem.sym) {
            state[RND] = state[RND].next()
            say(state[RND].currentElem.sym)
        } else {
            sayCode(state[RND].currentElem.code)
            say(state[RND].currentElem.sym)
        }
    }

    function sayCode(code) {
        say(code.split('').map(s => s == "." ? "dot" : "dash").join(", "))
    }

    function inputLogToString() {
        return inputLog.current.map(({dur}) => dur < state[DASH_DURATION] ? "." : "-").reduce((m,e) => m+e,"")
        return JSON.stringify(inputLog.current)
    }

    function setInputView(content) {
        if (inputView.current) {
            inputView.current.innerHTML = content
        }
    }

    function say(text, rate) {
        var msg = new SpeechSynthesisUtterance();
        msg.voice = state[VOICE_OBJ]
        msg.rate = rate ? rate : state[RATE]
        msg.pitch = state[PITCH]
        msg.text = text
        msg.lang = "en"
        speechSynthesis.speak(msg);
    }

    function createState({prevState, voice, rate, pitch, groupsToLearn, symbolDelay, dashDuration}) {
        function firstDefined(value, attrName, defVal) {
            return value !== undefined ? value : (prevState ? prevState[attrName] : defVal)
        }

        groupsToLearn = firstDefined(groupsToLearn, GROUPS_TO_LEARN, [0])

        const allowedIndexes = groupsToLearn
            .flatMap(g => ints(g*ELEMS_IN_GROUP_TO_LEARN, (g+1)*ELEMS_IN_GROUP_TO_LEARN-1))
        return {
            [VOICE]: voice,
            [VOICE_OBJ]: getVoice(voice),
            [RATE]: firstDefined(rate, RATE, 1),
            [PITCH]: firstDefined(pitch, PITCH, 1),
            [GROUPS_TO_LEARN]: groupsToLearn,
            [RND]: randomElemSelector({
                allElems:MORSE.filter((e,i) => allowedIndexes.includes(i))
            }),
            [SYMBOL_DELAY]:firstDefined(symbolDelay, SYMBOL_DELAY, 800),
            [DASH_DURATION]:firstDefined(dashDuration, DASH_DURATION, 200),
        }
    }

    function getVoice(voiceUri) {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
            const foundVoices = voices.filter(v => voiceUri && v.voiceURI==voiceUri || !voiceUri && v.default)
            if (foundVoices.length > 0) {
                return foundVoices[0]
            }
        }
    }

    function updateStateFromSettings(writeSettingsToLocalStorage, settings) {
        setState(old => createState({
            prevState:old,
            voice: settings[VOICE],
            rate: settings[RATE],
            pitch: settings[PITCH],
            groupsToLearn: settings[GROUPS_TO_LEARN],
            symbolDelay: settings[SYMBOL_DELAY],
            dashDuration: settings[DASH_DURATION],
        }))
        if (writeSettingsToLocalStorage) {
            saveSettingsToLocalStorage(
                {settings:settings, attrsToSave:ATTRS_TO_SAVE_TO_LOC_STORAGE, localStorageKey: LOCAL_STORAGE_KEY}
            )
        }
    }

    function openCloseSettingsDialog(opened) {
        if (opened) {
            setSettings(state)
        } else {
            setSettings(null)
        }
    }

    function renderSettings() {
        if (settings) {
            return RE.Dialog({fullScreen:true, open:true},
                RE.AppBar({},
                    RE.Toolbar({},
                        RE.Button({
                                edge:"start",
                                variant:"contained",
                                onClick: () => openCloseSettingsDialog(false),
                                style: {marginRight: "20px"}},
                            "Close"
                        ),
                        RE.Button({
                                variant:"contained",
                                onClick: () => {
                                    updateStateFromSettings(true, settings)
                                    openCloseSettingsDialog(false)
                                },
                            },
                            "Save"
                        ),
                    )
                ),
                RE.table({style:{marginTop:"80px"}},
                    RE.tbody({},
                        RE.tr({},
                            RE.td({},"Voice"),
                            RE.td({},
                                RE.Select({
                                        value:settings[VOICE],
                                        onChange: event => {
                                            const newValue = event.target.value;
                                            setSettings(old => set(old, VOICE, newValue))
                                        },
                                    },
                                    window.speechSynthesis.getVoices().map(voice => RE.MenuItem(
                                        {key: voice.voiceURI, value:voice.voiceURI, },
                                        voice.name
                                    ))
                                )
                            ),
                        ),
                        RE.tr({},
                            RE.td({},"Rate"),
                            RE.td({},
                                RE.Container.col.top.left({},{},
                                    settings[RATE],
                                    renderSlider({min:0.1, max:10, step: 0.1, value:settings[RATE],
                                        setValue: newValue => setSettings(old => set(old, RATE, newValue))})
                                )
                            ),
                        ),
                        RE.tr({},
                            RE.td({},"Pitch"),
                            RE.td({},
                                RE.Container.col.top.left({},{},
                                    settings[PITCH],
                                    renderSlider({min:0, max:2, step: 0.1, value:settings[PITCH],
                                        setValue: newValue => setSettings(old => set(old, PITCH, newValue))})
                                )
                            ),
                        ),
                        RE.tr({},
                            RE.td({},"Groups to learn"),
                            RE.td({},
                                renderGroupsToLearnCheckboxes()
                            ),
                        ),
                        RE.tr({},
                            RE.td({},"Symbol delay"),
                            RE.td({},
                                RE.Container.col.top.left({},{},
                                    settings[SYMBOL_DELAY],
                                    renderSlider({min:300, max:2000, step: 100, value:settings[SYMBOL_DELAY],
                                        setValue: newValue => setSettings(old => set(old, SYMBOL_DELAY, newValue))})
                                )
                            ),
                        ),
                        RE.tr({},
                            RE.td({},"Dash duration"),
                            RE.td({},
                                RE.Container.col.top.left({},{},
                                    settings[DASH_DURATION],
                                    renderSlider({min:50, max:500, step: 50, value:settings[DASH_DURATION],
                                        setValue: newValue => setSettings(old => set(old, DASH_DURATION, newValue))})
                                )
                            ),
                        ),
                    )
                )
            )
        } else {
            return null
        }
    }

    function renderGroupsToLearnCheckboxes() {
        return RE.Fragment({},
            ints(0, Math.ceil(MORSE.length/ELEMS_IN_GROUP_TO_LEARN)-1).map(renderGroupToLearnCheckbox)
        )
    }

    function renderGroupToLearnCheckbox(number) {
        return RE.FormControlLabel({
            key:number,
            label:number,
            control:RE.Checkbox({
                checked:settings[GROUPS_TO_LEARN].includes(number),
                onChange: () => setSettings(old => checkGroupToLearn(old, number))
            })
        })
    }

    function checkGroupToLearn(settings, groupNum) {
        const groupsToLearn = settings[GROUPS_TO_LEARN];
        if (groupsToLearn.includes(groupNum)) {
            settings = set(settings, GROUPS_TO_LEARN, groupsToLearn.filter(n => n!==groupNum))
        } else {
            settings = set(settings, GROUPS_TO_LEARN, [...groupsToLearn, groupNum])
        }
        if (settings[GROUPS_TO_LEARN].length == 0) {
            settings = set(settings, groupsToLearn, groupsToLearn)
        }
        return settings
    }

    function renderSlider({min, max, step, value, setValue}) {
        return RE.div({style:{width:"200px"}},
            RE.Slider({
                value:value,
                onChange: (event, newValue) => setValue(newValue),
                step:step,
                min:min,
                max:max
            })
        )
    }

    return RE.Fragment({},
        RE.Button({onClick: () => openCloseSettingsDialog(true)}, "Settings"),
        RE.Button({onClick: () => console.log(state)}, "Show state"),
        RE.div({ref:inputView}),
        RE.div({
            ref: touchDiv,
            style:{width: "350px", height:"550px", backgroundColor:"black"},
            onTouchStart: onMouseDown, onTouchEnd: onMouseUp,
        }),
        renderSettings()
    )
}