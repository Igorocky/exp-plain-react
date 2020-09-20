"use strict";

const MorseExercise = () => {

    const s = {
        PHASE: 'PHASE',
        CURR_SYM: 'CURR_SYM',
        USER_SYM_CORRECT: 'USER_SYM_CORRECT',
        USER_INPUT_DATA: 'USER_INPUT_DATA',
        SYM_COUNTS: 'SYM_COUNTS',
        FIRST_SYMBOL_IDX: 'FIRST_SYMBOL_IDX',
        LAST_SYMBOL_IDX: 'LAST_SYMBOL_IDX',
        ALL_SYM: 'ALL_SYM'
    }

    const p = {
        QUESTION: 'QUESTION',
        ANSWER: 'ANSWER',
    }

    const {speak, renderVoiceSelector} = useSpeechComponent()
    const {outputMorse} = useMorseOutput({dotDuration:0.1})

    const [state, setState] = useState(() => createNewState({}))

    function createNewState({prevState, params}) {
        const firstSymbolIdx = params?.[s.FIRST_SYMBOL_IDX]??prevState?.[s.FIRST_SYMBOL_IDX]??0
        const lastSymbolIdx = Math.max(firstSymbolIdx, params?.[s.LAST_SYMBOL_IDX]??prevState?.[s.LAST_SYMBOL_IDX]??MORSE_ARR.length-1)
        const allSymbols = calculateAllSymbols({firstSymbolIdx,lastSymbolIdx})
        const currSym = allSymbols[randomInt(0,allSymbols.length-1)]
        speak(currSym.word)
        return createObj({
            [s.FIRST_SYMBOL_IDX]: firstSymbolIdx,
            [s.LAST_SYMBOL_IDX]: lastSymbolIdx,
            [s.ALL_SYM]: allSymbols,
            [s.CURR_SYM]: currSym,
            [s.SYM_COUNTS]: inc(new Array(allSymbols.length).fill(0), currSym.idx),
            [s.USER_SYM_CORRECT]: null,
            [s.PHASE]: p.QUESTION,
        })
    }

    function calculateAllSymbols({firstSymbolIdx,lastSymbolIdx}) {
        return ints(firstSymbolIdx,lastSymbolIdx)
            .map(idx => MORSE_ARR[idx])
            .filter(e => e)
            .map((e,idx) => ({...e, idx}))
    }

    function onUserInput(symOrCode, timings) {
        setState(state => {
            const st = objectHolder(state)

            if (symOrCode === st.get(s.CURR_SYM).sym) {
                st.set(s.USER_INPUT_DATA, null)
                st.set(s.USER_SYM_CORRECT, null)
                st.set(s.CURR_SYM, nextRandomElem({allElems:st.get(s.ALL_SYM),counts:st.get(s.SYM_COUNTS)}))
                st.set(s.SYM_COUNTS, inc(st.get(s.SYM_COUNTS), st.get(s.CURR_SYM).idx))
                speak(st.get(s.CURR_SYM).word)
            } else {
                // playAudio(ERROR_SOUND, () => speak(st.get(s.CURR_SYM).word))
                playAudio(ERROR_SOUND, () => outputMorse(st.get(s.CURR_SYM).sym))
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

    function renderSymbolIdxSelector({label, value, onChange}) {
        return RE.FormControl({variant:'outlined'},
            RE.InputLabel({}, label),
            RE.Select(
                {
                    value: value,
                    label,
                    onChange: event => {
                        onChange(event.target.value)
                    },
                    style: {width: '100px'},
                    variant:'outlined'
                },
                ints(0, MORSE_ARR.length-1).map(i => RE.MenuItem({key: i, value: i}, MORSE_ARR[i].sym))
            )
        )
    }

    return RE.Container.col.top.center({style:{marginTop:'300px'}},{style:{marginTop:'15px'}},
        renderVoiceSelector(),
        renderSymbolIdxSelector({
            label:'First symbol',
            value:state[s.FIRST_SYMBOL_IDX],
            onChange: newValue => setState(state => createNewState({prevState:state, params:{[s.FIRST_SYMBOL_IDX]:newValue}}))
        }),
        renderSymbolIdxSelector({
            label:'First symbol',
            value:state[s.LAST_SYMBOL_IDX],
            onChange: newValue => setState(state => createNewState({prevState:state, params:{[s.LAST_SYMBOL_IDX]:newValue}}))
        }),
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