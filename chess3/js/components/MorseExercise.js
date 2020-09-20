"use strict";

const MorseExercise = () => {

    const s = {
        AUDIO_CONTEXT: 'AUDIO_CONTEXT',
        OSCILLATOR: 'OSCILLATOR',
        GAIN_NODE: 'GAIN_NODE',
        PHRASE_TIME: 'PHRASE_TIME',
    }

    const [state, setState] = useState(() => createState())
    const [text, setText] = useState('')

    function createState() {
        return createObj({
            [s.PHRASE_TIME]: 0
        })
    }

    function outputMorse(text) {
        setState(state => scheduleMorseSound({state, dashDots:textToDashDots(text)}))
    }

    function textToDashDots(text) {
        const words = (text?.toUpperCase()??'').trim().split(/\s+/)
        return words.flatMap(word =>
            [
                ...word.split('').flatMap(c =>
                    [...MORSE_MAP[c].code.split(''),' ']
                )
                ,' '
                ,' '
            ]
        )
    }

    function scheduleMorseSound({dashDots,state}) {
        console.log({dashDots:dashDots.join('')})
        const dotDuration = 0.05
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
            st.set(s.PHRASE_TIME, audioContext.currentTime)
        }

        const gain = st.get(s.GAIN_NODE).gain
        let time = Math.max(st.get(s.PHRASE_TIME), st.get(s.AUDIO_CONTEXT).currentTime)
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
        st.set(s.PHRASE_TIME, time)

        return st.get()
    }

    return RE.TextField({
        value: text,
        autoFocus: true,
        variant: "outlined",
        onChange: e => setText(e.target.value),
        style: {
            borderRadius: "5px",
            width: "400px"
        },
        onKeyUp: e => {
            if (e.keyCode == ENTER_KEY_CODE){
                console.log({text})
                outputMorse(text)
            }
        }
    })
}