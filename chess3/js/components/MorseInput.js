"use strict";

const MorseInput = ({style, onSymbol, onUnrecognizedCode}) => {

    const s = {
        CODE: 'CODE',
        TIMINGS: 'TIMINGS',
    }

    const [state, setState] = useState(() => createObj({
        [s.CODE]: '',
        [s.TIMINGS]: [],
    }))

    const timeout = useRef(null)

    function onDashDot(dashOrDot) {
        if (timeout.current) {
            window.clearTimeout(timeout.current)
            timeout.current = null
        }
        setState(state => {
            const st = objectHolder(state)

            st.set(s.CODE, st.get(s.CODE) + dashOrDot)
            st.set(s.TIMINGS, [...st.get(s.TIMINGS), getCurrentTime(), dashOrDot])
            timeout.current = window.setTimeout(sendUserInput, 500)

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


    function getCurrentTime() {
        return new Date().getTime()
    }

    return RE.div({
        style: {width: '100px', height: '100px', backgroundColor: 'black'},
        onMouseDown: clickEvent => onDashDot(clickEvent.nativeEvent.button == 0 ? '.' : '-'),
    })
}