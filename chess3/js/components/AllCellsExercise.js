"use strict";

const AllCellsExercise = () => {
    const s = {
        PHASE: 'PHASE',
        CURR_CELL_IDX: 'CURR_CELL_IDX',
        CELL_IDX_COUNTS: 'CELL_IDX_COUNTS',
    }

    const p = {
        QUESTION: 'QUESTION',
    }

    const [state, setState] = useState(() => createNewState({}))

    function createNewState({prevState, params}) {
        function getParam(name, defaultValue) {
            const fromParams = params?.[name]
            if (fromParams !== undefined) {
                return fromParams
            }
            const fromPrevState = prevState?.[name]
            if (fromPrevState !== undefined) {
                return fromPrevState
            }
            if (typeof defaultValue === 'function') {
                return defaultValue()
            } else {
                return defaultValue
            }
        }

        const cellIdxCounts = getParam(s.CELL_IDX_COUNTS, () => ints(1,64).map(() => 0))
        const currCellIdx = getParam(s.CURR_CELL_IDX, () => randomInt(0,63))

        return createObj({
            [s.PHASE]: p.QUESTION,
            [s.CELL_IDX_COUNTS]: cellIdxCounts,
            [s.CURR_CELL_IDX]: currCellIdx,
        })
    }

    function sayCellName(cell) {
        const xName = XX[cell.x].toUpperCase()
        const yName = YY[cell.y].toUpperCase()
        window.setTimeout(
            () => playAudio(`${xName}.mp3`, () => playAudio(`${yName}.mp3`)),
            1000
        )
    }

    function onUserInput({sym, code, timings}) {
        if (hasValue(sym)) {
            if (MORSE.c.sym === sym) {
                sayCellName(absNumToCell(state[s.CURR_CELL_IDX]))
            } else {
                setState(prevState => {
                    const nextStateHolder = objectHolder(prevState)

                    if (MORSE.n.sym === sym) {
                        const minCnt = prevState[s.CELL_IDX_COUNTS].min()
                        const idxsWithMinCnt = prevState[s.CELL_IDX_COUNTS]
                            .map((cnt,idx) => ({cnt,idx}))
                            .filter(({cnt, idx}) => cnt == minCnt)
                            .map(({cnt, idx}) => idx)
                        const selectedNextIdx = idxsWithMinCnt[randomInt(0,idxsWithMinCnt.length-1)]
                        nextStateHolder.set(s.CURR_CELL_IDX,selectedNextIdx)
                        nextStateHolder.set(s.CELL_IDX_COUNTS, inc(prevState[s.CELL_IDX_COUNTS], selectedNextIdx))
                        sayCellName(absNumToCell(selectedNextIdx))
                    } else {
                        playAudio(ERROR_SOUND)
                    }

                    return nextStateHolder.get()
                })
            }
        } else {
            playAudio(ERROR_SOUND)
        }
    }

    function onUserInputEnter() {
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

    function renderStatistics() {
        return `numOfCellsPassed=${state[s.CELL_IDX_COUNTS].sum()}, minCnt=${state[s.CELL_IDX_COUNTS].min()}, maxCnt=${state[s.CELL_IDX_COUNTS].max()}`
    }

    return RE.Container.col.top.center({style:{marginTop:'0px'}},{style:{marginTop:'15px'}},
        re(MorseInput,{
            onSymbol: (sym,timings) => {
                console.log(`You've entered: ${sym}   [${timingsToStr(timings)}]`)
                onUserInput({sym, timings})
            },
            onUnrecognizedCode: (code,timings) => {
                console.log(`Unrecognized code: ${code}   [${timingsToStr(timings)}]`)
                onUserInput({code, timings})
            },
            onEnter: onUserInputEnter,
        }),
        renderStatistics(),
    )
}