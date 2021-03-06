"use strict";

const MorseStateViewExplorer = ({nextActionDescr, onNextActionDescrSaid, data, commands}) => {
    const LOCAL_STORAGE_KEY = "MorseStateViewExplorer.settings"
    const VOICE_URI = "VOICE_URI"
    const VOICE_OBJ = "VOICE_OBJ"
    const RATE = "RATE"
    const PITCH = "PITCH"
    const VOLUME = "VOLUME"
    const SYMBOL_DELAY = "SYMBOL_DELAY"
    const DOT_DURATION = "DOT_DURATION"

    const ARRAY_TO_READ = "ARRAY_TO_READ"
    const ARRAY_IDX_TO_READ = "ARRAY_IDX_TO_READ"

    const ATTRS_TO_SAVE_TO_LOC_STORAGE = [VOICE_URI, RATE, PITCH, VOLUME, SYMBOL_DELAY, DOT_DURATION]

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

    useEffect(() => {
        if (nextActionDescr && state[VOICE_OBJ]) {
            say(nextActionDescr, onNextActionDescrSaid)
        }
    }, [nextActionDescr, state[VOICE_OBJ]])

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

        const voiceUri = firstDefined(VOICE_URI)
        return {
            [VOICE_URI]: voiceUri,
            [VOICE_OBJ]: getVoiceObj(voiceUri),
            [RATE]: firstDefined(RATE, 1),
            [PITCH]: firstDefined(PITCH, 1),
            [VOLUME]: firstDefined(VOLUME, 1),
            [SYMBOL_DELAY]:firstDefined(SYMBOL_DELAY, 500),
            [DOT_DURATION]:firstDefined(DOT_DURATION, 150),
        }
    }

    function say(text, onend) {
        const msg = new SpeechSynthesisUtterance()
        msg.voice = state[VOICE_OBJ]
        msg.rate = state[RATE]
        msg.pitch = state[PITCH]
        msg.volume = state[VOLUME]
        msg.text = text
        msg.lang = "en"
        msg.onend = onend
        speechSynthesis.speak(msg);
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
                        )
                    )
                )
            )
        } else {
            return null
        }
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
        re(MorseCommandInput, {
            say:say,
            dotDuration: state[DOT_DURATION],
            symbolDelay: state[SYMBOL_DELAY],
            onCommandEntered: command => console.log(command),
            settingsBtnClicked: () => openCloseSettingsDialog(true),
            viewStateBtnClicked: () => console.log(state)
        }),
        renderSettings()
    )
}