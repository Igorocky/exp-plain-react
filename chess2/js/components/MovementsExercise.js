"use strict";

const MOVEMENTS_STAGE_QUESTION = "MOVEMENTS_STAGE_QUESTION"
const MOVEMENTS_STAGE_ANSWER = "MOVEMENTS_STAGE_ANSWER"

const MARKER = String.fromCharCode(8226)
const PAUSE_SYMBOL = String.fromCharCode(10074)+String.fromCharCode(10074)
const RUN_SYMBOL = String.fromCharCode(9658)

const MovementsExercise = ({configName}) => {
    const [minX, setMinX] = useState(0)
    const [maxX, setMaxX] = useState(7)
    const [minY, setMinY] = useState(0)
    const [maxY, setMaxY] = useState(7)
    const [curCell, setCurCell] = useState(() => ({x:randomInt(minX,maxX),y:randomInt(minY,maxY)}))
    const [curDir, setCurDir] = useState(() => nextValidRandomDir(curCell))
    const [counts, setCounts] = useState(() => inc(new Array(64).fill(0), cellToAbsNum(curCell)))
    const [absNumToCon] = useState(() =>
        ints(0,63).flatMap(i =>
            [12,2,3,4,6,8,9,10]
                .map(h => ({from:absNumToCell(i), dir:hourToDir(h)}))
                .map(({from,dir}) => ({from:from, to:moveToCellRelatively(from,dir)}))
                .filter(({from,to}) => isValidCell(to))
        )
    )
    const [conCounts, setConCounts] = useState(() =>
        inc(new Array(absNumToCon.length).fill(0), idxOfCon(curCell, curDir))
    )
    const [stage, setStage] = useState(MOVEMENTS_STAGE_QUESTION)
    const [startPauseTimer, timerIsOn] = useTimer({onTimer:nextClicked})
    const [settingsOpened, setSettingsOpened] = useState(false)

    const cellSize = "110px"
    const tdStyle = {width: cellSize, height: cellSize}

    function idxOfCon(curCell, curDir) {
        const from = curCell
        const to = moveToCellRelatively(from, curDir)
        return absNumToCon.map((e,i) => ({con:e, idx:i}))
            .filter(({con,idx}) => equalCells(con.from, from) && equalCells(con.to, to))
            .map(({con,idx}) => idx)[0]
    }

    function inc(arr, idx) {
        return [...arr.slice(0,idx), arr[idx]+1, ...(idx >= arr.length-1 ? [] : arr.slice(idx+1,arr.length))]
    }

    function randomDir() {
        return {dx:randomInt(-1,1), dy:randomInt(-1,1)}
    }

    function isCellInAllowedRange({x,y}) {
        return minX <= x && x <= maxX && minY <= y && y <= maxY
    }

    function isConInAllowedRange({from, to}) {
        return isCellInAllowedRange(from) && isCellInAllowedRange(to)
    }

    function nextValidRandomDir(curCell) {
        let dir = randomDir()
        let nextCell = moveToCellRelatively(curCell, dir)
        while (!isValidCell(nextCell) || !isCellInAllowedRange(nextCell) || (dir.dx==0 && dir.dy==0)) {
            dir = randomDir()
            nextCell = moveToCellRelatively(curCell, dir)
        }
        return dir
    }

    function nextValidDirConnections({prevCell, curCell, conCounts, counts}) {
        const possibleNextCons = [12,3,6,9,2,4,8,10]
            .map(h => hourToDir(h))
            .map(d => (moveToCellRelatively(curCell, d)))
            .filter(isValidCell)
            .filter(isCellInAllowedRange)
            .filter(c => !equalCells(c, prevCell))
            .map(target => ({con:{from:curCell, to:target}, dir:calcDir(curCell, target)}))
            .map(({con, dir}) => ({con:con, dir:dir, cnt:conCounts[idxOfCon(con.from, dir)]}))
        const minCnt = arrMin(possibleNextCons.map(e => e.cnt))
        const consWithMinCnt = possibleNextCons.filter(e => e.cnt == minCnt)
        return nextValidDirRestrictedNeighbors({
            curCell:curCell,
            counts:counts,
            possibleCells:consWithMinCnt.map(e => e.con.to)
        })
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

    function isSameDir(dir1, dir2) {
        return dir1.dx == dir2.dx && dir1.dy == dir2.dy
    }

    function isNextDir(dir1, dir2) {
        return dir1.dx == dir2.dx && Math.abs(dir1.dy - dir2.dy) == 1
                || dir1.dy == dir2.dy && Math.abs(dir1.dx - dir2.dx) == 1
    }

    function getContentForBorderCell({dir}) {
        if (stage == MOVEMENTS_STAGE_QUESTION) {
            if (isSameDir(dir, curDir)) {
                return RE.span({style:{fontSize: "80px"}}, MARKER)
            } else {
                return ""
            }
        } else if (stage == MOVEMENTS_STAGE_ANSWER) {
            if (isSameDir(dir, curDir) || isNextDir(curDir, dir) || isNextDir(dir, curDir)) {
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

    function nextState({curCell, curDir, counts, conCounts}) {
        const prevCell = curCell
        const nextCell = moveToCellRelatively(curCell, curDir)
        const newCounts = inc(counts, cellToAbsNum(nextCell));
        const nextDir = nextValidDirConnections({prevCell:prevCell, curCell:nextCell, conCounts:conCounts, counts:counts});
        const newConCounts = inc(conCounts, idxOfCon(nextCell, nextDir));
        return {curCell:nextCell, curDir:nextDir, counts:newCounts, conCounts:newConCounts}
    }

    function nextClicked() {
        if (stage == MOVEMENTS_STAGE_QUESTION && false) {
            setStage(MOVEMENTS_STAGE_ANSWER)
        } else {
            let curState = {curCell:curCell, curDir:curDir, counts:counts, conCounts:conCounts}
            // curState = ints(1,10000).reduce((s,i) => nextState(s), curState)
            const {curCell:nextCell, curDir:nextDir, counts:newCounts, conCounts:newConCounts} = nextState(curState)
            setCurCell(nextCell)
            setCounts(newCounts)
            setConCounts(newConCounts)
            setCurDir(nextDir)
            setStage(MOVEMENTS_STAGE_QUESTION)
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
                    renderRangeSelector({title: "y range", min:minY, max:maxY, setMin:setMinY, setMax:setMaxY}),
                    renderRangeSelector({title: "x range", min:minX, max:maxX, setMin:setMinX, setMax:setMaxX}),
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