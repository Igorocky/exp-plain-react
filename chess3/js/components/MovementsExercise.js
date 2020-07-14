"use strict";

const MovementsExercise = ({configName}) => {
    const STAGE = {
        QUESTION: 'QUESTION',
        ANSWER: 'ANSWER',
    }

    const STATE = {
        STAGE: 'STAGE',
        CURR_CON: 'CURR_CON',
        CON_COUNTS: 'CON_COUNTS',
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
        return {
            [STATE.CURR_CON]: currCon,
            [STATE.CON_COUNTS]: inc(new Array(ALL_CONNECTIONS.length).fill(0), currCon.idx),
            [STATE.STAGE]: STAGE.QUESTION,
        }
    }

    function nextRandomConnection({prevCon, conCounts}) {
        const possibleCons = ALL_CONNECTIONS
            .filter(con => equalCells(prevCon.to, con.from))
            .filter(con => !equalCells(con.to, prevCon.from))
            .map(con => ({con, cnt:conCounts[con.idx]}))

        const minCnt = possibleCons.attr('cnt').min()

        const consWithMinCnt = possibleCons.filter(con => con.cnt == minCnt)

        return consWithMinCnt[randomInt(0,consWithMinCnt.length-1)]
    }

    function nextState(state) {
        if (state[STATE.STAGE] == STAGE.QUESTION) {
            state = state.set(STATE.STAGE, STAGE.ANSWER)
        } else {

        }
    }








    const [curDir, setCurDir] = useState(() => nextValidRandomDir(curCell))
    const [counts, setCounts] = useState(() => inc(new Array(64).fill(0), cellToAbsNum(curCell)))

    const [conCounts, setConCounts] = useState(() =>
        inc(new Array(ALL_CONNECTIONS.length).fill(0), idxOfCon(curCell, curDir))
    )
    const [continuousMode, setContinuousMode] = useState(true)
    const [stage, setStage] = useState(MOVEMENTS_STAGE_QUESTION)
    const [startPauseTimer, timerIsOn] = useTimer({onTimer:nextClicked})
    const [settingsOpened, setSettingsOpened] = useState(false)

    const cellSize = profVal(PROFILE_MOBILE, 110, PROFILE_FUJ, 180) + "px"
    const tdStyle = {width: cellSize, height: cellSize}



    function idxOfCon(curCell, curDir) {
        const from = curCell
        const to = moveToCellRelatively(from, curDir)
        return absNumToCon.map((e,i) => ({con:e, idx:i}))
            .filter(({con,idx}) => equalCells(con.from, from) && equalCells(con.to, to))
            .map(({con,idx}) => idx)[0]
    }

    function nextValidDirRestrictedNeighbors({curCell, counts, possibleCells}) {
        const possibleNextCells = possibleCells
            .map(c => ({cell:c, cnt:counts[cellToAbsNum(c)]}))
        const minCnt = arrMin(possibleNextCells.map(e => e.cnt))
        const cellsWithMinCnt = possibleNextCells.filter(e => e.cnt == minCnt).map(e => e.cell)
        return calcDir(curCell, cellsWithMinCnt[randomInt(0, cellsWithMinCnt.length-1)])
    }

    function calcDir(curCell, target) {
        let resultDir
        if (target.x < curCell.x) {
            if (target.y < curCell.y) {
                resultDir = hourToDir(8)
            } else if (target.y == curCell.y) {
                resultDir = hourToDir(9)
            } else {
                resultDir = hourToDir(10)
            }
        } else if (target.x == curCell.x) {
            if (target.y < curCell.y) {
                resultDir = hourToDir(6)
            } else {
                resultDir = hourToDir(12)
            }
        } else {
            if (target.y < curCell.y) {
                resultDir = hourToDir(4)
            } else if (target.y == curCell.y) {
                resultDir = hourToDir(3)
            } else {
                resultDir = hourToDir(2)
            }
        }
        return resultDir
    }

    function renderCell({dir}) {
        return RE.td({
                style: {...tdStyle, backgroundColor: getBgColorForBorderCell({dir:dir})}
            },
            RE.Container.row.center.top({},{},
                getContentForBorderCell({dir:dir})
            )
        )
    }

    function renderImage(cell) {
        if (isValidCell(cell)) {
            return RE.img({
                src:"chess-board-configs/" + configName + "/" + getCellName(cell) + ".png",
                className: "cell-img"
            })
        } else {
            return ""
        }
    }

    function getContentForBorderCell({dir}) {
        if (stage == MOVEMENTS_STAGE_QUESTION) {
            if (isSameDir(dir, curDir)) {
                return RE.span({style:{fontSize: "80px"}}, MARKER)
            } else {
                return ""
            }
        } else if (stage == MOVEMENTS_STAGE_ANSWER) {
            if (isSameDir(dir, curDir)) {
                return renderImage(moveToCellRelatively(curCell, dir))
            } else {
                return ""
            }
        }
    }

    function getBgColorForBorderCell({dir}) {
        if (dir.dx == curCell.dx && dir.dy == curDir.dy) {
            // return "cyan"
            return "white"
        } else {
            return "white"
        }
    }

    function nextRandomCell(conCounts) {
        const minCnt = arrMin(conCounts)
        const consWithMinCnt = conCounts
            .map((c,i) => ({con:absNumToCon[i], cnt:c}))
            .filter(({con,cnt}) => cnt == minCnt)
            .map(({con,cnt}) => con)
        return consWithMinCnt[randomInt(0, consWithMinCnt.length-1)].from
    }

    function nextState({curCell, curDir, counts, conCounts}) {
        const prevCell = curCell
        const nextCell = continuousMode?moveToCellRelatively(curCell, curDir):nextRandomCell(conCounts)
        const newCounts = inc(counts, cellToAbsNum(nextCell));
        const nextDir = nextValidDirConnections({prevCell:prevCell, curCell:nextCell, conCounts:conCounts, counts:counts});
        const newConCounts = inc(conCounts, idxOfCon(nextCell, nextDir));
        return {curCell:nextCell, curDir:nextDir, counts:newCounts, conCounts:newConCounts}
    }

    function nextQuestion() {
        let curState = {curCell:curCell, curDir:curDir, counts:counts, conCounts:conCounts}
        // curState = ints(1,10000).reduce((s,i) => nextState(s), curState)
        const {curCell:nextCell, curDir:nextDir, counts:newCounts, conCounts:newConCounts} = nextState(curState)
        setCurCell(nextCell)
        setCounts(newCounts)
        setConCounts(newConCounts)
        setCurDir(nextDir)
        setStage(MOVEMENTS_STAGE_QUESTION)
    }

    function nextClicked() {
        if (stage == MOVEMENTS_STAGE_QUESTION && !continuousMode) {
            setStage(MOVEMENTS_STAGE_ANSWER)
        } else {
            nextQuestion()
        }
    }

    function renderStat(counts) {
        return "min: " + arrMin(counts) + ", max: " + arrMax(counts) + ", all: " + arrSum(counts)
    }

    function renderCells() {
        return RE.table({className: "chessboard"}, RE.tbody({},
            RE.tr({},
                renderCell({dir:{dx:-1,dy:1}, nextCellDir:curDir}),
                renderCell({dir:{dx:0,dy:1}, nextCellDir:curDir}),
                renderCell({dir:{dx:1,dy:1}, nextCellDir:curDir}),
            ),
            RE.tr({},
                renderCell({dir:{dx:-1,dy:0}, nextCellDir:curDir}),
                RE.td({style: tdStyle, onClick: () => setSettingsOpened(true)}, renderImage(curCell)),
                renderCell({dir:{dx:1,dy:0}, nextCellDir:curDir}),
            ),
            RE.tr({},
                renderCell({dir:{dx:-1,dy:-1}, nextCellDir:curDir}),
                renderCell({dir:{dx:0,dy:-1}, nextCellDir:curDir}),
                renderCell({dir:{dx:1,dy:-1}, nextCellDir:curDir}),
            ),
        ))
    }

    function resetCurrentCellAndDir() {
        const newCell = {x:randomInt(minX,maxX),y:randomInt(minY,maxY)};
        const newDir = nextValidRandomDir(newCell);

        setCurCell(newCell)
        setCurDir(newDir)

        setCounts(inc(counts, cellToAbsNum(newCell)))
        setConCounts(inc(conCounts, idxOfCon(newCell, newDir)))
    }

    function onSettingsClose() {
        resetCurrentCellAndDir()
        setSettingsOpened(false)
    }

    function renderModeSelector() {
        return RE.FormControlLabel({
            control: RE.Checkbox({
                checked: continuousMode,
                onChange: event => setContinuousMode(event.target.checked)
            }),
            label: "Continuous mode"
        })
    }

    function renderRangeSelector({title, min, max, setMin, setMax}) {
        return RE.Container.col.top.left({},{style:{}},
            RE.div({style:{width:"200px"}},
                RE.Slider({
                    value:[min, max],
                    onChange: (event, newValue) => {
                        const [newMin,newMax] = newValue
                        if (newMin < newMax) {
                            setMin(newMin)
                            setMax(newMax)
                        }
                    },
                    step:1,
                    min:0,
                    max:7,
                    valueLabelDisplay:"on"
                })
            ),
            RE.Typography({gutterBottom:true}, title)
        )
    }

    function renderSettings() {
        if (settingsOpened) {
            return RE.Dialog({open:true, onClose:onSettingsClose},
                RE.Container.col.top.left(
                    {style:{paddingTop:"50px", paddingLeft:"20px", paddingRight:"25px"}},
                    {style:{marginBottom: "50px"}},
                    renderModeSelector(),
                    renderRangeSelector({title: "x range", min:minY, max:maxY, setMin:setMinY, setMax:setMaxY}),
                    renderRangeSelector({title: "y range", min:minX, max:maxX, setMin:setMinX, setMax:setMaxX}),
                )
            )
        } else {
            return null
        }
    }

    return RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
        renderCells(),
        RE.span({},
            "Cells [ " + renderStat(counts.filter((c,i)=>isCellInAllowedRange(absNumToCell(i)))) + "]"
            + ", Cons [ " + renderStat(conCounts.filter((c,i)=>isConInAllowedRange(absNumToCon[i]))) + "]"
        ),
        RE.Container.row.center.top({},{style:{margin:"10px"}},
            RE.Button({onClick:startPauseTimer, style:{height:"100px", width:"100px"}},
                timerIsOn?PAUSE_SYMBOL:RUN_SYMBOL
            ),
            RE.Button({onClick:nextClicked, style:{height:"100px", width:"100px"}}, "Next"),
        ),
        renderSettings()
    )
}