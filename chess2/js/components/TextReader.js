"use strict";

const TextReader = ({}) => {
    const LOCAL_STORAGE_KEY = "TextReader.settings"
    const VOICE_URI = "VOICE_URI"
    const VOICE_OBJ = "VOICE_OBJ"
    const RATE = "RATE"
    const PITCH = "PITCH"
    const VOLUME = "VOLUME"
    const TEXT_TO_READ = "TEXT_TO_READ"

    const ATTRS_TO_SAVE_TO_LOC_STORAGE = [VOICE_URI, RATE, PITCH, VOLUME]

    const [state, setState] = useState(() => createState({}))

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

        const voiceObj = getVoiceObj(firstDefined(VOICE_URI))
        return {
            [VOICE_URI]: voiceObj?voiceObj.voiceURI:null,
            [VOICE_OBJ]: voiceObj,
            [RATE]: firstDefined(RATE, 1),
            [PITCH]: firstDefined(PITCH, 1),
            [VOLUME]: firstDefined(VOLUME, 1),
            [TEXT_TO_READ]: firstDefined(TEXT_TO_READ, ""),
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

    function saveSettingsToLocalStorageInner(state) {
        saveSettingsToLocalStorage({
            settings:state, localStorageKey:LOCAL_STORAGE_KEY, attrsToSave:ATTRS_TO_SAVE_TO_LOC_STORAGE
        })
    }

    function renderSettings() {
        return RE.table({style:{}},
            RE.tbody({},
                RE.tr({},
                    RE.td({},"Voice"),
                    RE.td({},
                        RE.Select({
                                value:state[VOICE_OBJ]?state[VOICE_OBJ].voiceURI:"None",
                                onChange: event => {
                                    const newValue = event.target.value
                                    setState(old => {
                                        const newState = createState({prevState:old, newState:{[VOICE_URI]:newValue}})
                                        saveSettingsToLocalStorageInner(newState)
                                        return newState
                                    })
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
                            state[RATE],
                            renderSlider({min:0.1, max:10, step: 0.1, value:state[RATE],
                                setValue: newValue => setState(old => {
                                    const newState = set(old, RATE, newValue)
                                    saveSettingsToLocalStorageInner(newState)
                                    return newState
                                })})
                        )
                    ),
                ),
                RE.tr({},
                    RE.td({},"Pitch"),
                    RE.td({},
                        RE.Container.col.top.left({},{},
                            state[PITCH],
                            renderSlider({min:0, max:2, step: 0.1, value:state[PITCH],
                                setValue: newValue => {setState(old => {
                                    const newState = set(old, PITCH, newValue)
                                    saveSettingsToLocalStorageInner(newState)
                                    return newState
                                })}})
                        )
                    ),
                ),
                RE.tr({},
                    RE.td({},"Volume"),
                    RE.td({},
                        RE.Container.col.top.left({},{},
                            state[VOLUME],
                            renderSlider({min:0, max:1, step: 0.1, value:state[VOLUME],
                                setValue: newValue => setState(old => {
                                    const newState = set(old, VOLUME, newValue)
                                    saveSettingsToLocalStorageInner(newState)
                                    return newState
                                })})
                        )
                    ),
                ),
            )
        )
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

    return RE.Container.col.top.left({},{style:{marginBottom:"30px"}},
        RE.TextField({
            value: state[TEXT_TO_READ],
            variant: "outlined",
            onChange: e => {
                const newValue = e.target.value
                setState(old => set(old, TEXT_TO_READ, newValue))
            },
            style: {
                borderRadius: "5px",
                width: "400px"
            },
            onKeyUp: e => {
                if (e.keyCode == ENTER_KEY_CODE){
                    say(state[TEXT_TO_READ])
                }
            }
        }),
        renderSettings()
    )
}