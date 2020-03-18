"use strict";

function xCoordFromChessboardToSvg(x,cellSize) {
    return x*cellSize
}

function yCoordFromChessboardToSvg(y,cellSize) {
    return (7-y)*cellSize
}

const SvgChessBoardCellClickHandler = ({cellSize,x,y,onLeftClicked}) => {

    const cellXPos = xCoordFromChessboardToSvg(x, cellSize)
    const cellYPos = yCoordFromChessboardToSvg(y, cellSize)
    return RE.Fragment({},
        SVG.rect({
            x:cellXPos, y:cellYPos, width:cellSize, height:cellSize,
            style:{opacity:0},
            onClick: () => onLeftClicked?onLeftClicked():null
        }),
    )
}