"use strict";

function xCoordFromChessboardToSvg(x,cellSize) {
    return x*cellSize
}

function yCoordFromChessboardToSvg(y,cellSize) {
    return (7-y)*cellSize
}

const chCodeToImg = {
    ["P".charCodeAt(0)]:"Chess_plt45",
    ["N".charCodeAt(0)]:"Chess_nlt45",
    ["B".charCodeAt(0)]:"Chess_blt45",
    ["R".charCodeAt(0)]:"Chess_rlt45",
    ["Q".charCodeAt(0)]:"Chess_qlt45",
    ["K".charCodeAt(0)]:"Chess_klt45",
    ["p".charCodeAt(0)]:"Chess_pdt45",
    ["n".charCodeAt(0)]:"Chess_ndt45",
    ["b".charCodeAt(0)]:"Chess_bdt45",
    ["r".charCodeAt(0)]:"Chess_rdt45",
    ["q".charCodeAt(0)]:"Chess_qdt45",
    ["k".charCodeAt(0)]:"Chess_kdt45",
}

const SvgChessBoardCell = ({cellSize,chCode,x,y,withDot,onLeftClicked}) => {

    function codeToImg(code) {
        if (code == 0) {
            return null
        } else {
            return "img/chess/" + chCodeToImg[code] + ".svg"
        }
    }

    const svgCellSizeHalf = cellSize/2;
    const selectedCellDotR = cellSize*0.2;

    const cellXPos = xCoordFromChessboardToSvg(x, cellSize)
    const cellYPos = yCoordFromChessboardToSvg(y, cellSize)
    return RE.Fragment({},
        SVG.rect({
            x:cellXPos, y:cellYPos, width:cellSize, height:cellSize,
            style:{fill:(x + y) % 2 == 0 ? "rgb(181,136,99)" : "rgb(240,217,181)"},
            onMouseDown: event => onLeftClicked?onLeftClicked(event):null
        }),
        chCode? SVG.image({
            x:cellXPos, y:cellYPos, width:cellSize, height:cellSize,
            href:codeToImg(chCode),
        }):null,
        withDot? SVG.circle({
            cx:cellXPos + svgCellSizeHalf, cy:cellYPos+svgCellSizeHalf, r:selectedCellDotR,
            style:{fill:"green", fillOpacity:"0.5"},
        }):null

    )
}