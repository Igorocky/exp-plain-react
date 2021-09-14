"use strict";

let GAMEPAD_BUTTONS = null
let GAMEPAD_AXES = null
let GAMEPAD_STATE_CHANGE_LISTENER = null
const GAMEPAD_BUTTON_X = 3
const GAMEPAD_BUTTON_Y = 4
const GAMEPAD_BUTTON_A = 0
const GAMEPAD_BUTTON_B = 1
const GAMEPAD_BUTTON_SELECT = 10
const GAMEPAD_BUTTON_START = 11
const GAMEPAD_BUTTON_LEFT = 100
const GAMEPAD_BUTTON_RIGHT = 101
const GAMEPAD_BUTTON_UP = 102
const GAMEPAD_BUTTON_DOWN = 103
const GAMEPAD_BUTTON_LEFT_SHIFT = 6
const GAMEPAD_BUTTON_RIGHT_SHIFT = 7
const AudioCellsExercise = () => {
    const s = {
        PHASE: 'PHASE',
        CURR_CARD: 'CURR_CARD',
        CARD_COUNTS: 'CARD_COUNTS',
        DOT_DURATION: 'DOT_DURATION',
        ALL_CARDS: 'ALL_CARDS',
        WAKEUP_TIMEOUT_HANDLE: 'WAKEUP_TIMEOUT_HANDLE',
    }

    const [state, setState] = useState(() => createNewState({}))

    function createNewState({prevState, params}) {
        const allCards = createAllCards({})
        const currCard = allCards[randomInt(0,allCards.length-1)]
        return createObj({
            [s.ALL_CARDS]: allCards,
            [s.CURR_CARD]: currCard,
            [s.CARD_COUNTS]: inc(new Array(allCards.length).fill(0), currCard.idx),
        })
    }

    function createAllCards({}) {
        return prod(
            ints(0,7),
            ints(0,7)
        ).map(([x,y], i) => ({x,y,idx:i}))
    }

    function sayCard(card) {
        const {x,y} = card
        playAudio(xCoordToStr(x) + '.mp3', () => playAudio(yCoordToStr(y) + '.mp3'))
        console.log('card', card)
    }

    function onUserInput(symOrCode) {
        const allowedButtonPressedSound = 'on-next.mp3'
        setState(state => {
            const st = objectHolder(state)

            if ('5' === symOrCode) {
                playAudio(allowedButtonPressedSound, () => sayCard(st.get(s.CURR_CARD)))
            } else if ('4' === symOrCode) {
                const nextCard = nextRandomElem({allElems: st.get(s.ALL_CARDS), counts: st.get(s.CARD_COUNTS)});
                st.set(s.CURR_CARD, nextCard)
                st.set(s.CARD_COUNTS, inc(st.get(s.CARD_COUNTS), st.get(s.CURR_CARD).idx))
                playAudio(ENTER_SOUND, () => window.setTimeout(() => sayCard(nextCard), 0))
            } else {
                playAudio(ERROR_SOUND)
            }

            if (hasValue(st.get(s.WAKEUP_TIMEOUT_HANDLE))) {
                clearTimeout(st.get(s.WAKEUP_TIMEOUT_HANDLE))
            }
            st.set(s.WAKEUP_TIMEOUT_HANDLE, setTimeout(() => playAudio('on-go-to-start3.mp3'), 3.5*60*1000))

            return st.get()
        })
    }

    function renderStatistics() {
        return `numOfCards=${state[s.CARD_COUNTS].sum()}, minCnt=${state[s.CARD_COUNTS].min()}, maxCnt=${state[s.CARD_COUNTS].max()}`
    }

    function xCoordToStr(x) {
        return String.fromCharCode(x + 97)
    }

    function yCoordToStr(y) {
        return String.fromCharCode((y + 1) + 48)
    }

    function renderCurrCell() {
        const {x,y} = state[s.CURR_CARD]
        return RE.span({style:{fontSize:'30px'}}, xCoordToStr(x).toUpperCase()+yCoordToStr(y))
    }

    GAMEPAD_STATE_CHANGE_LISTENER = ({button,pressed}) => {
        if (pressed) {
            if (button == GAMEPAD_BUTTON_START) {
                playAudio('on-enter.mp3')
            } else {
                onUserInput(
                    button == GAMEPAD_BUTTON_RIGHT ? '5'
                        : button == GAMEPAD_BUTTON_UP ? '4'
                            : '3'
                )
            }
        }
    }

    function readGamepadState() {
        const gamepads = navigator.getGamepads()
        let gamepad = null
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]?.id == 'Bluetooth Wireless Controller (Vendor: 05a0 Product: 3232)') {
                gamepad = gamepads[i]
            }
        }
        if (!gamepad?.connected) {
            GAMEPAD_BUTTONS = null
            GAMEPAD_AXES = null
            return
        } else if (!GAMEPAD_BUTTONS) {
            console.log('connected')
            GAMEPAD_BUTTONS = gamepad.buttons
            GAMEPAD_AXES = gamepad.axes
            return
        } else {
            const gamepadButtons = gamepad.buttons
            let events = []
            function addEvent({button,pressed}) {
                events.push({button,pressed})
            }
            for (let i = 0; i < gamepadButtons.length; i++) {
                let buttonNumber = null
                let pressed = null
                if (!GAMEPAD_BUTTONS[i].pressed && gamepadButtons[i].pressed) {
                    buttonNumber = i
                    pressed = true
                } else if (GAMEPAD_BUTTONS[i].pressed && !gamepadButtons[i].pressed) {
                    buttonNumber = i
                    pressed = false
                }
                if (hasValue(buttonNumber)) {
                    console.log(`Button ${buttonNumber} was ${pressed?'pressed':'released'}.`)
                    addEvent({button:buttonNumber,pressed})
                }
            }
            GAMEPAD_BUTTONS = gamepad.buttons

            const gamepadAxes = gamepad.axes
            for (let i = 0; i < gamepadAxes.length; i++) {
                if (Math.abs(GAMEPAD_AXES[i] - gamepadAxes[i]) > 0.5) {
                    const value = gamepadAxes[i]
                    const delta = gamepadAxes[i] - GAMEPAD_AXES[i]
                    const pressed = Math.abs(value) > 0.5
                    const buttonNumber = 100 + i*2 + (pressed ? (delta < 0 ? 0 : 1) : (delta > 0 ? 0 : 1))
                    console.log(`Button ${buttonNumber} was ${pressed?'pressed':'released'}.`)
                    addEvent({button:buttonNumber,pressed})
                }
            }
            GAMEPAD_AXES = gamepad.axes

            if (GAMEPAD_STATE_CHANGE_LISTENER) {
                for (let event of events) {
                    GAMEPAD_STATE_CHANGE_LISTENER(event)
                }
            }
        }
    }

    function connectGamepad() {
        window.setInterval(
            readGamepadState,
            30
        )
    }

    return RE.Container.col.top.center({style:{marginTop:'0px'}},{style:{marginTop:'15px'}},
        RE.TextField({
            value: '',
            variant: "outlined",
            autoFocus:true,
            onChange: e => {
                const newValue = e.nativeEvent.target.value
                onUserInput(newValue)
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
        renderCurrCell(),
        renderStatistics(),
        RE.Button({onClick: connectGamepad, style:{color:'white'}}, 'Connect game pad'),
    )
}