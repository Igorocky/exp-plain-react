"use strict";

const DrawingExercise = () => {

    const viewWidth = 700
    const background = SVG.rect({key:'background', x:-1000, y:-1000, width:2000, height:2000, fill:"lightgrey"})
    const areaSize = 10
    const fieldLowerBound = SVG_EX.scale(areaSize)
    const fieldUpperBound = fieldLowerBound.translateTo(SVG_EY.scale(areaSize).end)
    const delta = new Point(-areaSize/2,areaSize/2)
    const fieldCorners = [
        fieldLowerBound.start.add(delta),
        fieldLowerBound.end.add(delta),
        fieldUpperBound.end.add(delta),
        fieldUpperBound.start.add(delta),
    ]

    const viewBoundaries = SvgBoundaries.fromPoints(fieldCorners)

    function rectAroundPoint({key,ex,a,b,props}) {
        const aa = ex.scale(a)
        const bb = ex.rotate(90).scale(b)
        const bbRev = bb.rotate(180)
        const upperBound = aa.translateTo(bb.end)
        const lowerBound = aa.translateTo(bbRev.end)
        return svgPolygon({
            key:`rectAroundPoint-${key}`,
            points: [
                upperBound.end,
                upperBound.rotate(180).end,
                lowerBound.rotate(180).end,
                lowerBound.end,
            ],
            props
        })
    }

    const [angle, setAngle] = useState(0)
    const [numOfRects, setNumOfRects] = useState(3)
    const [lastChangeOfNumOfRects, setLastChangeOfNumOfRects] = useState(getCurrentTime)
    const [numOfRectsChangeDir, setNumOfRectsChangeDir] = useState(1)

    const frameRate = 24
    const frameDelay = 1000/frameRate

    const rotationSpeedDegPerSec = 10
    const dAngle = rotationSpeedDegPerSec/frameRate

    const numOfRectsChangeDelaySec = 0.2

    useEffect(() => {
        scheduleRepeatableAction({
            action: () => {
                setAngle(old => old + dAngle)
                setLastChangeOfNumOfRects(oldTime => {
                    if ((getCurrentTime() - oldTime)/1000 > numOfRectsChangeDelaySec) {
                        setNumOfRects(oldNumOfRects => {
                            if (3 <= oldNumOfRects && oldNumOfRects <= 15) {
                                return oldNumOfRects + numOfRectsChangeDir
                            } else {
                                setNumOfRectsChangeDir(old => old*-1)
                                return oldNumOfRects + (-1*numOfRectsChangeDir)
                            }
                        })
                        return getCurrentTime()
                    } else {
                        return oldTime
                    }
                })
            },
            delay:frameDelay
        })
    }, [])

    function getCurrentTime() {
        return new Date().getTime()
    }

    function scheduleRepeatableAction({action,delay}) {
        window.setTimeout(
            () => {
                action()
                scheduleRepeatableAction({action,delay})
            },
            delay
        )
    }

    function renderRects() {
        const radius = 3
        const da = 360/numOfRects
        const scaleFactor = 0.2
        return ints(0,numOfRects-1).map(i => SVG_EX.scale(radius).rotate(angle+da*i).end).map((center,i) =>
            rectAroundPoint({
                key:i,
                ex:SVG_EX.translateTo(center),
                a:2*scaleFactor,
                b:1*scaleFactor,
            })
        )
    }

    return RE.Container.col.top.center({style:{marginTop:'100px'}},{},
        RE.svg2(
            {
                width: viewWidth,
                height: viewWidth,
                boundaries: viewBoundaries,
            },
            background,
            renderRects()
        )
    )
}