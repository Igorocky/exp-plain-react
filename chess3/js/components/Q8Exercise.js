"use strict";

const Q8Exercise = () => {
    const s = {
        PHASE: 'PHASE',
        CURR_CARD: 'CURR_CARD',
        CARD_COUNTS: 'CARD_COUNTS',
        DOT_DURATION: 'DOT_DURATION',
        ALL_CARDS: 'ALL_CARDS',
        WAKEUP_TIMEOUT_HANDLE: 'WAKEUP_TIMEOUT_HANDLE',
    }

    const a = {
        SAY_QUESTION: 'ACTION_SAY_QUESTION',
        SAY_ANSWER: 'ACTION_SAY_ANSWER',
        NEXT_CARD: 'ACTION_NEXT_CARD',
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
        function intersect({n:{nx,ny},m:{mx,my}}) {
            const dx = nx - mx
            const dy = ny - my
            return nx == mx || ny == my || dx == dy || dx == -dy
        }
        function intersectsAny(ys,y) {
            for (let i = 0; i < ys.length; i++) {
                if (intersect({n:{nx:i,ny:ys[i]}, m:{mx:ys.length,my:y}})) {
                    return true
                }
            }
            return false
        }
        const cards = []
        for (let a = 0; a < 8; a++) {
            for (let b = 0; b < 8; b++) {
                if (intersectsAny([a],b)) continue
                for (let c = 0; c < 8; c++) {
                    if (intersectsAny([a,b],c)) continue
                    for (let d = 0; d < 8; d++) {
                        if (intersectsAny([a,b,c],d)) continue
                        for (let e = 0; e < 8; e++) {
                            if (intersectsAny([a,b,c,d],e)) continue
                            for (let f = 0; f < 8; f++) {
                                if (intersectsAny([a,b,c,d,e],f)) continue
                                for (let g = 0; g < 8; g++) {
                                    if (intersectsAny([a,b,c,d,e,f],g)) continue
                                    for (let h = 0; h < 8; h++) {
                                        if (!intersectsAny([a,b,c,d,e,f,g],h)) {
                                            const newCard = {
                                                question:[{x:0,y:a},{x:1,y:b},{x:2,y:c},{x:3,y:d},{x:4,y:e},{x:5,y:f},{x:6,y:g},{x:7,y:h}],
                                                answer: [],
                                                idx: cards.length
                                            }
                                            let r = 4
                                            while (r > 0) {
                                                r--
                                                newCard.answer.push(
                                                    removeAtIdx(
                                                        newCard.question,
                                                        randomInt(0,newCard.question.length-1)
                                                    )
                                                )
                                            }
                                            cards.push(newCard)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return cards
    }

    function sayCell({x,y}, callback) {
        const xStr = xCoordToStr(x)
        const yStr = yCoordToStr(y)
        // console.log(`sayCell: ${xStr}${yStr}`)
        return playAudio(xStr + '.mp3', () => playAudio(yStr + '.mp3', callback))
    }

    function saySequenceOfCells({seq}) {
        if (seq.length) {
            sayCell(seq.first(), seq.length > 1 ? () => saySequenceOfCells({seq:seq.rest()}) : undefined)
        }
    }

    function sayQuestion(card) {
        saySequenceOfCells({seq:card.question})
    }

    function sayAnswer(card) {
        saySequenceOfCells({seq:card.answer})
    }

    function onUserInput(action) {
        const allowedButtonPressedSound = 'on-next.mp3'
        setState(state => {
            const st = objectHolder(state)

            if (action === a.SAY_QUESTION) {
                playAudio(allowedButtonPressedSound, () => sayQuestion(st.get(s.CURR_CARD)))
            } else if (action === a.SAY_ANSWER) {
                playAudio(allowedButtonPressedSound, () => sayAnswer(st.get(s.CURR_CARD)))
            } else if (action === a.NEXT_CARD) {
                const nextCard = nextRandomElem({allElems: st.get(s.ALL_CARDS), counts: st.get(s.CARD_COUNTS)});
                st.set(s.CURR_CARD, nextCard)
                st.set(s.CARD_COUNTS, inc(st.get(s.CARD_COUNTS), st.get(s.CURR_CARD).idx))
                playAudio(ENTER_SOUND, () => window.setTimeout(() => sayQuestion(nextCard), 0))
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

    function renderCurrCard() {
        const {question} = state[s.CURR_CARD]
        return RE.span({style:{fontSize:'30px'}}, question.map(({x,y}) => xCoordToStr(x) + yCoordToStr(y)).join(', '))
    }

    GAMEPAD_STATE_CHANGE_LISTENER = ({button,pressed}) => {
        if (pressed) {
            if (button == GAMEPAD_BUTTON_START) {
                playAudio('on-enter.mp3')
            } else {
                onUserInput(
                    button == GAMEPAD_BUTTON_RIGHT ? a.SAY_QUESTION
                        : button == GAMEPAD_BUTTON_LEFT ? a.SAY_ANSWER
                        : button == GAMEPAD_BUTTON_UP ? a.NEXT_CARD
                            : ''
                )
            }
        }
    }

    return RE.Container.col.top.center({style:{marginTop:'0px'}},{style:{marginTop:'15px'}},
        RE.TextField({
            value: '',
            variant: "outlined",
            autoFocus:true,
            onKeyDown: e => {
                const nativeEvent = e.nativeEvent
                onUserInput(
                    nativeEvent.keyCode == DOWN_KEY_CODE ? a.SAY_QUESTION
                        : nativeEvent.keyCode == UP_KEY_CODE ? a.SAY_ANSWER
                        : nativeEvent.keyCode == RIGHT_KEY_CODE ? a.NEXT_CARD
                        : ''
                )
            },
            style: {
                borderRadius: "5px",
                width: "400px"
            },
        }),
        renderCurrCard(),
        renderStatistics(),
        RE.Button({onClick: connectGamepad, style:{color:'red'}}, 'Connect game pad'),
        RE.Button({onClick: () => onUserInput(a.SAY_QUESTION), style:{color:'red'}}, 'SAY_QUESTION'),
        RE.Button({onClick: () => onUserInput(a.SAY_ANSWER), style:{color:'red'}}, 'SAY_ANSWER'),
        RE.Button({onClick: () => onUserInput(a.NEXT_CARD), style:{color:'red'}}, 'NEXT_CARD'),
    )
}