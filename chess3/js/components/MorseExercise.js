"use strict";

const MorseExercise = () => {

    const s = {
        PHASE: 'PHASE',
        CURR_SYM: 'CURR_SYM',
        USER_SYM_CORRECT: 'USER_SYM_CORRECT',
        USER_INPUT_DATA: 'USER_INPUT_DATA',
        SYM_COUNTS: 'SYM_COUNTS',
    }

    const p = {
        QUESTION: 'QUESTION',
        ANSWER: 'ANSWER',
    }

    const groupNum = 0
    const groupSize = 5
    const ALL_SYM = useMemo(() =>
        ints(groupNum*groupSize,(groupNum+1)*groupSize-(groupNum != 6 ? 1 : 0))
            .map(idx => MORSE_ARR[idx])
            .filter(e => e)
            .map((e,idx) => ({...e, idx}))
    )
    useEffect(() => {
        console.log({ALL_SYM:ALL_SYM.map(e => e.sym).join(',')})
    }, ALL_SYM[0].sym)

    const [state, setState] = useState(() => createState())

    const {speak, renderVoiceSelector} = useSpeechComponent()

    function createState() {
        const currSym = ALL_SYM[randomInt(0,ALL_SYM.length-1)];
        return createObj({
            [s.CURR_SYM]: currSym,
            [s.SYM_COUNTS]: inc(new Array(ALL_SYM.length).fill(0), currSym.idx),
            [s.USER_SYM_CORRECT]: null,
            [s.PHASE]: p.QUESTION,
        })
    }

    function onUserInput(symOrCode, timings) {
        setState(state => {
            const st = objectHolder(state)

            if (symOrCode === st.get(s.CURR_SYM).sym) {
                st.set(s.USER_INPUT_DATA, null)
                st.set(s.USER_SYM_CORRECT, null)
                st.set(s.CURR_SYM, nextRandomElem({allElems:ALL_SYM,counts:st.get(s.SYM_COUNTS)}))
                st.set(s.SYM_COUNTS, inc(st.get(s.SYM_COUNTS), st.get(s.CURR_SYM).idx))
                speak(st.get(s.CURR_SYM).word)
            } else {
                playAudio(ERROR_SOUND, () => speak(st.get(s.CURR_SYM).word))
                st.set(s.USER_INPUT_DATA, {symOrCode, timings})
                st.set(s.USER_SYM_CORRECT, false)
            }

            return st.get()
        })
    }

    function timingsToStr(timings) {

        function appendTiming(a,t) {
            if (typeof t === 'string') {
                return {...a, str:a.str+t}
            } else if (a.lastTime) {
                return {...a, str:a.str+(t - a.lastTime), lastTime: t}
            } else {
                return {...a, lastTime: t}
            }
        }

        return timings.reduce(appendTiming,{str:'',lastTime:null}).str
    }

    function printUserInputData() {
        if (state[s.USER_INPUT_DATA]) {
            const inputData = state[s.USER_INPUT_DATA]
            return RE.div(
                {style: {fontSize: '15px', color: 'red'}},
                `${inputData.symOrCode} [${timingsToStr(inputData.timings)}]`
            )
        }
    }

    return RE.Container.col.top.center({style:{marginTop:'300px'}},{},
        renderVoiceSelector(),
        RE.div(
            {style:{fontSize:'60px', color:state[s.USER_SYM_CORRECT] === false?'red':'black'}},
            state[s.CURR_SYM].sym
        ),
        re(MorseInput,{
            onSymbol: (sym,timings) => {
                console.log(`You've entered: ${sym}   [${timingsToStr(timings)}]`)
                // console.trace()
                onUserInput(sym,timings)
            },
            onUnrecognizedCode: (code,timings) => {
                console.log(`Unrecognized code: ${code}   [${timingsToStr(timings)}]`)
                onUserInput(code,timings)
            },
        }),
        printUserInputData()
    )
}