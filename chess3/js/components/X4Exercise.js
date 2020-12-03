"use strict";

const X4KeyCodes = [DOWN_KEY_CODE, KEY_CODE_J, UP_KEY_CODE, KEY_CODE_K, LEFT_KEY_CODE, KEY_CODE_H, RIGHT_KEY_CODE, KEY_CODE_L]

const X4Exercise = () => {
    const LOCAL_STORAGE_KEY = 'X4Exercise'

    const s = {
        PHASE: 'PHASE',
        CURR_CELL: 'CURR_CELL',
        FOCUSED_CELL: 'FOCUSED_CELL',
        KEY_IS_DOWN: 'KEY_IS_DOWN',
        SPACE_IS_DOWN: 'SPACE_IS_DOWN',
        CLICK_DATA: 'CLICK_DATA',
        USER_CLICK_CORRECT: 'USER_CLICK_CORRECT',
        USER_SELECTED_CELL: 'USER_SELECTED_CELL',
        CELL_COUNTS: 'CELL_COUNTS',
    }

    const p = {
        QUESTION: 'QUESTION',
        ANSWER: 'ANSWER',
    }

    const viewWidth = 700
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
    const [voiceUriStore, setVoiceUriStore] = useStateFromLocalStorageString({
        key:LOCAL_STORAGE_KEY+'.'+'voiceUri', defaultValue:''
    })
    const {speak, availableVoiceUris} = useSpeechComponent({voiceUri:voiceUriStore})

    function createState() {
        const currCell = ALL_CELLS[randomInt(0,ALL_CELLS.length-1)]
        return createObj({
            [s.CURR_CELL]: currCell,
            [s.FOCUSED_CELL]: ALL_CELLS[28],
            [s.KEY_IS_DOWN]: false,
            [s.SPACE_IS_DOWN]: false,
            [s.CLICK_DATA]: null,
            [s.CELL_COUNTS]: inc(new Array(ALL_CELLS.length).fill(0), currCell.idx),
            [s.PHASE]: p.QUESTION,
        })
    }

    useEffect(() => {
        document.onkeydown = onKeyDown
        document.onkeyup = onKeyUp
    }, [])

    function renderValueSelector({label, value, values, onChange}) {
        return RE.FormControl({variant:'outlined'},
            RE.InputLabel({}, label),
            RE.Select(
                {
                    value: value,
                    label,
                    onChange: event => {
                        onChange(event.target.value)
                    },
                    style: {width: '300px'},
                },
                values.map(([value,text]) => RE.MenuItem({key: value, value: value}, text))
            )
        )
    }

    function nextRandomCell({cellCounts}) {
        const cellsWithCnt = ALL_CELLS.map(cell => ({...cell, cnt:cellCounts[cell.idx]}))
        const minCnt = cellsWithCnt.attr('cnt').min()
        const cellsWithMinCnt = cellsWithCnt.filter(cell => cell.cnt == minCnt)
        return cellsWithMinCnt[randomInt(0,cellsWithMinCnt.length-1)]
    }

    function sayCellName(cell) {
        const xName = XX[cell.x].toUpperCase()
        const yName = YY[cell.y].toUpperCase()
        window.setTimeout(
            () => playAudio(`${xName}.mp3`, () => playAudio(`${yName}.mp3`)),
            1000
        )

        // speak(`${xName}, ${yName}`)
    }

    function nextState({state, clickData, enterPressed}) {
        function proceedToNextQuestion({state}) {
            state = state.set(s.PHASE, p.QUESTION)
            state = state.set(s.CURR_CELL, nextRandomCell({cellCounts:state[s.CELL_COUNTS]}))
            state = state.set(s.CLICK_DATA, null)
            state = state.set(s.USER_CLICK_CORRECT, null)
            state = state.set(s.USER_SELECTED_CELL, null)
            state = state.set(s.CELL_COUNTS, inc(state[s.CELL_COUNTS], state[s.CURR_CELL].idx))
            sayCellName(state[s.CURR_CELL])
            return state
        }

        if (state[s.PHASE] == p.QUESTION) {
            if (clickData) {
                state = state.set(s.CLICK_DATA, clickData)
            }
            state = state.set(s.USER_CLICK_CORRECT, isUserClickCorrect({clickData,currCell:state[s.CURR_CELL],enterPressed,focusedCell:state[s.FOCUSED_CELL]}))
            state = state.set(s.USER_SELECTED_CELL, getUserSelectedCell({clickData,enterPressed,focusedCell:state[s.FOCUSED_CELL]}))
            if (state[s.USER_CLICK_CORRECT]) {
                state = state.set(s.PHASE, p.ANSWER)
                if (enterPressed) {
                    state = proceedToNextQuestion({state})
                }
            } else {
                playAudio(ERROR_SOUND)
            }
        } else {
            state = proceedToNextQuestion({state})
        }
        return state
    }

    function getUserSelectedCell({clickData,enterPressed,focusedCell}) {
        if (enterPressed) {
            return focusedCell
        } else {
            return ALL_CELLS.find(cell => isPointWithinCell({x:clickData.x, y:clickData.y, cell}))
        }
    }

    function isUserClickCorrect({clickData, currCell, enterPressed, focusedCell}) {
        if (enterPressed) {
            return equalCells(focusedCell, currCell)
        } else {
            const userSelectedCell = getUserSelectedCell({clickData})
            return equalCells(currCell, userSelectedCell)
                && clickData.nativeEvent.button == (isWhiteCell(userSelectedCell) ? 0 : 2)
        }
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

    function renderCurrCellName({color}) {
        let center = SVG_EX.scale(numOfCols/2*cellSize)
        center = center.translateTo(center.rotate(90).end)
        return SVG.text(
            {
                key:'cell-name',
                x:center.end.x-cellSize/2,
                y:center.end.y+cellSize/2*0.7,
                fill:color??'yellow',
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

    function renderCells({key, props, propsFunc}) {
        return ALL_CELLS.map(cell => renderCell({key,cellNum:cell.idx,props:{...props, ...(propsFunc?.(cell)??{})}}))
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

    function getNewFocusedCell({keyCode,curCell}) {
        let newFocusedCell
        if (keyCode === DOWN_KEY_CODE || keyCode === KEY_CODE_J) {
            newFocusedCell = {x:curCell.x, y:curCell.y-1}
        } else if (keyCode === UP_KEY_CODE || keyCode === KEY_CODE_K) {
            newFocusedCell = {x:curCell.x, y:curCell.y+1}
        } else if (keyCode === LEFT_KEY_CODE || keyCode === KEY_CODE_H) {
            newFocusedCell = {x:curCell.x-1, y:curCell.y}
        } else if (keyCode === RIGHT_KEY_CODE || keyCode === KEY_CODE_L) {
            newFocusedCell = {x:curCell.x+1, y:curCell.y}
        }
        if (newFocusedCell) {
            newFocusedCell = ALL_CELLS.find(cell => equalCells(cell, newFocusedCell))
        }
        if (hasNoValue(newFocusedCell)) {
            playAudio(ERROR_SOUND)
        }
        return newFocusedCell??curCell
    }

    function onKeyDown(event) {
        if (X4KeyCodes.includes(event.keyCode)) {
            setState(old =>
                old
                    .set(s.FOCUSED_CELL, old[s.KEY_IS_DOWN] ? old[s.FOCUSED_CELL] : getNewFocusedCell({keyCode:event.keyCode,curCell:old[s.FOCUSED_CELL]}))
                    .set(s.KEY_IS_DOWN, true)
            )
        }

        if (event.keyCode == ENTER_KEY_CODE){
            setState(old => nextState({state:old, enterPressed:true}))
        }

        if (event.keyCode == SPACE_KEY_CODE){
            setState(old => old.set(s.SPACE_IS_DOWN, true))
        }
    }

    function onKeyUp(event) {
        setState(old => old.set(s.KEY_IS_DOWN, false))
        if (event.keyCode == SPACE_KEY_CODE){
            setState(old => old.set(s.SPACE_IS_DOWN, false))
        }
    }

    function renderSvgContent() {
        if (state[s.SPACE_IS_DOWN]) {
            return [
                background,
                svgPolygon({key: 'field', points: fieldCorners, props: {fill:'green', strokeWidth: 0}}),
                // ...renderIslands(),
                ...renderCells({
                    key:'cell-border',
                    props: borderCellProps,
                    propsFunc: cell => ({
                        fillOpacity:1,
                        fill:(cell.x+cell.y)%2==0?'rgb(181,136,99)' : 'rgb(240,217,181)',
                        strokeOpacity:state[s.FOCUSED_CELL].idx == cell.idx ? 1 : 0
                    })
                }),
                !state[s.USER_CLICK_CORRECT]?renderCurrCellName({}):null,
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
                state[s.USER_CLICK_CORRECT]?renderCurrCellName({}):null,
            ]
        } else {
            return [
                renderCurrCellName({color:'black'}),
            ]
        }
    }

    const borderCellProps = {fillOpacity:0, strokeWidth:cellSize*0.04, stroke:'cyan', strokeOpacity:0, className:'cell-border'};
    return RE.Container.col.top.center({style:{marginTop:'50px'}},{style:{marginBottom:'10px'}},
        1==2?renderValueSelector({
            label:'Voice',
            value: voiceUriStore,
            values:availableVoiceUris,
            onChange: newVoiceUri => setVoiceUriStore(newVoiceUri)
        }):null,
        RE.svg2(
            {
                width: viewWidth,
                height: viewWidth,
                boundaries: viewBoundaries,
                onClick: pointClicked,
                onKeyDown,
                props: {style:{cursor:'crosshair'}}
            },
            renderSvgContent()
        )
    )
}