"use strict";

const FrameChessboardComponent = ({width, height, dist:distP, circles:circlesP, images:imagesP}) => {
    const dist = distP??10
    const circles = circlesP??[]
    const images = imagesP??[]

    const radius = dist*0.1
    const imgSize = dist*0.5
    const imgClipRadius = imgSize/(2**0.5)
    const lineStrokeWidth = radius*0.1

    const margin = imgClipRadius*1.1
    const minX = -margin
    const xWidth = 7*dist+2*margin
    const minY = minX
    const yWidth = xWidth

    const lineColor = 'black'

    function renderCellCircle({cellX, cellY, fill}) {
        return svg.circle({key:`circle-${cellX}-${cellY}-${fill}`, cx:cellX*dist, cy:cellY*dist, r:radius, fill})
    }

    function renderCellImage({cellX, cellY, cellName}) {
        const imgCenterX = cellX*dist
        const x = imgCenterX-imgSize/2
        const imgCenterY = cellY*dist
        const y = imgCenterY-imgSize/2
        const href=`./chess-board-configs/config1/${cellName}.png`
        return [
            svg.circle({key:`img-frame-${cellName}-${x}-${y}`, cx:imgCenterX, cy:imgCenterY, r:imgClipRadius,
                fill:'white', stroke:'lightgrey', strokeWidth:lineStrokeWidth}),
            svg.image({key:`img-${cellName}-${x}-${y}`, x, y, height:imgSize, width:imgSize, href, clipPath:`circle(${imgClipRadius})`}),
        ]
    }

    function renderLines() {
        function generateSquarePoints(cx,cy,hsize) {
            const corners = prod([-1,1],[-1,1]).map(([dx,dy]) => [cx+dx*hsize,cy+dy*hsize])
            return [corners[0],corners[1],corners[3],corners[2]]
        }

        function generateSquarePath(cx,cy,hsize) {
            return generateSquarePoints(cx,cy,hsize).flatMap(e=>e).join(' ')
        }

        return [
            [3.5,3.5,3.5],
            ...generateSquarePoints(3.5,3.5,1.5).map(([x,y]) => [x,y,1])
        ].map(ps=>ps.map(p=>p*dist)).map(params =>
            svg.polygon({key:`sq-${params[0]}-${params[1]}-${params[2]}`,
                points:generateSquarePath(...params), fill:'transparent', stroke:lineColor, strokeWidth:lineStrokeWidth}),
        )
    }

    function renderCircles() {
        return circles.map(c => renderCellCircle({cellX:c.x, cellY:c.y, fill: c.color}))
    }

    function renderImages() {
        return images.flatMap(i => renderCellImage({cellX:i.x, cellY:i.y, cellName:getCellName(i)}))
    }

    return RE.svg({width, height, minX, xWidth, minY, yWidth},
        [
            ...renderLines(),
            ...renderCircles(),
            ...renderImages(),
        ]
    )
}