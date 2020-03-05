"use strict";

const MovementsExercise = ({configName}) => {
    const [curCell, setCurCell] = useState(() => ({x:randomInt(0,7),y:randomInt(0,7)}))
    const [curDir, setCurDir] = useState(() => nextValidRandomDir(curCell))

    const cellSize = "110px"
    const tdStyle = {width: cellSize, height: cellSize}
    const MARKER = String.fromCharCode(8226)

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
        setCurDir(nextValidRandomDir(nextCell))
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
        RE.Button({onClick:nextClicked, style:{height:"100px", width:"100px"}}, "Next"),
    )
}