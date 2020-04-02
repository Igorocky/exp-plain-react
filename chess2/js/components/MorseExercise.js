"use strict";

const MorseExercise = ({}) => {
    const LOCAL_STORAGE_KEY = "MorseExercise.settings"
    const VOICE = "VOICE"
    const VOICE_OBJ = "VOICE_OBJ"
    const RATE = "RATE"
    const PITCH = "PITCH"
    const ATTRS_TO_SAVE_TO_LOC_STORAGE = [VOICE, RATE, PITCH]

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
        window.speechSynthesis.onvoiceschanged = () => {
            setState(old => {
                const voice = getVoice(old[VOICE])
                return createState({prevState:old, voice:voice?voice.voiceURI:old[VOICE]})
            })
        }
    }, [])

    function createState({prevState, voice, rate, pitch}) {
        function firstDefined(value, attrName, defVal) {
            return value !== undefined ? value : (prevState ? prevState[attrName] : defVal)
        }

        return {
            [VOICE]: voice,
            [VOICE_OBJ]: getVoice(voice),
            [RATE]: rate,
            [PITCH]: pitch,
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
                    )
                )
            )
        } else {
            return null
        }
    }

    return RE.Fragment({},
        RE.Button({onClick: () => openCloseSettingsDialog(true)}, "Settings"),
        RE.Button({onClick: () => console.log(state)}, "Show state"),
        renderSettings()
    )
}