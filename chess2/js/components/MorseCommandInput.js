"use strict";

const MorseCommandInput = ({say, dotDuration, symbolDelay, onCommandEntered,
                               settingsBtnClicked, viewStateBtnClicked}) => {

    function onSymbolsChanged(symbols) {
        if (symbols.length) {
            const last = symbols[symbols.length-1]
            if (last.codeInfo.sym == "error") {
                symbols.pop()
                if (symbols.length) {
                    symbols.pop()
                }
                say("Backspace")
                console.log("symbols")
                console.log(symbols)
                return symbols
            } else if (last.codeInfo.sym == "\"") {
                symbols.pop()
                const commandStr = symbols.map(s => s.codeInfo.sym).reduce((m, e) => m + e, "").toLowerCase()
                if (commandStr == "") {
                    say("No command was entered.")
                } else {
                    say("Command is. " + commandStr)
                }
                return symbols
            } else if (last.codeInfo.sym == "$") {
                symbols.pop()
                const commandStr = symbols.map(s => s.codeInfo.word).reduce((m, e) => m + ", " + e, "")
                if (commandStr == "") {
                    say("No command was entered.")
                } else {
                    say("Command is. " + commandStr)
                }
                return symbols
            } else if (last.codeInfo.sym == "start") {
                symbols.pop()
                beep({durationMillis:100,volume:1,type:BEEP_TYPE_SINE,frequencyHz:3000,callback: () => {
                        onCommandEntered(symbols.map(s => s.codeInfo.sym).reduce((m,e) => m + e, "").toLowerCase())
                }})
                return []
            }
            say(last.codeInfo.word)
            return symbols
        }
        return symbols
    }

    return re(MorseTouchDiv, {
        dotDuration: dotDuration,
        symbolDelay: symbolDelay,
        onSymbolsChange: symbols => onSymbolsChanged(symbols),
        settingsBtnClicked: settingsBtnClicked,
        viewStateBtnClicked: viewStateBtnClicked
    })
}