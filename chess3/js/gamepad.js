"use strict";

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
let GAMEPAD_BUTTONS = null
let GAMEPAD_AXES = null
let GAMEPAD_STATE_CHANGE_LISTENER = null

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