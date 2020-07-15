"use strict";

const MovementsExercise = () => {
    const st = {
        STAGE: 'STAGE',
        CURR_CON: 'CURR_CON',
        CON_COUNTS: 'CON_COUNTS',
    }

    const sg = {
        QUESTION: 'QUESTION',
        ANSWER: 'ANSWER',
    }

    const ALL_CONNECTIONS = useMemo(() =>
        ints(0,63).flatMap(i =>
            [12,2,3,4,6,8,9,10]
                .map(h => ({from:absNumToCell(i), dir:hourToDir(h)}))
                .map(({from,dir}) => ({from, to:moveToCellRelatively(from,dir)}))
                .filter(({from,to}) => isValidCell(to))
        ).map((con,idx) => ({...con, idx}))
    )

    const [state, setState] = useState(() => createState())

    function createState() {
        const currCon = ALL_CONNECTIONS[randomInt(0,ALL_CONNECTIONS.length-1)];
        return addSetter({
            [st.CURR_CON]: currCon,
            [st.CON_COUNTS]: inc(new Array(ALL_CONNECTIONS.length).fill(0), currCon.idx),
            [st.STAGE]: sg.QUESTION,
        })
    }

    function nextRandomConnection({prevCon, conCounts}) {
        const possibleCons = ALL_CONNECTIONS
            .filter(con => equalCells(prevCon.to, con.from))
            .filter(con => !equalCells(con.to, prevCon.from))
            .map(con => ({...con, cnt:conCounts[con.idx]}))

        const minCnt = possibleCons.attr('cnt').min()

        const consWithMinCnt = possibleCons.filter(con => con.cnt == minCnt)

        return consWithMinCnt[randomInt(0,consWithMinCnt.length-1)]
    }

    function nextState(state) {
        if (state[st.STAGE] == sg.QUESTION) {
            state = state.set(st.STAGE, sg.ANSWER)
        } else {
            state = state.set(st.STAGE, sg.QUESTION)
            state = state.set(st.CURR_CON, nextRandomConnection({prevCon:state[st.CURR_CON], conCounts:state[st.CON_COUNTS]}))
            state = state.set(st.CON_COUNTS, inc(state[st.CON_COUNTS], state[st.CURR_CON].idx))
        }
        return state
    }

    function renderState() {
        return JSON.stringify(state.attr(st.STAGE, st.CURR_CON))
    }

    function renderStatistics() {
        return `numOfMoves=${state[st.CON_COUNTS].sum()}, minCnt=${state[st.CON_COUNTS].min()}, maxCnt=${state[st.CON_COUNTS].max()}`
    }

    function nextClicked() {
        const newState = ints(1,1).reduce((s,i)=>nextState(s),state)
        setState(newState)
    }

    return RE.Container.row.center.center({},{},
        RE.Container.col.top.center({},{},
            renderState(),
            renderStatistics(),
            RE.Button({onClick: nextClicked}, 'Next'),
        )
    )
}