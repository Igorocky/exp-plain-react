"use strict";

const FrameToImgExercise = () => {
    const s = {
        PHASE: 'PHASE',
        CURR_CELL: 'CURR_CELL',
        CELL_COUNTS: 'CELL_COUNTS',
    }

    const p = {
        QUESTION: 'QUESTION',
        ANSWER: 'ANSWER',
    }

    const ALL_CELLS = useMemo(() =>
        ints(0,63)
            .map((cellNum,idx) => ({...absNumToCell(cellNum), name:cellNumToCellName(cellNum), idx}))
            .map(createObj)
    )

    const [state, setState] = useState(() => createState())

    function createState() {
        const currCell = ALL_CELLS[randomInt(0,ALL_CELLS.length-1)];
        return createObj({
            [s.CURR_CELL]: currCell,
            [s.CELL_COUNTS]: inc(new Array(ALL_CELLS.length).fill(0), currCell.idx),
            [s.PHASE]: p.QUESTION,
        })
    }

    function nextRandomCell({cellCounts}) {
        const cellsWithCnt = ALL_CELLS.map(cell => ({...cell, cnt:cellCounts[cell.idx]}))
        const minCnt = cellsWithCnt.attr('cnt').min()
        const cellsWithMinCnt = cellsWithCnt.filter(cell => cell.cnt == minCnt)
        return cellsWithMinCnt[randomInt(0,cellsWithMinCnt.length-1)]
    }

    function nextState(state) {
        if (state[s.PHASE] == p.QUESTION) {
            state = state.set(s.PHASE, p.ANSWER)
        } else {
            state = state.set(s.PHASE, p.QUESTION)
            state = state.set(s.CURR_CELL, nextRandomCell({cellCounts:state[s.CELL_COUNTS]}))
            state = state.set(s.CELL_COUNTS, inc(state[s.CELL_COUNTS], state[s.CURR_CELL].idx))
        }
        return state
    }

    function renderStatistics() {
        return `sum=${state[s.CELL_COUNTS].sum()}, minCnt=${state[s.CELL_COUNTS].min()}, maxCnt=${state[s.CELL_COUNTS].max()}`
    }

    function nextClicked() {
        const newState = ints(1,1).reduce((s,i)=>nextState(s),state)
        setState(newState)
    }

    function renderChessboard() {
        return re(FrameChessboardComponent, {
            width:800, height:800,
            circles:[state[s.CURR_CELL].map(c=>({...c, color:'rgb(230,126,34)'}))],
            images:state[s.PHASE]!=p.ANSWER?[]:[state[s.CURR_CELL]]
        })
    }

    return RE.Container.row.center.center({},{},
        RE.Container.col.top.center({},{},
            renderChessboard(),
            renderStatistics(),
            RE.Button({onClick: nextClicked}, 'Next'),
        )
    )
}