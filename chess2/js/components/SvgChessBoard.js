"use strict";

const SvgChessBoard = ({pieces, cellsWithDots, wPlayer, bPlayer, flipped, arrow, showAxes,
                           onCellLeftClicked}) => {

    const board = ints(0,7).map(x => ints(0,7).map(y => ({
        x:cellCoordsAfterFlip(flipped,x),
        y:cellCoordsAfterFlip(flipped,y),
        withDot: (cellsWithDots?cellsWithDots:[]).filter(cell => x==cell.x && y==cell.y).length > 0,
        chCode: _.first(
            (pieces?pieces:[])
                .filter(({cell, chCode}) => x==cell.x && y==cell.y)
                .map(({cell, chCode}) => chCode)
        ),
    })))

    function cellCoordsAfterFlip(flipped, coord) {
        return flipped?7-coord:coord
    }

    const cellSizeFromFenCoeff = svgCellSize/45
    const triangleLength = 35*cellSizeFromFenCoeff
    const triangleHeight = triangleLength
    const lineWidth = 15*cellSizeFromFenCoeff
    const halfLineWidth = Math.floor(lineWidth/2);
    const halfTriangleHeight = Math.floor(triangleHeight/2);
    function renderArrow({from, to}) {
        const dx = from.x-to.x
        const dy = from.y-to.y
        const length = Math.floor(Math.sqrt(dx*dx+dy*dy))
        const handleLength = length-triangleLength;
        let angle = Math.atan(dy/dx)*180/Math.PI
        // const possibleMoves = [
        //     {depth: 1, move: "e4e6"},
        //     {depth: 11, move: "e4f6"},
        //     {depth: 12, move: "e4g5"},
        //     {depth: 2, move: "e4g4"},
        //     {depth: 21, move: "e4g3"},
        //     {depth: 22, move: "e4f2"},
        //     {depth: 3, move: "e4e2"},
        //     {depth: 31, move: "e4d2"},
        //     {depth: 32, move: "e4c3"},
        //     {depth: 4, move: "e4c4"},
        //     {depth: 41, move: "e4c5"},
        //     {depth: 42, move: "e4d6"},
        // ]
        if (dx >= 0) {
            if (dy == 0) {
                angle = -angle+180
            } else {
                angle = angle+180
            }
        }
        return SVG.g({transform:"translate(" + from.x + ", " + from.y + ") rotate(" + angle + ")"},
            SVG.path({
                d:"M0,0"
                    +" L0,"+halfLineWidth
                    +" L"+handleLength+","+halfLineWidth
                    +" L"+handleLength+","+halfTriangleHeight
                    +" L"+length+",0"
                    +" L"+handleLength+","+(-halfTriangleHeight)
                    +" L"+handleLength+","+(-halfLineWidth)
                    +" L0,"+(-halfLineWidth)
                    + " Z",
                style:{stroke:"blue", fill:"blue", opacity:0.85}
            })
        )
    }

    function moveToArrowCoords(move,flipped) {
        const fromX = cellCoordsAfterFlip(flipped,move.charCodeAt(0)-97)
        const fromY = cellCoordsAfterFlip(flipped,move.charCodeAt(1)-49)
        const toX = cellCoordsAfterFlip(flipped,move.charCodeAt(2)-97)
        const toY = cellCoordsAfterFlip(flipped,move.charCodeAt(3)-49)

        return {
            from: {
                x: xCoordFromChessboardToSvg(fromX)+svgCellSize/2,
                y: yCoordFromChessboardToSvg(fromY)+svgCellSize/2,
            },
            to: {
                x: xCoordFromChessboardToSvg(toX)+svgCellSize/2,
                y: yCoordFromChessboardToSvg(toY)+svgCellSize/2,
            }
        }
    }

    function hLine({dist, color, width}) {
        return SVG.line({
            x1: xCoordFromChessboardToSvg(0),
            y1:yCoordFromChessboardToSvg(-1+dist),
            x2:xCoordFromChessboardToSvg(8),
            y2:yCoordFromChessboardToSvg(-1+dist),
            style:{stroke: color, strokeWidth: width?width:1},
        })
    }

    function vLine({dist, color, width}) {
        return SVG.line({
            x1: xCoordFromChessboardToSvg(dist),
            y1:yCoordFromChessboardToSvg(-1),
            x2:xCoordFromChessboardToSvg(dist),
            y2:yCoordFromChessboardToSvg(7),
            style:{stroke: color, strokeWidth: width?width:1},
        })
    }

    function renderAxes() {
        const axesColor = "blue";
        const cellEdgeColor = "rgb(200,200,200)";
        return RE.Fragment({},
            // hLine({dist: 0, color: cellEdgeColor}),
            // hLine({dist: 1, color: cellEdgeColor}),
            // hLine({dist: 2, color: cellEdgeColor}),
            // hLine({dist: 3, color: cellEdgeColor}),
            // hLine({dist: 5, color: cellEdgeColor}),
            // hLine({dist: 6, color: cellEdgeColor}),
            // hLine({dist: 7, color: cellEdgeColor}),
            // hLine({dist: 8, color: cellEdgeColor}),
            // vLine({dist: 0, color: cellEdgeColor}),
            // vLine({dist: 1, color: cellEdgeColor}),
            // vLine({dist: 2, color: cellEdgeColor}),
            // vLine({dist: 3, color: cellEdgeColor}),
            // vLine({dist: 5, color: cellEdgeColor}),
            // vLine({dist: 6, color: cellEdgeColor}),
            // vLine({dist: 7, color: cellEdgeColor}),
            // vLine({dist: 8, color: cellEdgeColor}),
            hLine({dist: 4, color: axesColor, width:2}),
            vLine({dist: 4, color: axesColor, width:2}),
        )
    }

    const upperPlayer = flipped?wPlayer:bPlayer
    const lowerPlayer = flipped?bPlayer:wPlayer
    return RE.Container.col.top.left({},{},
        upperPlayer,
        RE.svg({width:svgCellSize*8, height:svgCellSize*8},
            _.range(7, -1, -1).map(y =>
                _.range(0, 8).map(x => re(SvgChessBoardCell, {
                    key:x+"-"+y,
                    chCode:board[x][y].chCode,
                    x:board[x][y].x,
                    y:board[x][y].y,
                    withDot:board[x][y].withDot,
                    onLeftClicked: () => onCellLeftClicked?onCellLeftClicked({x:x,y:y}):null
                }))
            ),
            arrow?renderArrow(moveToArrowCoords(arrow,flipped)):null,
            showAxes?renderAxes():null
        ),
        lowerPlayer
    )
}