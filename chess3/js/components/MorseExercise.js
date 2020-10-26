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
        DOT_DURATION: 'DOT_DURATION',
        SAY_WORD: 'SAY_WORD',
        VOICE_URI: 'VOICE_URI',
        ALL_CARDS: 'ALL_CARDS',
        SUCCESS_CNT: 'SUCCESS_CNT',
        FAIL_CNT: 'FAIL_CNT',
        TRY_CNT: 'TRY_CNT',
    }

    const p = {
        QUESTION: 'QUESTION',
        ANSWER: 'ANSWER',
    }

    const [firstSymbolIdxStore, setFirstSymbolIdxStore] = useStateFromLocalStorageNumber({
        key:LOCAL_STORAGE_KEY+'.'+'firstSymbolIdx', min: 0, max: MORSE_ARR.length-1, minIsDefault: true
    })
    const [lastSymbolIdxStore, setLastSymbolIdxStore] = useStateFromLocalStorageNumber({
        key:LOCAL_STORAGE_KEY+'.'+'lastSymbolIdx', min: 0, max: MORSE_ARR.length-1, maxIsDefault: true
    })
    const [cardLengthStore, setCardLengthStore] = useStateFromLocalStorageNumber({
        key:LOCAL_STORAGE_KEY+'.'+'cardLength', min: 1, max: 3, minIsDefault: true
    })
    const [dotDurationStore, setDotDurationStore] = useStateFromLocalStorageNumber({
        key:LOCAL_STORAGE_KEY+'.'+'dotDuration', min: 0.01, max: 0.1, defaultValue: 0.05
    })
    const [sayWordStore, setSayWordStore] = useStateFromLocalStorageBoolean({
        key:LOCAL_STORAGE_KEY+'.'+'sayWord', defaultValue:true
    })
    const [voiceUriStore, setVoiceUriStore] = useStateFromLocalStorageString({
        key:LOCAL_STORAGE_KEY+'.'+'voiceUri', defaultValue:''
    })
    const [state, setState] = useState(() => createNewState({}))
    useEffect(() => {
        setFirstSymbolIdxStore(state[s.FIRST_SYMBOL_IDX])
        setLastSymbolIdxStore(state[s.LAST_SYMBOL_IDX])
        setCardLengthStore(state[s.CARD_LENGTH])
        setDotDurationStore(state[s.DOT_DURATION])
        setSayWordStore(state[s.SAY_WORD])
        setVoiceUriStore(state[s.VOICE_URI])
    }, [
        state[s.FIRST_SYMBOL_IDX],
        state[s.LAST_SYMBOL_IDX],
        state[s.CARD_LENGTH],
        state[s.DOT_DURATION],
        state[s.SAY_WORD],
        state[s.VOICE_URI],
    ])
    const {speak, availableVoiceUris} = useSpeechComponent({voiceUri:voiceUriStore})
    const {outputMorse} = useMorseOutput({dotDuration:state[s.DOT_DURATION]})


    function createNewState({prevState, params}) {
        const firstSymbolIdx = params?.[s.FIRST_SYMBOL_IDX]??prevState?.[s.FIRST_SYMBOL_IDX]??firstSymbolIdxStore
        const lastSymbolIdx = Math.max(firstSymbolIdx, params?.[s.LAST_SYMBOL_IDX]??prevState?.[s.LAST_SYMBOL_IDX]??lastSymbolIdxStore)
        const cardLength = params?.[s.CARD_LENGTH]??prevState?.[s.CARD_LENGTH]??cardLengthStore
        const dotDuration = params?.[s.DOT_DURATION]??prevState?.[s.DOT_DURATION]??dotDurationStore
        const sayWord = params?.[s.SAY_WORD]??prevState?.[s.SAY_WORD]??sayWordStore
        const voiceUri = params?.[s.VOICE_URI]??prevState?.[s.VOICE_URI]??voiceUriStore
        const allCards = createAllCards({firstSymbolIdx,lastSymbolIdx,cardLength})
        const currCard = allCards[randomInt(0,allCards.length-1)]
        return createObj({
            [s.FIRST_SYMBOL_IDX]: firstSymbolIdx,
            [s.LAST_SYMBOL_IDX]: lastSymbolIdx,
            [s.CARD_LENGTH]: cardLength,
            [s.DOT_DURATION]: dotDuration,
            [s.SAY_WORD]: sayWord,
            [s.VOICE_URI]: voiceUri,
            [s.ALL_CARDS]: allCards,
            [s.CURR_CARD]: currCard,
            [s.CARD_COUNTS]: inc(new Array(allCards.length).fill(0), currCard.idx),
            [s.USER_INPUT_CORRECT]: null,
            [s.USER_INPUT]: '',
            [s.USER_INPUT_DATA]: [],
            [s.PHASE]: p.QUESTION,
            [s.SUCCESS_CNT]: 0,
            [s.FAIL_CNT]: 0,
            [s.TRY_CNT]: 0,
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

            if (MORSE.question.sym === symOrCode) {
                st.set(s.USER_INPUT, '')
                st.set(s.USER_INPUT_DATA, [])
                speak(st.get(s.CURR_CARD).symbols.map(s => s.word).join(' '))
            } else if (MORSE.period.sym === symOrCode) {
                st.set(s.USER_INPUT, '')
                st.set(s.USER_INPUT_DATA, [])
                window.setTimeout(
                    () => outputMorse(st.get(s.CURR_CARD).text),
                    1000
                )
            } else {
                if (MORSE_MAP_SYM[symOrCode]) {
                    st.set(s.USER_INPUT, st.get(s.USER_INPUT) + symOrCode)
                    st.set(s.USER_INPUT_DATA, [...st.get(s.USER_INPUT_DATA), {sym:symOrCode, timings}])
                    outputMorse(symOrCode)
                } else {
                    st.set(s.USER_INPUT_DATA, [...st.get(s.USER_INPUT_DATA), {code:symOrCode, timings}])
                    playAudio(ERROR_SOUND)
                }
            }

            const userInput = st.get(s.USER_INPUT);
            if (userInput.length == st.get(s.CARD_LENGTH)) {
                st.setObj(updateStateOnUserInputEnter({state:st.get()}))
            }

            return st.get()
        })
    }

    function onUserInputEnter() {
        setState(state => updateStateOnUserInputEnter({state}))
    }

    function updateStateOnUserInputEnter({state}) {
        const st = objectHolder(state)

        const userInput = st.get(s.USER_INPUT)
        st.set(s.USER_INPUT, '')
        st.set(s.USER_INPUT_DATA, [])
        if (userInput == st.get(s.CURR_CARD).text) {
            const words = st.get(s.CURR_CARD).symbols.map(s => s.word).join('. ')
            st.set(s.USER_INPUT_CORRECT, null)
            st.set(s.CURR_CARD, nextRandomElem({allElems:st.get(s.ALL_CARDS),counts:st.get(s.CARD_COUNTS)}))
            st.set(s.CARD_COUNTS, inc(st.get(s.CARD_COUNTS), st.get(s.CURR_CARD).idx))

            if (st.get(s.TRY_CNT) == 0) {
                st.set(s.SUCCESS_CNT, st.get(s.SUCCESS_CNT) + 1)
            } else {
                st.set(s.FAIL_CNT, st.get(s.FAIL_CNT) + 1)
            }
            st.set(s.TRY_CNT, 0)

            const nextCard = st.get(s.CURR_CARD).text
            const outputNextCard = () => window.setTimeout(() => outputMorse(nextCard), 2000)
            const sayCurrentCard = () => window.setTimeout(() => speak(words, outputNextCard), 1200)
            if (st.get(s.SAY_WORD)) {
                sayCurrentCard()
            } else {
                outputNextCard()
            }
        } else {
            st.set(s.TRY_CNT, st.get(s.TRY_CNT) + 1)
            playAudio(
                GO_TO_START_SOUND,
                () => window.setTimeout(
                    () => outputMorse(st.get(s.CURR_CARD).text),
                    1000
                )
            )
            st.set(s.USER_INPUT_CORRECT, false)
        }

        return st.get()
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
                            // RE.td({}, `${inputData.symOrCode} [${timingsToStr(inputData.timings)}]`)
                            RE.td({}, `[${timingsToStr(inputData.timings)}]`)
                        )
                    )
                )
            )
        }
    }

    function renderValueSelector({label, value, values, onChange}) {
        return RE.FormControl({variant:'outlined'},
            RE.InputLabel({}, label),
            RE.Select(
                {
                    value: value,
                    label,
                    onChange: event => {
                        onChange(event.target.value)
                    },
                    style: {width: '300px'},
                },
                values.map(([value,text]) => RE.MenuItem({key: value, value: value}, text))
            )
        )
    }

    function renderParamSelector({label, paramName, values}) {
        return renderValueSelector({
            label:label,
            value:state[paramName],
            values:values,
            onChange: newValue => setState(state => createNewState({prevState:state, params:{[paramName]:newValue}}))
        })
    }

    function renderCheckBox({label, paramName}) {
        return RE.FormGroup({row:true},
            RE.FormControlLabel({label, control: RE.Checkbox({
                    color:'primary',
                    checked: state[paramName],
                    onChange: event => {
                        const {nativeEvent} = event
                        console.log({nativeEvent})
                        setState(state => createNewState({prevState: state, params: {[paramName]: nativeEvent.target.checked}}))
                    }
            })})
        )
    }

    function renderStatistics() {
        return `numOfCards=${state[s.CARD_COUNTS].sum()}, minCnt=${state[s.CARD_COUNTS].min()}, maxCnt=${state[s.CARD_COUNTS].max()}`
    }

    return RE.Container.col.top.center({style:{marginTop:'0px'}},{style:{marginTop:'15px'}},
        renderParamSelector({
            label:'First symbol',
            paramName:s.FIRST_SYMBOL_IDX,
            values:ints(0, MORSE_ARR.length-1).map(i => [i, MORSE_ARR[i].sym]),
        }),
        renderParamSelector({
            label:'Last symbol',
            paramName:s.LAST_SYMBOL_IDX,
            values:ints(0, MORSE_ARR.length-1).map(i => [i, MORSE_ARR[i].sym]),
        }),
        renderParamSelector({
            label:'Card length',
            paramName:s.CARD_LENGTH,
            values:ints(1,3).map(i => [i,i]),
        }),
        renderParamSelector({
            label:'Dot duration',
            paramName:s.DOT_DURATION,
            values:ints(1,10).map(i => [i/100,i/100]),
        }),
        renderCheckBox({label:'Pronounce words', paramName:s.SAY_WORD}),
        renderParamSelector({
            label:'Voice',
            paramName:s.VOICE_URI,
            values:availableVoiceUris,
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
            onEnter: onUserInputEnter,
        }),
        renderStatistics(),
        printUserInputData()
    )
}