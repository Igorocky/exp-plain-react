"use strict";

const UseMorseInput = ({style, onSymbol, onUnrecognizedCode}) => {

    const s = {
        CODE: 'CODE',
        TIMINGS: 'TIMINGS',
        TIMEOUT: 'TIMEOUT',
    }

    const [state, setState] = useState(() => createObj({
        [s.CODE]: '',
        [s.TIMINGS]: [],
    }))

    function onDashDot(dashOrDot) {
        setState(state => nextStateOnDashDot({state, dashOrDot, onSymbol, onUnrecognizedCode}))
    }

    function nextStateOnDashDot({state, dashOrDot, onSymbol, onUnrecognizedCode}) {
        const st = objectHolder(state)

        st.set(s.CODE, st.get(s.CODE) + dashOrDot)
        st.set(s.TIMINGS, [...st.get(s.TIMINGS), getCurrentTime(), dashOrDot])
        let timeout
        timeout = window.setTimeout(
            () => clearCode({
                timeout: () => timeout,
                onSymbol,
                onUnrecognizedCode
            }),
            500
        )
        st.set(s.TIMEOUT, timeout)


        return st.get()
    }

    function clearCode({timeout, onSymbol, onUnrecognizedCode}) {
        setState(state => nextStateOnClearCode({state, timeout, onSymbol, onUnrecognizedCode}))
    }

    function nextStateOnClearCode({timeout, state, onSymbol, onUnrecognizedCode}) {
        if (timeout() === state[s.TIMEOUT]) {
            const st = objectHolder(state)

            const code = st.get(s.CODE)
            const sym = MORSE_MAP_CODE[code]?.sym
            if (!sym) {
                onUnrecognizedCode(code, st.get(s.TIMINGS))
            } else {
                onSymbol(sym, st.get(s.TIMINGS))
            }
            st.set(s.CODE, '')
            st.set(s.TIMEOUT, null)
            st.set(s.TIMINGS, [])

            return st.get()
        } else {
            return state
        }
    }

    function getCurrentTime() {
        return new Date().getTime()
    }

    return {
        renderMorseInputDiv: () => RE.div({
            style: {width: '100px', height: '100px', backgroundColor: 'black'},
            onMouseDown: clickEvent => onDashDot(clickEvent.nativeEvent.button == 0 ? '.' : '-'),
        })
    }
}