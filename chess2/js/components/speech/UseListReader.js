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
            withDefault(sayParam, nullSafeSay(say))(title)
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
        } else if (last.sym == MORSE.m.sym) {//ok
            sayElem(currElemIdx)
        } else if (last.sym == MORSE.o.sym) {//ok
            setCurrElemIdx(0)
            sayElem(0)
        } else if (last.sym == MORSE.j.sym) {//ok
            const lastElemIdx = elems.length-1
            setCurrElemIdx(lastElemIdx)
            sayElem(lastElemIdx)
        } else if (last.sym == MORSE.k.sym) {//ok
            say(title)
        } else if (last.sym == MORSE.t.sym) {//ok
            onAction(currElemIdx, "onEnter")
        } else if (last.sym == MORSE.s.sym) {//ok
            onAction(currElemIdx, "onBack")
        } else if (last.sym == MORSE.error.sym) {//ok
            onAction(currElemIdx, "onEscape")
        } else {
            say("Unexpected command: " + last.codeInfo.word)
        }
        return [last]
    }

    function sayElem(idx) {
        onAction(idx, "say")
    }

    function onAction(idx, actionName) {
        if (elems.length == 0) {
            say("List is empty.")
        } else {
            withDefault(elems[idx][actionName], NULL_FUNCTION)()
        }
    }

    return {init, onSymbolsChanged}
}
