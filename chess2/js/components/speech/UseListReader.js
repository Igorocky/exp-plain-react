"use strict";

const NULL_FUNCTION = () => null

function useListReader() {
    const [say, setSay] = useState(() => nullSafeSay(null))
    const [title, setTitle] = useState(null)
    const [elems, setElems] = useState([])
    const [currElemIdx, setCurrElemIdx] = useState(0)

    function init({say:sayParam, title, elems}) {
        if (sayParam !== undefined) {
            setSay(() => nullSafeSay(sayParam))
        }
        if (title !== undefined) {
            setTitle(title)
            if (title.say) {
                title.say()
            } else {
                say("Title is not defined.")
            }
        }
        if (elems !== undefined) {
            setElems(elems)
            setCurrElemIdx(0)
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
            if (elems.length-1 <= currElemIdx) {
                say("No more elements to read to the right.")
            } else {
                const newCurrElemIdx = currElemIdx+1
                setCurrElemIdx(newCurrElemIdx)
                sayElem(newCurrElemIdx)
            }
        } else if (last.sym == MORSE.i.sym) {//ok
            if (currElemIdx <= 0) {
                say("No more elements to read to the left.")
            } else {
                const newCurrElemIdx = currElemIdx-1
                setCurrElemIdx(newCurrElemIdx)
                sayElem(newCurrElemIdx)
            }
        } else if (last.sym == MORSE.t.sym) {//ok
            sayElem(currElemIdx)
        } else if (last.sym == MORSE.o.sym) {//ok
            setCurrElemIdx(0)
            sayElem(0)
        } else if (last.sym == MORSE.j.sym) {//ok
            const lastElemIdx = elems.length-1
            setCurrElemIdx(lastElemIdx)
            sayElem(lastElemIdx)
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
            onAction(currElemIdx, "onEnter", () => say("On enter is undefined."))
        } else if (last.sym == MORSE.n.sym) {//ok
            onAction(currElemIdx, "onSpell", () => say("On spell is undefined."))
        } else if (last.sym == MORSE.s.sym) {//ok
            onAction(currElemIdx, "onBack", () => say("On back is undefined."))
        } else if (last.sym == MORSE.error.sym) {//ok
            onAction(currElemIdx, "onEscape", () => say("On escape is undefined."))
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
