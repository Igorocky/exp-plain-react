"use strict";

const X4Exercise = () => {

    const [clickedPoints, setClickedPoints] = useState([])

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
                onClick: (x, y) => setClickedPoints(old => [...old, {x, y}])
            },
            background,
            svgPolygon({key: 'field', points: fieldCorners, props: {fill:'green', strokeWidth: 0}}),
            ...clickedPoints.map((p,i) => svgCircle({key:`clicked-point-${i}`, c:new Point(p.x,p.y), r:clickedPointRadius, props: {fill:'red', strokeWidth: 0}}))
        )
    )
}