"use strict";

const MorseExercise = ({}) => {
    const LOCAL_STORAGE_KEY = "MorseExercise.settings"
    const VOICE_URI = "VOICE_URI"
    const VOICE_OBJ = "VOICE_OBJ"
    const RATE = "RATE"
    const PITCH = "PITCH"
    const VOLUME = "VOLUME"
    const GROUPS_TO_LEARN = "GROUPS_TO_LEARN"
    const RND = "RND"
    const SYMBOL_DELAY = "SYMBOL_DELAY"
    const DOT_DURATION = "DOT_DURATION"

    const ATTRS_TO_SAVE_TO_LOC_STORAGE = [VOICE_URI, RATE, PITCH, VOLUME, GROUPS_TO_LEARN, SYMBOL_DELAY, DOT_DURATION]
    const ELEMS_IN_GROUP_TO_LEARN = 5

    const [state, setState] = useState(() => createState({}))
    const [settings, setSettings] = useState(null)

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
        window.speechSynthesis.onvoiceschanged = () => setState(old => createState({prevState:old}))
    }, [])

    function checkSymbol(symbols) {
        if (symbols[symbols.length-1].symbol != state[RND].currentElem.sym) {
            if (symbols.length <= 2) {
                say("Incorrect.")
                say(state[RND].currentElem.word)
            } else {
                sayCode(MORSE.find(e => e.sym == state[RND].currentElem.sym).code)
                say(state[RND].currentElem.word)
            }
            return symbols
        } else {
            setState(old => {
                const newState = set(old, RND, old[RND].next())
                say(newState[RND].currentElem.word)
                return newState
            })
            return [symbols[symbols.length-1]]
        }
    }

    function sayCode(code) {
        say(code.split('').map(s => s == "." ? "dot" : "dash").join(", "))
    }

    function say(text) {
        var msg = new SpeechSynthesisUtterance();
        msg.voice = state[VOICE_OBJ]
        msg.rate = state[RATE]
        msg.pitch = state[PITCH]
        msg.volume = state[VOLUME]
        msg.text = text
        msg.lang = "en"
        speechSynthesis.speak(msg);
    }

    function createState({prevState, newState}) {
        function firstDefined(attrName, defVal) {
            const newValue = newState ? newState[attrName] : undefined
            if (newValue !== undefined) {
                return newValue
            }
            const oldValue = prevState ? prevState[attrName] : undefined
            if (oldValue !== undefined) {
                return oldValue
            }
            return defVal
        }

        const groupsToLearn = firstDefined(GROUPS_TO_LEARN, [0])

        const allowedIndexes = groupsToLearn
            .flatMap(g => ints(g*ELEMS_IN_GROUP_TO_LEARN, (g+1)*ELEMS_IN_GROUP_TO_LEARN-1))
        const voiceUri = firstDefined(VOICE_URI);
        return {
            [VOICE_URI]: voiceUri,
            [VOICE_OBJ]: getVoiceObj(voiceUri),
            [RATE]: firstDefined(RATE, 1),
            [PITCH]: firstDefined(PITCH, 1),
            [VOLUME]: firstDefined(VOLUME, 1),
            [GROUPS_TO_LEARN]: groupsToLearn,
            [RND]: randomElemSelector({
                allElems:MORSE.filter((e,i) => allowedIndexes.includes(i))
            }),
            [SYMBOL_DELAY]:firstDefined(SYMBOL_DELAY, 800),
            [DOT_DURATION]:firstDefined(DOT_DURATION, 150),
        }
    }

    function getVoiceObj(voiceUri) {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length) {
            return voices.find(v => voiceUri && v.voiceURI == voiceUri || !voiceUri && v.default)
        }
    }

    function updateStateFromSettings(writeSettingsToLocalStorage, settings) {
        setState(old => createState({prevState:old, newState: settings}))
        if (writeSettingsToLocalStorage) {
            saveSettingsToLocalStorage(
                {settings:settings, attrsToSave:ATTRS_TO_SAVE_TO_LOC_STORAGE, localStorageKey: LOCAL_STORAGE_KEY}
            )
        }
    }

    function openCloseSettingsDialog(opened) {
        if (opened) {
            setSettings({...state})
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
                            RE.td({},"Dot duration"),
                            RE.td({},
                                RE.Container.col.top.left({},{},
                                    settings[DOT_DURATION],
                                    renderSlider({min:50, max:500, step: 25, value:settings[DOT_DURATION],
                                        setValue: newValue => setSettings(old => set(old, DOT_DURATION, newValue))})
                                )
                            ),
                        ),
                        RE.tr({},
                            RE.td({},"Symbol delay"),
                            RE.td({},
                                RE.Container.col.top.left({},{},
                                    settings[SYMBOL_DELAY],
                                    renderSlider({min:50, max:2000, step: 50, value:settings[SYMBOL_DELAY],
                                        setValue: newValue => setSettings(old => set(old, SYMBOL_DELAY, newValue))})
                                )
                            ),
                        ),
                        RE.tr({},
                            RE.td({},"Voice"),
                            RE.td({},
                                RE.Select({
                                        value:settings[VOICE_URI]?settings[VOICE_URI]:"Undefined",
                                        onChange: event => {
                                            const newValue = event.target.value;
                                            setSettings(old => set(old, VOICE_URI, newValue))
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
                            RE.td({},"Volume"),
                            RE.td({},
                                RE.Container.col.top.left({},{},
                                    settings[VOLUME],
                                    renderSlider({min:0, max:1, step: 0.1, value:settings[VOLUME],
                                        setValue: newValue => setSettings(old => set(old, VOLUME, newValue))})
                                )
                            ),
                        ),
                        RE.tr({},
                            RE.td({},"Groups to learn"),
                            RE.td({},
                                renderGroupsToLearnCheckboxes()
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
        return RE.div({style:{width:"280px"}},
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
        RE.div({},
            state[RND].currentElem.sym
            + " Iteration: " + state[RND].iterationNumber
            + ", Remains: " + state[RND].remainingElems.length
        ),
        re(MorseTouchDiv, {
            dotDuration: state[DOT_DURATION],
            symbolDelay: state[SYMBOL_DELAY],
            onSymbolsChange: symbols => checkSymbol(symbols),
            settingsBtnClicked: () => openCloseSettingsDialog(true),
            viewStateBtnClicked: () => console.log(state)
        }),
        renderSettings()
    )
}