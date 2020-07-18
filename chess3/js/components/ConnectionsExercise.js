"use strict";

const ConnectionsExercise = () => {
    const s = {
        PHASE: 'PHASE',
        CURR_CON: 'CURR_CON',
        CON_COUNTS: 'CON_COUNTS',
    }

    const p = {
        QUESTION: 'QUESTION',
        ANSWER: 'ANSWER',
    }

    const ALL_CELLS = useMemo(() =>
        ints(0,63)
            .map(cellNum => ({...absNumToCell(cellNum), name:cellNumToCellName(cellNum)}))
            .map(createObj)
    )

    const ALL_CONNECTIONS = useMemo(() =>
        [
            ...createDiagonals(),
            ...createKnightMoves(),
        ].map((con,idx) => ({...con, idx}))
            .map(createObj)
    )

    const [state, setState] = useState(() => createState())

    function createState() {
        const currCon = ALL_CONNECTIONS[randomInt(0,ALL_CONNECTIONS.length-1)];
        return createObj({
            [s.CURR_CON]: currCon,
            [s.CON_COUNTS]: inc(new Array(ALL_CONNECTIONS.length).fill(0), currCon.idx),
            [s.PHASE]: p.QUESTION,
        })
    }

    function createKnightMoves() {
        return ALL_CELLS.map(createKnightMove)
    }

    function createKnightMove({x:cx,y:cy}) {
        return {
            sym: getCellName({x:cx,y:cy}),
            cells: [{x:cx,y:cy}, ...ALL_CELLS.filter(({x,y}) => Math.abs(x-cx)==1 && Math.abs(y-cy)==2 || Math.abs(x-cx)==2 && Math.abs(y-cy)==1)]
        }
    }

    function createDiagonals() {
        return prod([-1,1], ints(-7,14))
            .map(([a,b]) => createDiagonalConnection(a,b))
            .filter(con => con.cells.length > 1)
    }

    function createDiagonalConnection(a,b) {
        return {
            sym: lineToDiagSymbol(a,b),
            cells: ALL_CELLS.filter(({x,y}) => y == a*x+b)
        }
    }

    function lineToDiagSymbol(a,b) {
        const dy = a
        const side = dy < 0
            ? (a*3+b) > 3
            : (a*4+b) < 4
        const len = dy < 0
            ? 8-Math.abs(a*7+b)
            : 8-Math.abs(b)
        const char = dy<0?'\\':'/'
        return side?`${char}${len}`:`${len}${char}`
    }

    function nextRandomConnection({conCounts}) {
        const minCnt = conCounts.min()
        const consWithMinCnt = ALL_CONNECTIONS.filter(con => conCounts[con.idx] == minCnt)
        return consWithMinCnt[randomInt(0,consWithMinCnt.length-1)]
    }

    function nextState(state) {
        if (state[s.PHASE] == p.QUESTION) {
            state = state.set(s.PHASE, p.ANSWER)
        } else {
            state = state.set(s.PHASE, p.QUESTION)
            state = state.set(s.CURR_CON, nextRandomConnection({prevCon:state[s.CURR_CON], conCounts:state[s.CON_COUNTS]}))
            state = state.set(s.CON_COUNTS, inc(state[s.CON_COUNTS], state[s.CURR_CON].idx))
        }
        return state
    }

    function renderStatistics() {
        return `${state[s.CON_COUNTS].sum()}[${state[s.CON_COUNTS].min()}, ${state[s.CON_COUNTS].max()}]`
    }

    function nextClicked() {
        const newState = ints(1,1).reduce(s=>nextState(s),state)
        setState(newState)
    }

    function renderQuestion() {
        return RE.div({style:{fontSize:"100px"}},
            state[s.CURR_CON].sym
        )
    }

    function renderChessboard() {
        if (state[s.PHASE] == p.ANSWER) {
            return re(FrameChessboardComponent, {
                width:800, height:800,
                images:state[s.CURR_CON].cells
            })
        } else {
            return null
        }
    }

    return RE.Container.row.left.top({},{style:{marginRight:"20px"}},
        RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
            renderQuestion(),
            renderStatistics(),
            RE.Button({onClick: nextClicked}, 'Next'),
        ),
        renderChessboard(),
    )
}