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
        ints(0,63).map((cellNum,idx) => ({...absNumToCell(cellNum), name:cellNumToCellName(cellNum), idx}))
    )

    const [state, setState] = useState(() => createState())

    function createState() {
        const currCell = ALL_CELLS[randomInt(0,ALL_CELLS.length-1)];
        return addSetter({
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
        const dist = 10
        const radius = dist*0.2
        const imgRadius = radius
        const lineStrokeWidth = radius*0.1

        const margin = radius*1.1
        const minX = -margin
        const xWidth = 7*dist+2*margin
        const minY = minX
        const yWidth = xWidth

        const normalCircleColor = 'lightgrey'
        const questionCircleColor = 'rgb(230,126,34)'
        const lineColor = 'black'

        function renderCellCircle({cellX, cellY, fill}) {
            return svg.circle({key:`circle-${cellX}-${cellY}-${fill}`, cx:cellX*dist, cy:cellY*dist, r:radius, fill})
        }

        const sqrt_2 = 2**0.5

        function renderCellImage({cellX, cellY, cellName}) {
            const size = imgRadius*sqrt_2
            const imgCenterX = cellX*dist
            const x = imgCenterX-size/2
            const imgCenterY = cellY*dist
            const y = imgCenterY-size/2
            const href=`./chess-board-configs/config1/${cellName}.png`
            return svg.image({key:`img-${cellName}-${x}-${y}`, x, y, height:size, width:size, href})
        }

        function renderDots() {
            return ALL_CELLS.map(c => renderCellCircle({cellX:c.x, cellY:c.y, fill:normalCircleColor}))
        }

        function renderLines() {
            return [
                ...[1,3,4,6]
                    .map(x=>x*dist)
                    .map(x => svg.line({key:`line-x-${x}`, x1:x, x2:x, y1:0, y2:7*dist, stroke:lineColor, strokeWidth:lineStrokeWidth})),
                ...[1,3,4,6]
                    .map(y=>y*dist)
                    .map(y => svg.line({key:`line-y-${y}`, y1:y, y2:y, x1:0, x2:7*dist, stroke:lineColor, strokeWidth:lineStrokeWidth}))
            ]
        }

        function renderQA() {
            const c = state[s.CURR_CELL]
            if (state[s.PHASE] == p.QUESTION) {
                return [renderCellCircle({cellX:c.x, cellY:c.y, fill: questionCircleColor})]
            } else {
                return [renderCellImage({cellX:c.x, cellY:c.y, cellName:c.name})]
            }
        }

        return RE.svg({width:800, height:800, minX, xWidth, minY, yWidth},
            [
                ...renderLines(),
                ...renderDots(),
                ...renderQA()
            ]
        )
    }

    return RE.Container.row.center.center({},{},
        RE.Container.col.top.center({},{},
            renderChessboard(),
            renderStatistics(),
            RE.Button({onClick: nextClicked}, 'Next'),
        )
    )
}