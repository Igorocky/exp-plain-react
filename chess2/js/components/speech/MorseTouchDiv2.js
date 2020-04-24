"use strict";

const MorseTouchDiv2 = ({dotDuration, symbolDelay, onSymbolsChange, bgColor, textColor, controls}) => {
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
        let codeInfo = MORSE_ARR.find(m => m.code == code)
        inputSymbols.current.push({
            events: inputEvents.current,
            time: currTime,
            sym: codeInfo?codeInfo.sym:null,
            codeInfo: codeInfo
        })
        if (codeInfo) {
            inputSymbols.current = onSymbolsChange(inputSymbols.current.filter(s => s.sym))
        } else {
            beep({durationMillis:100,frequencyHz:200,volume:0.1,type:BEEP_TYPE_SAWTOOTH})
        }
        inputEvents.current = []
        rerenderState()
    }

    function rerenderState() {
        if (touchDivRef.current) {
            touchDivRef.current.innerHTML = inputSymbols.current.map(({events,time,sym}) =>
                    events.reduce(
                        ({prevUp, str},{down,dur}) => ({str:str + (prevUp?down-prevUp:"")+" ["+dur+"] ", prevUp:down+dur}),
                        {prevUp:null, str:""}
                    ).str
                    + "|" + (time - events[events.length-1].dur - events[events.length-1].down)
                    + "|" + sym
                ).reduce((m,e) => m+"<p/>"+e, "")
        }
    }

    return RE.Container.col.top.left({style:{backgroundColor:bgColor, color:textColor}},{},
        controls,
        RE.div({
            ref:touchDivRef,
            className:"disable-select",
            style:{width: "350px", height:"550px"},
            onTouchStart: onTouchStart, onTouchEnd: onTouchEnd,
        })
    )
}