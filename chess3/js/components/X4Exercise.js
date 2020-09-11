"use strict";

const X4Exercise = () => {

    const s = {
        PHASE: 'PHASE',
        CURR_CELL: 'CURR_CELL',
        CLICK_DATA: 'CLICK_DATA',
        USER_CLICK_CORRECT: 'USER_CLICK_CORRECT',
        USER_SELECTED_CELL: 'USER_SELECTED_CELL',
        CELL_COUNTS: 'CELL_COUNTS',
    }

    const p = {
        QUESTION: 'QUESTION',
        ANSWER: 'ANSWER',
    }

    const viewWidth = 500
    const background = SVG.rect({key:'background', x:-1000, y:-1000, width:2000, height:2000, fill:"lightgrey"})

    const cellSize = 10
    const numOfCols = 8
    const numOfRows = numOfCols
    const clickedPointRadius = cellSize*0.1

    const ALL_CELLS = useMemo(() =>
        ints(0,63)
            .map((cellNum,idx) => ({...absNumToCell(cellNum), name:cellNumToCellName(cellNum), idx}))
            .map(cell => ({...cell, vectors: createCellVectors({x:cell.x, y:cell.y})}))
            .map(createObj)
    )

    const [state, setState] = useState(() => createState())

    function createState() {
        const currCell = ALL_CELLS[randomInt(0,ALL_CELLS.length-1)];
        return createObj({
            [s.CURR_CELL]: currCell,
            [s.CLICK_DATA]: null,
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

    function nextState({state, clickData}) {
        if (state[s.PHASE] == p.QUESTION) {
            state = state.set(s.CLICK_DATA, clickData)
            state = state.set(s.USER_CLICK_CORRECT, isUserClickCorrect({clickData,currCell:state[s.CURR_CELL]}))
            state = state.set(s.USER_SELECTED_CELL, getUserSelectedCell({clickData}))
            if (state[s.USER_CLICK_CORRECT]) {
                state = state.set(s.PHASE, p.ANSWER)
            }
        } else {
            state = state.set(s.PHASE, p.QUESTION)
            state = state.set(s.CURR_CELL, nextRandomCell({cellCounts:state[s.CELL_COUNTS]}))
            state = state.set(s.CLICK_DATA, null)
            state = state.set(s.USER_CLICK_CORRECT, null)
            state = state.set(s.USER_SELECTED_CELL, null)
            state = state.set(s.CELL_COUNTS, inc(state[s.CELL_COUNTS], state[s.CURR_CELL].idx))
        }
        return state
    }

    function getUserSelectedCell({clickData}) {
        return ALL_CELLS.find(cell => isPointWithinCell({x:clickData.x, y:clickData.y, cell}))
    }

    function isUserClickCorrect({clickData, currCell}) {
        const userSelectedCell = getUserSelectedCell({clickData})
        return equalCells(currCell, userSelectedCell)
            && clickData.nativeEvent.button == (isWhiteCell(userSelectedCell) ? 0 : 2)
    }

    function isPointWithinCell({x,y,cell}) {
        const {cellBottomVector, cellUpperVector} = cell.vectors
        return cellBottomVector.start.x <= x && x <= cellBottomVector.end.x
            && cellUpperVector.start.y <= y && y <= cellBottomVector.start.y
    }

    function pointClicked(x,y,nativeEvent) {
        if (nativeEvent.type == 'mouseup') {
            setState(old => nextState({state:old, clickData:{x,y,nativeEvent}}))
        }
    }

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
                y:center.end.y+cellSize/2*0.7,
                fill:'yellow',
                fontSize:cellSize+'px'
            },
            state[s.CURR_CELL].name
        )
    }

    function createCellVectors({x,y}) {
        let cellBottomVector = SVG_EX.scale(cellSize)
        cellBottomVector = cellBottomVector.translate(cellBottomVector, x)
        let cellLeftVector = cellBottomVector.rotate(90)
        cellBottomVector = cellBottomVector.translate(cellLeftVector,y)
        cellLeftVector = cellLeftVector.translate(cellLeftVector, y+1)
        let cellUpperVector = cellLeftVector.rotate(-90)

        return {cellBottomVector, cellUpperVector}
    }

    function renderCell({key,cellNum,props}) {
        const {cellBottomVector, cellUpperVector} = ALL_CELLS[cellNum].vectors

        return svgPolygon({
            key:`${key}-cell-${cellNum}`,
            points: [cellBottomVector.start, cellBottomVector.end, cellUpperVector.end, cellUpperVector.start],
            props
        })
    }

    function renderCells({key, props}) {
        return ALL_CELLS.map(cell => renderCell({key,cellNum:cell.idx,props}))
    }

    function renderClickedPoint({clickData, color}) {
        return svgCircle({
            key: `clicked-point`,
            c: new Point(clickData.x, clickData.y),
            r: clickedPointRadius,
            props: {fill: color, strokeWidth: 0}
        })
    }

    function getCellColor({cell}) {
        return isBlackCell(cell)?'black':'lightgrey'
    }

    function renderIslands() {
        return [
            0,2,9,18,16,61,63,54,45,47,
            5,14,7,21,23,56,58,49,40,42
        ].map(i => renderCell({key:'island',cellNum:i,props:{strokeWidth:0,fill:'olive'}}))
    }

    const borderCellProps = {fillOpacity:0, strokeWidth:cellSize*0.02, stroke:'cyan', strokeOpacity:0, className:'cell-border'};
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
            ...renderIslands(),
            ...(state[s.USER_SELECTED_CELL]
                    ? [
                        state[s.USER_CLICK_CORRECT]?renderCell({
                            key:'user-selected-cell',
                            cellNum:state[s.USER_SELECTED_CELL].idx,
                            props:{strokeWidth:0,fill:getCellColor({cell:state[s.USER_SELECTED_CELL]})}
                        }):null,
                        renderCell({
                            key:'cell-border-clicked',
                            cellNum:state[s.USER_SELECTED_CELL].idx,
                            props:{
                                ...borderCellProps,
                                strokeOpacity:1,
                                stroke: state[s.USER_CLICK_CORRECT]?'yellow':'red'
                            }
                        })
                    ]
                    : []
            ),
            renderCurrCellName(),
            ...renderCells({key:'cell-border', props: borderCellProps}),
        )
    )
}