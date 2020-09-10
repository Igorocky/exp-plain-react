"use strict";

const X4Exercise = () => {

    const [clickedPoints, setClickedPoints] = useState([])
    console.log({clickedPoints})

    const viewWidth = 500
    const background = SVG.rect({key:'background', x:-1000, y:-1000, width:2000, height:2000, fill:"lightgrey"})

    const cellSize = 10
    const numOfCols = 8
    const numOfRows = numOfCols
    const clickedPointRadius = cellSize*0.1

    const fieldLowerBound = SVG_EX.scale(numOfCols*cellSize)
    const fieldUpperBound = fieldLowerBound.translateTo(SVG_EY.scale(numOfRows*cellSize).end)
    const fieldCorners = [
        fieldLowerBound.start,
        fieldLowerBound.end,
        fieldUpperBound.end,
        fieldUpperBound.start,
    ]

    const viewBoundaries = SvgBoundaries.fromPoints(fieldCorners).addAbsoluteMargin(cellSize*0.3)

    const width = viewWidth
    const height = viewWidth/0.8
    return RE.Container.col.top.center({style:{marginTop:'100px'}},{},
        RE.svg2(
            {
                width: width,
                height: height,
                boundaries: viewBoundaries,
                onClick: nativeEvent => {
                    console.log({nativeEvent})
                    let target = nativeEvent.target
                    while (hasValue(target) && target.nodeName != 'svg') {
                        target = target.parentElement
                    }
                    if (target) {
                        console.log({svg:target})
                        const svgBoundingClientRect = target.getBoundingClientRect();
                        console.log({svgBoundingClientRect})
                        const clickViewScreenX = nativeEvent.clientX - svgBoundingClientRect.x
                        const clickViewScreenY = nativeEvent.clientY - svgBoundingClientRect.y
                        console.log({x: clickViewScreenX})
                        console.log({y: clickViewScreenY})
                        const H = height
                        const W = width
                        const h = viewBoundaries.maxY - viewBoundaries.minY
                        const w = viewBoundaries.maxX - viewBoundaries.minX
                        const pixelSize = H/W < h/w ? h/H : w/W
                        const clickViewCenterX = -W/2 + clickViewScreenX
                        const clickViewCenterY = -H/2 + clickViewScreenY
                        const clickImageCenterX = clickViewCenterX*pixelSize
                        const clickImageCenterY = clickViewCenterY*pixelSize
                        const clickImageX = (viewBoundaries.minX + viewBoundaries.maxX)/2 + clickImageCenterX
                        const clickImageY = (viewBoundaries.minY + viewBoundaries.maxY)/2 + clickImageCenterY
                        setClickedPoints([{x:clickImageX, y:clickImageY}])
                    }
                }
            },
            background,
            svgPolygon({key: 'field', points: fieldCorners, props: {fill:'green', strokeWidth: 0}}),
            ...clickedPoints.map((p,i) => svgCircle({key:`clicked-point-${i}`, c:new Point(p.x,p.y), r:clickedPointRadius, props: {fill:'red', strokeWidth: 0}}))
        )
    )
}