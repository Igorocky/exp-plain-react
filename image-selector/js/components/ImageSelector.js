"use strict";

const ImageSelector = () => {

    const s = {
        POINTS: 'POINTS'
    }

    const [state, setState] = useState(() => createState({}))

    function createState({prevState, params}) {
        const getParam = createParamsGetter({prevState, params})

        return createObj({
            [s.POINTS]: []
        })
    }

    function renderRectangles() {
        const result = []
        const points = state[s.POINTS]
        const numOfRects = Math.floor(points.length/2)
        for (let i = 0; i < numOfRects; i++) {
            result.push(
                SvgBoundaries.fromPoints(points[i*2],points[i*2+1]).toRect({
                    key: `rect-${i}`,
                    color: 'yellow',
                    strokeWidth: 0,
                    props: {
                        fill: 'yellow',
                        fillOpacity: 0.5
                    }
                })
            )
        }
        return result
    }

    function renderDots() {
        const points = state[s.POINTS]
        if (points.length % 2 == 0) {
            return []
        } else {
            const point = points.last()
            return [
                svgCircle({key:`point`, c: new Point(point.x, point.y), r:3, props:{fill:'orange'}})
            ]
        }
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
                    setState(prev => prev.set(s.POINTS, [...prev[s.POINTS], {x:clickImageX,y:clickImageY}]))
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