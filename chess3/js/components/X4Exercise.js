"use strict";

const X4Exercise = () => {

    const s = {
        PHASE: 'PHASE',
        CURR_CELL: 'CURR_CELL',
        CLICKED_POINT: 'CLICKED_POINT',
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
            [s.CLICKED_POINT]: null,
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

    function nextState({state, pointClicked}) {
        if (state[s.PHASE] == p.QUESTION) {
            state = state.set(s.PHASE, p.ANSWER)
            state = state.set(s.CLICKED_POINT, pointClicked)
        } else {
            state = state.set(s.PHASE, p.QUESTION)
            state = state.set(s.CURR_CELL, nextRandomCell({cellCounts:state[s.CELL_COUNTS]}))
            state = state.set(s.CLICKED_POINT, null)
            state = state.set(s.CELL_COUNTS, inc(state[s.CELL_COUNTS], state[s.CURR_CELL].idx))
        }
        return state
    }

    function pointClicked(x,y) {
        setState(old => nextState({state:old, pointClicked:{x,y}}))
    }

    const viewWidth = 500
    const background = SVG.rect({key:'background', x:-1000, y:-1000, width:2000, height:2000, fill:"lightgrey"})

    const cellSize = 10
    const numOfCols = 8
    const numOfRows = numOfCols
    const clickedPointRadius = cellSize*0.1

    const fieldLowerBound = SVG_EX.scale(numOfCols*cellSize)
    const fieldUpperBound = fieldLowerBound.translateTo(SVG_EY.scale(numOfRows*cellSize).end)
    const fieldCorners = [
        fieldLowerBound.start,
        fieldLowerBound.end,
        fieldUpperBound.end,
        fieldUpperBound.start,
    ]

    const viewBoundaries = SvgBoundaries.fromPoints(fieldCorners).addAbsoluteMargin(cellSize*0)

    function renderCurrCellName() {
        let center = SVG_EX.scale(numOfCols/2*cellSize)
        center = center.translateTo(center.rotate(90).end)
        return SVG.text(
            {
                key:'cell-name',
                x:center.end.x-cellSize/2,
                y:center.end.y,
                fill:'yellow',
                fontSize:cellSize+'px'
            },
            state[s.CURR_CELL].name
        )
    }

    return RE.Container.col.top.center({style:{marginTop:'100px'}},{},
        RE.svg2(
            {
                width: viewWidth,
                height: viewWidth,
                boundaries: viewBoundaries,
                onClick: pointClicked,
                props: {style:{cursor:'crosshair'}}
            },
            background,
            svgPolygon({key: 'field', points: fieldCorners, props: {fill:'green', strokeWidth: 0}}),
            renderCurrCellName(),
            state[s.CLICKED_POINT]
                ?svgCircle({
                    key:`clicked-point`,
                    c:new Point(state[s.CLICKED_POINT].x,state[s.CLICKED_POINT].y),
                    r:clickedPointRadius,
                    props: {fill:'red', strokeWidth: 0}
                })
                :null
        )
    )
}