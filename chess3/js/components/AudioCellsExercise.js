"use strict";

const AudioCellsExercise = () => {
    const s = {
        PHASE: 'PHASE',
        CURR_CARD: 'CURR_CARD',
        CARD_COUNTS: 'CARD_COUNTS',
        DOT_DURATION: 'DOT_DURATION',
        ALL_CARDS: 'ALL_CARDS',
        WAKEUP_TIMEOUT_HANDLE: 'WAKEUP_TIMEOUT_HANDLE',
    }

    const [state, setState] = useState(() => createNewState({}))

    function createNewState({prevState, params}) {
        const allCards = createAllCards({})
        const currCard = allCards[randomInt(0,allCards.length-1)]
        return createObj({
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

            if ('5' === symOrCode) {
                sayCard(st.get(s.CURR_CARD))
            } else if ('6' === symOrCode) {
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

    function renderStatistics() {
        return `numOfCards=${state[s.CARD_COUNTS].sum()}, minCnt=${state[s.CARD_COUNTS].min()}, maxCnt=${state[s.CARD_COUNTS].max()}`
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
        RE.TextField({
            value: '',
            variant: "outlined",
            autoFocus:true,
            onChange: e => {
                const newValue = e.nativeEvent.target.value
                onUserInput(newValue)
            },
            style: {
                borderRadius: "5px",
                width: "400px"
            },
            onKeyUp: e => {
                if (e.keyCode == ENTER_KEY_CODE){
                    say(state[TEXT_TO_READ])
                }
            }
        }),
        renderCurrCell(),
        renderStatistics(),
    )
}