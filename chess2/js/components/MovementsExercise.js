"use strict";

const MovementsExercise = ({configName}) => {
    const [curCell, setCurCell] = useState(() => ({x:randomInt(0,7),y:randomInt(0,7)}))
    const [curDir, setCurDir] = useState(() => nextValidRandomDir(curCell))
    const [counts, setCounts] = useState(() => inc(new Array(64).fill(0), cellToAbsNum(curCell)))

    const cellSize = "110px"
    const tdStyle = {width: cellSize, height: cellSize}
    const MARKER = String.fromCharCode(8226)

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

    function nextClicked() {
        const nextCell = {x:curCell.x+curDir.dx, y:curCell.y+curDir.dy};
        setCurCell(nextCell)
        const newCounts = inc(counts, cellToAbsNum(nextCell));
        setCounts(newCounts)
        setCurDir(nextValidDir(nextCell, newCounts))
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
            "min: " + Math.min.apply(Math, counts)
            + ", max: " + Math.max.apply(Math, counts)
            + ", all: " + counts.reduce((a,b) => a+b)
        ),
        RE.Button({onClick:nextClicked, style:{height:"100px", width:"100px"}}, "Next"),
    )
}