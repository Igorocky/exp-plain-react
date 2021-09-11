"use strict";

const MorseExerciseCells = () => {
    const LOCAL_STORAGE_KEY = 'MorseExerciseCells'

    const s = {
        PHASE: 'PHASE',
        CURR_CARD: 'CURR_CARD',
        CARD_COUNTS: 'CARD_COUNTS',
        DOT_DURATION: 'DOT_DURATION',
        ALL_CARDS: 'ALL_CARDS',
        WAKEUP_TIMEOUT_HANDLE: 'WAKEUP_TIMEOUT_HANDLE',
    }

    const [dotDurationStore, setDotDurationStore] = useStateFromLocalStorageNumber({
        key:LOCAL_STORAGE_KEY+'.'+'dotDuration', min: 0.01, max: 0.1, defaultValue: 0.05
    })
    const [state, setState] = useState(() => createNewState({}))
    useEffect(() => {
        setDotDurationStore(state[s.DOT_DURATION])
    }, [
        state[s.DOT_DURATION],
    ])

    function createNewState({prevState, params}) {
        const dotDuration = params?.[s.DOT_DURATION]??prevState?.[s.DOT_DURATION]??dotDurationStore
        const allCards = createAllCards({})
        const currCard = allCards[randomInt(0,allCards.length-1)]
        return createObj({
            [s.DOT_DURATION]: dotDuration,
            [s.ALL_CARDS]: allCards,
            [s.CURR_CARD]: currCard,
            [s.CARD_COUNTS]: inc(new Array(allCards.length).fill(0), currCard.idx),
        })
    }

    function createAllCards({}) {
        return prod(
            ints(0,7),
            ints(0,7)
        ).map(([x,y], i) => ({x,y,idx:i}))
    }

    function sayCard(card) {
        const {x,y} = card
        playAudio(xCoordToStr(x) + '.mp3', () => playAudio(yCoordToStr(y) + '.mp3'))
        console.log('card', card)
    }

    function onUserInput(symOrCode) {
        setState(state => {
            const st = objectHolder(state)

            if (MORSE.e.sym === symOrCode) {
                sayCard(st.get(s.CURR_CARD))
            } else if (MORSE.i.sym === symOrCode) {
                const nextCard = nextRandomElem({allElems: st.get(s.ALL_CARDS), counts: st.get(s.CARD_COUNTS)});
                st.set(s.CURR_CARD, nextCard)
                st.set(s.CARD_COUNTS, inc(st.get(s.CARD_COUNTS), st.get(s.CURR_CARD).idx))
                playAudio(ENTER_SOUND, () => window.setTimeout(() => sayCard(nextCard), 0))
            } else {
                playAudio(ERROR_SOUND)
            }

            if (hasValue(st.get(s.WAKEUP_TIMEOUT_HANDLE))) {
                clearTimeout(st.get(s.WAKEUP_TIMEOUT_HANDLE))
            }
            st.set(s.WAKEUP_TIMEOUT_HANDLE, setTimeout(() => playAudio('on-go-to-start3.mp3'), 4.5*60*1000))

            return st.get()
        })
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

    function xCoordToStr(x) {
        return String.fromCharCode(x + 97)
    }

    function yCoordToStr(y) {
        return String.fromCharCode((y + 1) + 48)
    }

    function renderCurrCell() {
        const {x,y} = state[s.CURR_CARD]
        return RE.span({style:{fontSize:'30px'}}, xCoordToStr(x).toUpperCase()+yCoordToStr(y))
    }

    return RE.Container.col.top.center({style:{marginTop:'0px'}},{style:{marginTop:'15px'}},
        renderParamSelector({
            label:'Dot duration',
            paramName:s.DOT_DURATION,
            values:ints(1,10).map(i => [i/100,i/100]),
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
        renderCurrCell(),
        renderStatistics(),
    )
}