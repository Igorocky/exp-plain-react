"use strict";

const MorseExercise = () => {
    const LOCAL_STORAGE_KEY = 'MorseExercise'

    const s = {
        PHASE: 'PHASE',
        CURR_CARD: 'CURR_CARD',
        USER_INPUT_CORRECT: 'USER_SYM_CORRECT',
        USER_INPUT: 'USER_INPUT',
        USER_INPUT_DATA: 'USER_INPUT_DATA',
        CARD_COUNTS: 'CARD_COUNTS',
        FIRST_SYMBOL_IDX: 'FIRST_SYMBOL_IDX',
        LAST_SYMBOL_IDX: 'LAST_SYMBOL_IDX',
        CARD_LENGTH: 'CARD_LENGTH',
        ALL_CARDS: 'ALL_CARDS'
    }

    const p = {
        QUESTION: 'QUESTION',
        ANSWER: 'ANSWER',
    }

    const {speak, renderVoiceSelector} = useSpeechComponent()
    const {outputMorse} = useMorseOutput({dotDuration:0.1})

    const [firstSymbolIdxParam, setFirstSymbolIdxParam] = useStateFromLocalStorageNumber({
        key:LOCAL_STORAGE_KEY+'.'+'firstSymbolIdx', min: 0, max: MORSE_ARR.length-1, minIsDefault: true
    })
    const [lastSymbolIdxParam, setLastSymbolIdxParam] = useStateFromLocalStorageNumber({
        key:LOCAL_STORAGE_KEY+'.'+'lastSymbolIdx', min: 0, max: MORSE_ARR.length-1, maxIsDefault: true
    })
    const [cardLengthParam, setCardLengthParam] = useStateFromLocalStorageNumber({
        key:LOCAL_STORAGE_KEY+'.'+'cardLength', min: 1, max: 3, minIsDefault: true
    })
    const [state, setState] = useState(() => createNewState({}))
    useEffect(() => {
        setFirstSymbolIdxParam(state[s.FIRST_SYMBOL_IDX])
        setLastSymbolIdxParam(state[s.LAST_SYMBOL_IDX])
        setCardLengthParam(state[s.CARD_LENGTH])
    }, [state[s.FIRST_SYMBOL_IDX], state[s.LAST_SYMBOL_IDX], state[s.CARD_LENGTH]])


    function createNewState({prevState, params}) {
        const firstSymbolIdx = params?.[s.FIRST_SYMBOL_IDX]??prevState?.[s.FIRST_SYMBOL_IDX]??firstSymbolIdxParam
        const lastSymbolIdx = Math.max(firstSymbolIdx, params?.[s.LAST_SYMBOL_IDX]??prevState?.[s.LAST_SYMBOL_IDX]??lastSymbolIdxParam)
        const cardLength = params?.[s.CARD_LENGTH]??prevState?.[s.CARD_LENGTH]??cardLengthParam
        const allCards = createAllCards({firstSymbolIdx,lastSymbolIdx,cardLength})
        const currCard = allCards[randomInt(0,allCards.length-1)]
        return createObj({
            [s.FIRST_SYMBOL_IDX]: firstSymbolIdx,
            [s.LAST_SYMBOL_IDX]: lastSymbolIdx,
            [s.CARD_LENGTH]: cardLength,
            [s.ALL_CARDS]: allCards,
            [s.CURR_CARD]: currCard,
            [s.CARD_COUNTS]: inc(new Array(allCards.length).fill(0), currCard.idx),
            [s.USER_INPUT_CORRECT]: null,
            [s.USER_INPUT]: '',
            [s.USER_INPUT_DATA]: [],
            [s.PHASE]: p.QUESTION,
        })
    }

    function createAllCards({firstSymbolIdx,lastSymbolIdx,cardLength}) {
        return prod(
            ...ints(0,cardLength-1).map(c =>
                ints(firstSymbolIdx,lastSymbolIdx).map(i => MORSE_ARR[i])
            )
        ).map((cardArray,idx) => ({symbols:cardArray, idx, text:cardArray.attr('sym').join('')}))
    }

    function onUserInput(symOrCode, timings) {
        setState(state => {
            const st = objectHolder(state)

            if (MORSE.end.sym === symOrCode) {
                const userInput = st.get(s.USER_INPUT)
                st.set(s.USER_INPUT, '')
                st.set(s.USER_INPUT_DATA, [])
                if (userInput == st.get(s.CURR_CARD).text) {
                    st.set(s.USER_INPUT_CORRECT, null)
                    st.set(s.CURR_CARD, nextRandomElem({allElems:st.get(s.ALL_CARDS),counts:st.get(s.CARD_COUNTS)}))
                    st.set(s.CARD_COUNTS, inc(st.get(s.CARD_COUNTS), st.get(s.CURR_CARD).idx))
                    playAudio(
                        NEXT_SOUND,
                        () => window.setTimeout(
                            () => outputMorse(st.get(s.CURR_CARD).text),
                            1000
                        )
                    )
                } else {
                    playAudio(
                        GO_TO_START_SOUND,
                        () => window.setTimeout(
                            () => outputMorse(st.get(s.CURR_CARD).text),
                            1000
                        )
                    )
                    st.set(s.USER_INPUT_CORRECT, false)
                }
            } else if (MORSE.question.sym === symOrCode) {
                st.set(s.USER_INPUT, '')
                st.set(s.USER_INPUT_DATA, [])
                speak(st.get(s.CURR_CARD).symbols.map(s => s.word).join(' '))
            } else if (MORSE.apostrophe.sym === symOrCode) {
                st.set(s.USER_INPUT, '')
                st.set(s.USER_INPUT_DATA, [])
                outputMorse(st.get(s.CURR_CARD).text)
            } else {
                if (MORSE_MAP_SYM[symOrCode]) {
                    outputMorse(symOrCode)
                } else {
                    playAudio(GO_TO_START_SOUND)
                }
                st.set(s.USER_INPUT, st.get(s.USER_INPUT) + symOrCode)
                st.set(s.USER_INPUT_DATA, [...st.get(s.USER_INPUT_DATA), {symOrCode, timings}])
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
            return RE.table({},
                RE.tbody({},
                    state[s.USER_INPUT_DATA].map((inputData,idx) =>
                        RE.tr({key:idx+'-'+inputData.symOrCode},
                            RE.td({}, `${inputData.symOrCode} [${timingsToStr(inputData.timings)}]`)
                        )
                    )
                )
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

    function renderCardLengthSelector({label, value, onChange}) {
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
                ints(1, 3).map(i => RE.MenuItem({key: i, value: i}, i))
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
        renderCardLengthSelector({
            label:'Card length',
            value:state[s.CARD_LENGTH],
            onChange: newValue => setState(state => createNewState({prevState:state, params:{[s.CARD_LENGTH]:newValue}}))
        }),
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