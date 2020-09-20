"use strict";

const MorseInput = ({style, onSymbol, onUnrecognizedCode, onEnter}) => {

    const s = {
        CODE: 'CODE',
        TIMINGS: 'TIMINGS',
    }

    const [state, setState] = useState(() => createObj({
        [s.CODE]: '',
        [s.TIMINGS]: [],
    }))

    const timeout = useRef(null)

    function clearTimeout() {
        if (timeout.current) {
            window.clearTimeout(timeout.current)
            timeout.current = null
        }
    }

    function onDashDot(dashOrDot) {
        clearTimeout()
        setState(state => {
            const st = objectHolder(state)

            st.set(s.CODE, st.get(s.CODE) + dashOrDot)
            st.set(s.TIMINGS, [...st.get(s.TIMINGS), getCurrentTime(), dashOrDot])
            timeout.current = window.setTimeout(sendUserInput, 700)

            return st.get()
        })
    }

    function sendUserInput() {
        setState(state => {
            const st = objectHolder(state)

            const code = st.get(s.CODE)
            const sym = MORSE_MAP_CODE[code]?.sym
            if (!sym) {
                onUnrecognizedCode(code, st.get(s.TIMINGS))
            } else {
                onSymbol(sym, st.get(s.TIMINGS))
            }
            st.set(s.CODE, '')
            st.set(s.TIMINGS, [])

            return st.get()
        })
    }

    function runOnEnter() {
        clearTimeout()
        setState(state => {
            const st = objectHolder(state)

            st.set(s.CODE, '')
            st.set(s.TIMINGS, [])
            onEnter()

            return st.get()
        })
    }


    function getCurrentTime() {
        return new Date().getTime()
    }

    return RE.div({
        style: {width: '100px', height: '100px', backgroundColor: 'black'},
        onMouseDown: clickEvent => {
            const nativeEvent = clickEvent.nativeEvent;
            if (nativeEvent.buttons == 3 && onEnter) {
                runOnEnter()
            } else {
                onDashDot(nativeEvent.button == 0 ? '.' : '-')
            }
        },
    })
}