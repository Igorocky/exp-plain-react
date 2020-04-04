"use strict";

const MorseTouchDiv = ({dotDuration, symbolDelay, onSymbolsChange}) => {
    const inputEvents = useRef([])
    const inputSymbols = useRef([])
    const touchDivRef = useRef(null)
    const timeout = useRef(null)

    function getCurrentTime() {
        return new Date().getTime()
    }

    function getLastInputEvent() {
        const inputEventsArr = inputEvents.current
        if (inputEventsArr.length) {
            return inputEventsArr[inputEventsArr.length-1]
        }
    }

    function onTouchStart() {
        const curTime = getCurrentTime()
        window.clearTimeout(timeout.current)
        const last = getLastInputEvent()
        if (last && (!last.dur || curTime - last.up > symbolDelay)) {
            inputEvents.current = []
        }
        inputEvents.current.push({down: curTime})
    }

    function onTouchEnd() {
        const curTime = getCurrentTime()
        window.clearTimeout(timeout.current)
        const last = getLastInputEvent()
        if (last) {
            last.dur = curTime - last.down
        }
        timeout.current = window.setTimeout(convertSymbol, symbolDelay)
    }

    function inputEventsToCode() {
        return inputEvents.current
            .map(({dur}) => dur <= dotDuration ? "." : "-")
            .reduce((m,e) => m+e,"")
    }

    function convertSymbol() {
        const currTime = getCurrentTime()
        const code = inputEventsToCode()
        let symbol = MORSE.find(m => m.code == code)
        if (symbol) {
            inputSymbols.current.push({
                events: inputEvents.current,
                time: currTime,
                symbol: symbol.sym
            })
            inputSymbols.current = onSymbolsChange(inputSymbols.current)
        } else {
            beep({durationMillis:100,frequencyHz:200,volume:0.1,type:BEEP_TYPE_SAWTOOTH})
        }
        inputEvents.current = []
        rerenderState()
    }

    function rerenderState() {
        if (touchDivRef.current) {
            touchDivRef.current.innerHTML = inputSymbols.current.map(({events,time,symbol}) =>
                    events.map(({dur}) => dur).reduce((m,e) => m+","+e, "")
                    + "|" + (time - events[events.length-1].dur - events[events.length-1].down)
                    + "|" + symbol
                ).reduce((m,e) => m+"<p/>"+e, "")
        }
    }

    return RE.div({
        ref:touchDivRef,
        style:{width: "350px", height:"550px", backgroundColor:"black", color:"white"},
        onTouchStart: onTouchStart, onTouchEnd: onTouchEnd,
    })
}