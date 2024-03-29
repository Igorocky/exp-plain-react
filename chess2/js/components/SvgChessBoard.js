"use strict";

const SvgChessBoard = ({cellSize, pieces, cellsWithDots, wPlayer, bPlayer, flipped, arrow, showAxes,
                        onMouseDown, onMouseUp, cellNameToShow, colorOfCellNameToShow, drawCells,
                       whiteCells, blackCells}) => {

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

    const cellSizeFromFenCoeff = cellSize/45
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
                x: xCoordFromChessboardToSvg(fromX, cellSize)+cellSize/2,
                y: yCoordFromChessboardToSvg(fromY, cellSize)+cellSize/2,
            },
            to: {
                x: xCoordFromChessboardToSvg(toX, cellSize)+cellSize/2,
                y: yCoordFromChessboardToSvg(toY, cellSize)+cellSize/2,
            }
        }
    }

    function hLine({dist, color, width}) {
        return SVG.line({
            x1: xCoordFromChessboardToSvg(0, cellSize),
            y1:yCoordFromChessboardToSvg(-1+dist, cellSize),
            x2:xCoordFromChessboardToSvg(8, cellSize),
            y2:yCoordFromChessboardToSvg(-1+dist, cellSize),
            style:{stroke: color, strokeWidth: width?width:1},
        })
    }

    function vLine({dist, color, width}) {
        return SVG.line({
            x1: xCoordFromChessboardToSvg(dist, cellSize),
            y1:yCoordFromChessboardToSvg(-1, cellSize),
            x2:xCoordFromChessboardToSvg(dist, cellSize),
            y2:yCoordFromChessboardToSvg(7, cellSize),
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

    function renderCenterAxes() {
        const axesColor = "grey";
        return RE.Fragment({},
            // SVG.circle({
            //     cx:xCoordFromChessboardToSvg(4, cellSize), cy:yCoordFromChessboardToSvg(3, cellSize), r:cellSize*0.1,
            //     style:{fill:"grey", fillOpacity:"0.5"},
            // }),
            // SVG.line({
            //     x1: xCoordFromChessboardToSvg(3, cellSize),
            //     y1: yCoordFromChessboardToSvg(3, cellSize),
            //     x2: xCoordFromChessboardToSvg(5, cellSize),
            //     y2: yCoordFromChessboardToSvg(3, cellSize),
            //     style: {stroke: axesColor, strokeWidth: 2},
            // }),
            // SVG.line({
            //     x1: xCoordFromChessboardToSvg(4, cellSize),
            //     y1: yCoordFromChessboardToSvg(2, cellSize),
            //     x2: xCoordFromChessboardToSvg(4, cellSize),
            //     y2: yCoordFromChessboardToSvg(4, cellSize),
            //     style: {stroke: axesColor, strokeWidth: 2},
            // }),
        )
    }

    function renderCells({cellComponent}) {
        return _.range(7, -1, -1).map(y =>
            _.range(0, 8).map(x => re(cellComponent, {
                key:x+"-"+y,
                cellSize:cellSize,
                chCode:board[x][y].chCode,
                x:board[x][y].x,
                y:board[x][y].y,
                withDot:board[x][y].withDot,
                onMouseDown: nativeEvent => onMouseDown?onMouseDown({x:x,y:y}, nativeEvent):null,
                onMouseUp: nativeEvent => onMouseUp?onMouseUp({x:x,y:y}, nativeEvent):null,
            }))
        )
    }

    function renderCell({cell, color}) {
        return re(SvgChessBoardCell, {
            key:cell.x+"-"+cell.y,
            cellSize:cellSize,
            x:cell.x,
            y:cell.y,
            color: color
        })
    }

    function renderWhiteBlackCells({whiteCells, blackCells}) {
        return RE.Fragment({},[
            ...(whiteCells
                    ? whiteCells.map(c => renderCell({cell: c, color: "white"}))
                    : []),
            ...(blackCells
                    ? blackCells.map(c => renderCell({cell: c, color: "black"}))
                    : []),
        ])
    }

    function renderFrame() {
        return
        return RE.Fragment({},
            vLine({dist: 0, color: "black", width:1}),
            vLine({dist: 1, color: "black", width:0.5}),
            vLine({dist: 2, color: "black", width:0.5}),
            vLine({dist: 3, color: "black", width:0.5}),
            vLine({dist: 4, color: "black", width:0.5}),
            vLine({dist: 5, color: "black", width:0.5}),
            vLine({dist: 6, color: "black", width:0.5}),
            vLine({dist: 7, color: "black", width:0.5}),
            vLine({dist: 8, color: "black", width:1}),
            hLine({dist: 0, color: "black", width:1}),
            hLine({dist: 1, color: "black", width:0.5}),
            hLine({dist: 2, color: "black", width:0.5}),
            hLine({dist: 3, color: "black", width:0.5}),
            hLine({dist: 4, color: "black", width:0.5}),
            hLine({dist: 5, color: "black", width:0.5}),
            hLine({dist: 6, color: "black", width:0.5}),
            hLine({dist: 7, color: "black", width:0.5}),
            hLine({dist: 8, color: "black", width:1}),
        )
    }

    const upperPlayer = flipped?wPlayer:bPlayer
    const lowerPlayer = flipped?bPlayer:wPlayer
    return RE.Container.col.top.left({},{},
        upperPlayer,
        RE.svg({width:cellSize*8, height:cellSize*8},
            SVG.rect({
                x:0, y:0, width:cellSize*8, height:cellSize*8,
                style:{fill:"rgb(220,220,220)"},
            }),
            (drawCells===false)
                ?renderFrame()
                :renderCells({cellComponent:SvgChessBoardCell}),
            renderWhiteBlackCells({whiteCells:whiteCells, blackCells:blackCells}),
            arrow?renderArrow(moveToArrowCoords(arrow,flipped)):null,
            showAxes?renderAxes():null,
            renderCenterAxes(),
            cellNameToShow?SVG.text({
                x:xCoordFromChessboardToSvg(3.35, cellSize),
                y:yCoordFromChessboardToSvg(2.6, cellSize),
                fill:colorOfCellNameToShow,
                opacity:0.3,
                fontSize:cellSize*1.5
            }, cellNameToShow):null,
            renderCells({cellComponent:SvgChessBoardCellClickHandler}),
        ),
        lowerPlayer
    )
}