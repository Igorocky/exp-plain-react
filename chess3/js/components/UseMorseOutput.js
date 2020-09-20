"use strict";

const useMorseOutput = ({dotDuration}) => {

    const s = {
        AUDIO_CONTEXT: 'AUDIO_CONTEXT',
        OSCILLATOR: 'OSCILLATOR',
        GAIN_NODE: 'GAIN_NODE',
        END_TIME: 'PHRASE_TIME',
    }

    const [state, setState] = useState(() => createObj({}))

    function textToDashDots(text) {
        const words = (text?.toUpperCase()??'').trim().split(/\s+/)
        return words.flatMap(word =>
            [
                ...word.split('').flatMap(c =>
                    [...MORSE_MAP_SYM[c].code.split(''),' ']
                )
                ,' '
                ,' '
            ]
        )
    }

    function scheduleMorseSound({state,dashDots}) {
        const st = objectHolder(state)
        if (!st.get(s.AUDIO_CONTEXT)) {
            const audioContext = new (window.AudioContext??window.webkitAudioContext??window.audioContext)
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.frequency.value = 750
            oscillator.type = SIGNAL_TYPE_SINE
            gainNode.gain.value = 0
            oscillator.start()

            st.set(s.AUDIO_CONTEXT, audioContext)
            st.set(s.OSCILLATOR, oscillator)
            st.set(s.GAIN_NODE, gainNode)
            st.set(s.END_TIME, audioContext.currentTime)
        }

        const gain = st.get(s.GAIN_NODE).gain
        let time = Math.max(st.get(s.END_TIME), st.get(s.AUDIO_CONTEXT).currentTime)
        for (const c of dashDots) {
            if (c == '.') {
                gain.setValueAtTime(1, time)
                gain.setValueAtTime(0, (time += dotDuration))
                time += dotDuration
            } else if (c == '-') {
                gain.setValueAtTime(1, time)
                gain.setValueAtTime(0, (time += dotDuration*3))
                time += dotDuration
            } else if (c == ' ') {
                time += dotDuration*2
            }
        }
        st.set(s.END_TIME, time)

        return st.get()
    }

    return {outputMorse: text => setState(state => scheduleMorseSound({state, dashDots:textToDashDots(text)}))}
}