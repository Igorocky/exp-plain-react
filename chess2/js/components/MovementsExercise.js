"use strict";

const MovementsExercise = ({configName}) => {
    const [curCell, setCurCell] = useState(() => ({x:randomInt(0,7),y:randomInt(0,7)}))
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

    const cellSize = "110px"
    const tdStyle = {width: cellSize, height: cellSize}
    const MARKER = String.fromCharCode(8226)

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

    function nextValidRandomDir(curCell) {
        let dir = randomDir()
        while (!isValidCell({x: curCell.x + dir.dx, y: curCell.y + dir.dy}) || (dir.dx==0 && dir.dy==0)) {
            dir = randomDir()
        }
        return dir
    }

    function nextValidDir(curCell, counts) {
        const minCnt = Math.min.apply(Math, counts.filter((c,i) => i != cellToAbsNum(curCell)))
        const cellsWithMinCnt = counts
            .map((c,i) => ({cell:absNumToCell(i), cnt:c}))
            .filter(({cell,cnt}) => cell.x != curCell.x || cell.y != curCell.y)
            .filter(({cell,cnt}) => cnt == minCnt)
            .map(({cell,cnt}) => ({
                cell:cell,
                dst:Math.floor(Math.pow(cell.x-curCell.x,2) + Math.pow(cell.y-curCell.y,2))
            }))
        const minDist = Math.min.apply(Math, cellsWithMinCnt.map(e => e.dst))
        const cellsWithMinDist = cellsWithMinCnt.filter(e => e.dst == minDist).map(e => e.cell)
        const randomCellWithMinDist = cellsWithMinDist[randomInt(0, cellsWithMinDist.length-1)]
        const target = randomCellWithMinDist
        return calcDir(curCell, target)
    }

    function nextValidDirOnlyNeighbors(curCell, counts) {
        const possibleNextCells = [12,3,6,9,2,4,8,10]
            .map(h => hourToDir(h))
            .map(d => ({x:curCell.x+d.dx, y:curCell.y+d.dy}))
            .filter(c => isValidCell(c))
            .map(c => ({cell:c, cnt:counts[cellToAbsNum(c)]}))
        const minCnt = Math.min.apply(Math, possibleNextCells.map(e => e.cnt))
        const cellsWithMinCnt = possibleNextCells.filter(e => e.cnt == minCnt).map(e => e.cell)
        return calcDir(curCell, cellsWithMinCnt[randomInt(0, cellsWithMinCnt.length-1)])
    }

    function nextValidDirConnections({prevCell, curCell, conCounts, counts}) {
        const possibleNextCons = [12,3,6,9,2,4,8,10]
            .map(h => hourToDir(h))
            .map(d => (moveToCellRelatively(curCell, d)))
            .filter(isValidCell)
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

    function renderCell(content) {
        return RE.td({style: tdStyle}, RE.Container.row.center.top({},{}, content))
    }

    function renderImage(cell) {
        return RE.img({
            src:"chess-board-configs/" + configName + "/" + getCellName(cell) + ".png",
            className: "cell-img"
        })
    }

    function getContentForBorderCell(dir, nextCellDir) {
        if (nextCellDir && dir.dx == nextCellDir.dx && dir.dy == nextCellDir.dy) {
            return RE.span({style:{fontSize: "80px"}}, MARKER)
        } else {
            return ""
        }
    }

    function nextState({curCell, curDir, counts, conCounts}) {
        const prevCell = curCell
        const nextCell = moveToCellRelatively(curCell, curDir)
        const newCounts = inc(counts, cellToAbsNum(nextCell));
        // const nextDir = nextValidDirOnlyNeighbors(nextCell, newCounts);
        const nextDir = nextValidDirConnections({prevCell:prevCell, curCell:nextCell, conCounts:conCounts, counts:counts});
        const newConCounts = inc(conCounts, idxOfCon(nextCell, nextDir));
        return {curCell:nextCell, curDir:nextDir, counts:newCounts, conCounts:newConCounts}
    }

    function nextClicked() {
        let curState = {curCell:curCell, curDir:curDir, counts:counts, conCounts:conCounts}
        // curState = ints(1,10000).reduce((s,i) => nextState(s), curState)
        const {curCell:nextCell, curDir:nextDir, counts:newCounts, conCounts:newConCounts} = nextState(curState)
        setCurCell(nextCell)
        setCounts(newCounts)
        setConCounts(newConCounts)
        setCurDir(nextDir)
    }

    function renderStat(counts) {
        return "min: " + arrMin(counts) + ", max: " + arrMax(counts) + ", all: " + arrSum(counts)
    }

    return RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
        RE.table({className: "chessboard"}, RE.tbody({},
            RE.tr({},
                renderCell(getContentForBorderCell({dx:-1,dy:1}, curDir)),
                renderCell(getContentForBorderCell({dx:0,dy:1}, curDir)),
                renderCell(getContentForBorderCell({dx:1,dy:1}, curDir)),
            ),
            RE.tr({},
                renderCell(getContentForBorderCell({dx:-1,dy:0}, curDir)),
                RE.td({style: tdStyle}, renderImage(curCell)),
                renderCell(getContentForBorderCell({dx:1,dy:0}, curDir)),
            ),
            RE.tr({},
                renderCell(getContentForBorderCell({dx:-1,dy:-1}, curDir)),
                renderCell(getContentForBorderCell({dx:0,dy:-1}, curDir)),
                renderCell(getContentForBorderCell({dx:1,dy:-1}, curDir)),
            ),
        )),
        RE.span({},
            "Cells [ " + renderStat(counts) + "]"
            + ", Cons [ " + renderStat(conCounts) + "]"
        ),
        RE.Button({onClick:nextClicked, style:{height:"100px", width:"100px"}}, "Next"),
    )
}