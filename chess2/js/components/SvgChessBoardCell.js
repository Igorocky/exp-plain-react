"use strict";

const svgCellSize = 50;
const svgCellSizeHalf = svgCellSize/2;
const selectedCellDotR = svgCellSize*0.2;
function xCoordFromChessboardToSvg(x) {
    return x*svgCellSize
}

function yCoordFromChessboardToSvg(y) {
    return (7-y)*svgCellSize
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

const SvgChessBoardCell = ({chCode,x,y,selected}) => {

    function codeToImg(code) {
        if (code == 0) {
            return null
        } else {
            return "img/chess/" + chCodeToImg[code] + ".svg"
        }
    }

    function getCellColor({x,y,selected}) {
        return (x + y) % 2 == 0 ? "black" : "white"
    }

    const cellXPos = xCoordFromChessboardToSvg(x)
    const cellYPos = yCoordFromChessboardToSvg(y)
    return RE.Fragment({},
        SVG.rect({
            x:cellXPos, y:cellYPos, width:svgCellSize, height:svgCellSize,
            style:{fill:getCellColor({x:x,y:y,selected:selected})},
        }),
        chCode? SVG.image({
            x:cellXPos, y:cellYPos, width:svgCellSize, height:svgCellSize,
            href:codeToImg(chCode),
        }):null,
        selected? SVG.circle({
            cx:cellXPos + svgCellSizeHalf, cy:cellYPos+svgCellSizeHalf, r:selectedCellDotR,
            style:{fill:"grey"},
        }):null

    )
}