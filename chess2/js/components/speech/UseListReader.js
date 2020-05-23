"use strict";

const NULL_FUNCTION = () => null

function useListReader() {
    const [say, setSay] = useState(() => nullSafeSay(null))
    const [title, setTitle] = useState(null)
    const [elems, setElems] = useState([])
    const [currElemIdx, setCurrElemIdx] = useState(0)

    const NEXT_SOUND = "./sounds/on-next.mp3"
    const PREV_SOUND = "./sounds/on-prev.mp3"
    const GO_TO_START_SOUND = "./sounds/on-go-to-start3.mp3"
    const GO_TO_END_SOUND = "./sounds/on-go-to-end-teleport.mp3"
    const ENTER_SOUND = "./sounds/on-enter2.mp3"
    const BACKSPACE_SOUND = "./sounds/on-backspace.mp3"
    const ESCAPE_SOUND = "./sounds/on-escape.mp3"

    function withSound(audioFileName, callback) {
        const audio = new Audio(audioFileName);
        audio.play().then(callback)
    }

    function init({say:sayParam, title, elems, sayFirstElem}) {
        if (sayParam !== undefined) {
            setSay(() => nullSafeSay(sayParam))
        }
        if (title !== undefined) {
            setTitle(title)
            if (title.say) {
                if (!sayFirstElem) {
                    title.say()
                }
            } else {
                say("Title is not defined.")
            }
        }
        if (elems !== undefined) {
            setElems(elems)
            setCurrElemIdx(0)
            if (sayFirstElem) {
                if (elems.length == 0) {
                    say("List is empty.")
                } else {
                    const action = elems[0]["say"]
                    if (action) {
                        action()
                    } else {
                        say("Say on the first elem is not defined.")
                    }
                }
            }
        }
    }

    function nullSafeSay(say) {
        return say?say:(str => console.log("useListReader.say: " + str))
    }

    function onSymbolsChanged(symbols) {
        if (!symbols.length) {
            return symbols
        }
        const last = symbols[symbols.length-1]
        if (last.sym == MORSE.e.sym) {//ok
            withSound(NEXT_SOUND, () => {
                if (elems.length-1 <= currElemIdx) {
                    say("No more elements to read to the right.")
                } else {
                    const newCurrElemIdx = currElemIdx+1
                    setCurrElemIdx(newCurrElemIdx)
                    sayElem(newCurrElemIdx)
                }
            })
        } else if (last.sym == MORSE.i.sym) {//ok
            withSound(PREV_SOUND, () => {
                if (currElemIdx <= 0) {
                    say("No more elements to read to the left.")
                } else {
                    const newCurrElemIdx = currElemIdx - 1
                    setCurrElemIdx(newCurrElemIdx)
                    sayElem(newCurrElemIdx)
                }
            })
        } else if (last.sym == MORSE.t.sym) {//ok
            sayElem(currElemIdx)
        } else if (last.sym == MORSE.o.sym) {//ok
            withSound(GO_TO_START_SOUND, () => {
                setCurrElemIdx(0)
                sayElem(0)
            })
        } else if (last.sym == MORSE.j.sym) {//ok
            withSound(GO_TO_END_SOUND, () => {
                const lastElemIdx = elems.length-1
                setCurrElemIdx(lastElemIdx)
                sayElem(lastElemIdx)
            })
        } else if (last.sym == MORSE.a.sym) {//ok
            if (title && title.say) {
                title.say()
            } else {
                say("Title is not defined.")
            }
        } else if (last.sym == MORSE.u.sym) {//ok
            if (title && title.spell) {
                title.spell()
            } else {
                say("Title spell is not defined.")
            }
        } else if (last.sym == MORSE.m.sym) {//ok
            withSound(ENTER_SOUND, () => onAction(currElemIdx, "onEnter", () => say("On enter is undefined.")))
        } else if (last.sym == MORSE.n.sym) {//ok
            onAction(currElemIdx, "onSpell", () => say("On spell is undefined."))
        } else if (last.sym == MORSE.s.sym) {//ok
            withSound(BACKSPACE_SOUND, () => onAction(currElemIdx, "onBack", () => say("On back is undefined.")))
        } else if (last.sym == MORSE.error.sym) {//ok
            withSound(ESCAPE_SOUND, () => onAction(currElemIdx, "onEscape", () => say("On escape is undefined.")))
        } else {
            say("Unexpected command: " + last.codeInfo.word)
        }
        return [last]
    }

    function sayElem(idx) {
        onAction(idx, "say")
    }

    function onAction(idx, actionName, onActionIsUndefined) {
        if (elems.length == 0) {
            say("List is empty.")
        } else {
            const action = elems[idx][actionName];
            if (action) {
                action()
            } else if (onActionIsUndefined) {
                onActionIsUndefined()
            }
        }
    }

    return {init, onSymbolsChanged}
}
