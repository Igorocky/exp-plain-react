"use strict";

const ImageSelector = () => {

    const s = {
        SELECTED_POINT: 'SELECTED_POINT',
        SELECTED_BOUNDARIES: 'SELECTED_BOUNDARIES',
    }

    const [state, setState] = useState(() => createState({}))

    function createState({prevState, params}) {
        const getParam = createParamsGetter({prevState, params})

        return createObj({
            [s.SELECTED_POINT]: null,
            [s.SELECTED_BOUNDARIES]: [],
        })
    }

    function renderRectangles() {
        const colors = [
            'red',
            'green',
            'blue',
            'orange',
            'yellow',
            'cyan',
            'darkblue',
            'purple',
            'deeppink',
        ]
        let ci = 0
        function getNextColor() {
            return colors[ci++ % colors.length]
        }

        const result = []
        const boundaries = normalizeBoundaries(state[s.SELECTED_BOUNDARIES])
        const numOfRects = boundaries.length
        for (let i = 0; i < numOfRects; i++) {
            const color = getNextColor()
            result.push(
                boundaries[i].toRect({
                    key: `rect-${i}`,
                    color: color,
                    strokeWidth: 0,
                    props: {
                        fill: color,
                        fillOpacity: 0.5
                    }
                })
            )
        }
        return result
    }

    function renderDots() {
        const point = state[s.SELECTED_POINT]
        if (hasNoValue(point)) {
            return []
        } else {
            return [
                svgCircle({key:`point`, c: new Point(point.x, point.y), r:3, props:{fill:'orange'}})
            ]
        }
    }

    function processClick({clickedPoint}) {
        if (hasNoValue(state[s.SELECTED_POINT])) {
            setState(state.set(s.SELECTED_POINT, clickedPoint));
        } else {
            const firstPoint = state[s.SELECTED_POINT]
            setState(
                state
                    .set(s.SELECTED_POINT, null)
                    .set(
                        s.SELECTED_BOUNDARIES,
                        [
                            ...state[s.SELECTED_BOUNDARIES],
                            SvgBoundaries.fromPoints(firstPoint, clickedPoint)
                        ]
                    )
            )
        }
    }

    function findIntersectingBoundaries(allBoundaries) {
        for (let i = 0; i < allBoundaries.length-1; i++) {
            for (let j = i+1; j < allBoundaries.length; j++) {
                if (allBoundaries[i].intersectsWith(allBoundaries[j])) {
                    return [i,j]
                }
            }
        }
        return undefined
    }

    function normalize(b1, b2) {
        if (b1.getPoints().every(p => b2.includesPoint(p))) {
            return [b2]
        } else if (b2.getPoints().every(p => b1.includesPoint(p))) {
            return [b1]
        } else if (b1.minX === b2.minX && b1.maxX === b2.maxX) {
            return [SvgBoundaries.fromPoints(
                new Point(b1.minX, Math.min(b1.minY, b2.minY)),
                new Point(b1.maxX, Math.max(b1.maxY, b2.maxY)),
            )]
        } else if (b1.minY === b2.minY && b1.maxY === b2.maxY) {
            return [SvgBoundaries.fromPoints(
                new Point(Math.min(b1.minX, b2.minX), b1.minY),
                new Point(Math.max(b1.maxX, b2.maxX), b1.maxY),
            )]
        } else {
            const resultF = [
                [false,false,false],
                [false,false,false],
                [false,false,false],
            ]
            const xs = [b1.minX,b2.minX,b1.maxX,b2.maxX]
            xs.sort((a,b) => a < b ? -1 : a > b ? 1 : 0)
            const ys = [b1.minY,b2.minY,b1.maxY,b2.maxY]
            ys.sort((a,b) => a < b ? -1 : a > b ? 1 : 0)
            for (let xi = 0; xi < 3; xi++) {
                for (let yi = 0; yi < 3; yi++) {
                    const mid = new Point((xs[xi]+xs[xi+1])/2,(ys[yi]+ys[yi+1])/2)
                    if (b1.includesPoint(mid) || b2.includesPoint(mid)) {
                        resultF[xi][yi] = true
                    }
                }
            }
            const result = []
            for (let yi = 0; yi < 3; yi++) {
                if (resultF[0][yi] && resultF[1][yi] && resultF[2][yi]) {
                    result.push(SvgBoundaries.fromPoints(
                        new Point(xs[0],ys[yi]),
                        new Point(xs[3],ys[yi+1]),
                    ))
                    resultF[0][yi] = false
                    resultF[1][yi] = false
                    resultF[2][yi] = false
                }
            }
            for (let xi = 0; xi < 3; xi++) {
                if (resultF[xi][0] && resultF[xi][1] && resultF[xi][2]) {
                    result.push(SvgBoundaries.fromPoints(
                        new Point(xs[xi],ys[0]),
                        new Point(xs[xi+1],ys[3]),
                    ))
                    resultF[xi][0] = false
                    resultF[xi][1] = false
                    resultF[xi][2] = false
                }
            }
            for (let xi = 0; xi < 3; xi++) {
                for (let yi = 0; yi < 3; yi++) {
                    if (resultF[xi][yi]) {
                        result.push(SvgBoundaries.fromPoints(
                            new Point(xs[xi],ys[yi]),
                            new Point(xs[xi+1],ys[yi+1]),
                        ))
                    }
                }
            }
            return result
        }
    }

    function removeSmallBoundaries(boundaries) {
        function findSmallBoundaries(boundaries) {
            for (let i = 0; i < boundaries.length-1; i++) {
                for (let j = i+1; j < boundaries.length; j++) {
                    const b1 = boundaries[i]
                    const b2 = boundaries[j]
                    if (b1.getPoints().every(p => b2.includesPoint(p))) {
                        return i
                    } else if (b2.getPoints().every(p => b1.includesPoint(p))) {
                        return j
                    }
                }
            }
            return undefined
        }
        let i = findSmallBoundaries(boundaries)
        while (hasValue(i)) {
            boundaries.removeAtIdx(i)
            i = findSmallBoundaries(boundaries)
        }
    }

    function normalizeBoundaries(allBoundaries) {
        allBoundaries = [...allBoundaries]
        removeSmallBoundaries(allBoundaries)
        let ii = findIntersectingBoundaries(allBoundaries)
        let cnt = 0
        while (hasValue(ii)) {
            cnt++
            const b1 = allBoundaries.removeAtIdx(Math.min(ii[0],ii[1]))
            const b2 = allBoundaries.removeAtIdx(Math.max(ii[0],ii[1])-1)
            allBoundaries.push(...normalize(b1,b2))
            removeSmallBoundaries(allBoundaries)
            ii = findIntersectingBoundaries(allBoundaries)
        }
        return allBoundaries
    }

    const imgPath = '/img/book/p1.png'
    const imgWidth = 1122
    const imgHeight = 767

    return RE.svg(
        {
            width: imgWidth,
            height: imgHeight,
            boundaries: new SvgBoundaries(0, imgWidth, 0, imgHeight),
            onClick: (clickImageX, clickImageY, nativeEvent) => {
                if (nativeEvent.type === 'mouseup') {
                    processClick({clickedPoint: {x:clickImageX,y:clickImageY}})
                }
            }
        },
        re('image', {
            key: 'bgrd-img',
            x: 0,
            y: 0,
            width: imgWidth,
            height: imgHeight,
            href: 'img/p1.png'
        }),
        ...renderDots(),
        ...renderRectangles(),
    )
}