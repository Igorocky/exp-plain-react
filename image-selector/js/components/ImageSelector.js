"use strict";

const ImageSelector = () => {

    const s = {
        SELECTED_POINT: 'SELECTED_POINT',
        SELECTED_BOUNDARIES: 'SELECTED_BOUNDARIES',
        DISPLAY_MODE: 'DISPLAY_MODE',
        SELECTED_RECT_IDX: 'SELECTED_RECT_IDX',
        EDIT_MODE: 'EDIT_MODE',
        MOVE_SPEED: 'MOVE_SPEED',
    }

    const dm = {
        OVERLAPPING_RECTANGLES: 'OVERLAPPING_RECTANGLES',
        MERGED_RECTANGLES: 'MERGED_RECTANGLES',
        COLORED_MERGED_RECTANGLES: 'COLORED_MERGED_RECTANGLES',
        CLIPPED_INFO: 'CLIPPED_INFO',
        EDIT_SELECTION: 'EDIT_SELECTION',
    }

    const em = {
        MOVE: 'MOVE',
        RESIZE_LEFT: 'RESIZE_LEFT',
        RESIZE_RIGHT: 'RESIZE_RIGHT',
        RESIZE_TOP: 'RESIZE_TOP',
        RESIZE_BOTTOM: 'RESIZE_BOTTOM',
    }

    const ms = {
        SPEED_1: 'SPEED_1',
        SPEED_2: 'SPEED_2',
        SPEED_3: 'SPEED_3',
    }

    const [state, setState] = useState(() => createState({}))

    function createState({prevState, params}) {
        const getParam = createParamsGetter({prevState, params})

        return createObj({
            [s.SELECTED_POINT]: null,
            [s.SELECTED_BOUNDARIES]: [],
            [s.DISPLAY_MODE]: dm.OVERLAPPING_RECTANGLES,
            [s.SELECTED_RECT_IDX]: 0,
            [s.EDIT_MODE]: em.MOVE,
            [s.MOVE_SPEED]: ms.SPEED_1,
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
        const displayMode = state[s.DISPLAY_MODE]
        let ci = 0
        function getNextColor() {
            if (displayMode === dm.OVERLAPPING_RECTANGLES) {
                return 'green'
            } else if (displayMode === dm.COLORED_MERGED_RECTANGLES) {
                return colors[ci++ % colors.length]
            } else if (displayMode === dm.MERGED_RECTANGLES) {
                return 'green'
            } else if (displayMode === dm.EDIT_SELECTION) {
                return 'yellow'
            }
        }

        let boundaries = state[s.SELECTED_BOUNDARIES]
        if (displayMode !== dm.OVERLAPPING_RECTANGLES && displayMode !== dm.EDIT_SELECTION) {
            boundaries = normalizeBoundaries(boundaries)
        }
        const numOfRects = boundaries.length

        function createRect({boundaries, id, color, isSelected}) {
            return boundaries.toRect({
                key: `rect-${id}`,
                props: {
                    fill: color,
                    fillOpacity: 0.5,
                    strokeWidth: isSelected ? 1 : 0,
                    stroke: isSelected ? 'blue' : undefined
                }
            })
        }

        const rectangles = []
        for (let i = 0; i < numOfRects; i++) {
            const b = boundaries[i]
            const id = `${displayMode}-${i}-${b.minX}-${b.minY}-${b.maxX}-${b.maxY}`
            const color = getNextColor()
            rectangles.push(
                createRect({
                    boundaries:boundaries[i], id, color,
                    isSelected: state[s.DISPLAY_MODE] === dm.EDIT_SELECTION && state[s.SELECTED_RECT_IDX] === i
                })
            )
        }
        const rectBoundaries = boundaries.length == 0 ? null : boundaries.reduce((a,b) => mergeSvgBoundaries(a,b))
        const result = []
        if (displayMode === dm.CLIPPED_INFO) {
            result.push(
                re('clipPath', {key:`clip-path-boundaries`, id: 'clip-path-boundaries'},
                    rectangles
                )
            )
            if (hasValue(rectBoundaries)) {
                result.push(
                    rectBoundaries.toRect({
                        key: `overall-boundary`,
                        color: 'lightgrey',
                        strokeWidth: 1,
                    })
                )
            }
        } else {
            result.push(...rectangles)
        }
        return {svgRectangles:result, rectBoundaries}
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
        if (state[s.DISPLAY_MODE] === dm.OVERLAPPING_RECTANGLES
            || state[s.DISPLAY_MODE] === dm.COLORED_MERGED_RECTANGLES
            || state[s.DISPLAY_MODE] === dm.MERGED_RECTANGLES) {
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
        } else if (state[s.DISPLAY_MODE] === dm.EDIT_SELECTION) {
            const found = state[s.SELECTED_BOUNDARIES]
                .map((b,i) => ({boundaries:b,idx:i}))
                .find(({boundaries,idx}) => boundaries.includesPoint(clickedPoint))
            if (hasValue(found)) {
                setState(state.set(
                    s.SELECTED_RECT_IDX,
                    found.idx
                ))
            }
        }
    }

    function getCursorType() {
        if (state[s.DISPLAY_MODE] === dm.CLIPPED_INFO) {
            return 'auto'
        } else if (state[s.DISPLAY_MODE] === dm.EDIT_SELECTION) {
            return 'pointer'
        } else {
            return 'crosshair'
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

    function intersects(b1,b2) {
        function noOverlap(b1,b2) {
            return b1.maxX < b2.minX || b2.maxX < b1.minX || b1.maxY < b2.minY || b2.maxY < b1.minY
        }
        return !noOverlap(b1,b2)
    }

    function canCombineVert(b1, b2) {
        return intersects(b1,b2) && b1.minX === b2.minX && b1.maxX === b2.maxX
    }

    function combineVert(b1, b2) {
        return SvgBoundaries.fromPoints(
            new Point(b1.minX, Math.min(b1.minY, b2.minY)),
            new Point(b1.maxX, Math.max(b1.maxY, b2.maxY)),
        )
    }

    function canCombineHor(b1, b2) {
        return intersects(b1,b2) && b1.minY === b2.minY && b1.maxY === b2.maxY
    }

    function combineHor(b1, b2) {
        return SvgBoundaries.fromPoints(
            new Point(Math.min(b1.minX, b2.minX), b1.minY),
            new Point(Math.max(b1.maxX, b2.maxX), b1.maxY),
        )
    }

    function normalize(b1, b2) {
        if (b1.getPoints().every(p => b2.includesPoint(p))) {
            return [b2]
        } else if (b2.getPoints().every(p => b1.includesPoint(p))) {
            return [b1]
        } else if (canCombineVert(b1, b2)) {
            return [combineVert(b1, b2)]
        } else if (canCombineHor(b1, b2)) {
            return [combineHor(b1, b2)]
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
            removeAtIdx(boundaries,i)
            i = findSmallBoundaries(boundaries)
        }
    }

    function combine(boundaries, canCombine, doCombine) {
        function findBoundariesToCombine() {
            for (let i = 0; i < boundaries.length-1; i++) {
                for (let j = i+1; j < boundaries.length; j++) {
                    const b1 = boundaries[i]
                    const b2 = boundaries[j]
                    if (canCombine(b1,b2)) {
                        return [i,j]
                    }
                }
            }
            return undefined
        }
        let ij = findBoundariesToCombine(boundaries)
        while (hasValue(ij)) {
            const b1 = removeAtIdx(boundaries, ij[0])
            const b2 = removeAtIdx(boundaries, ij[1]-1)
            boundaries.push(doCombine(b1,b2))
            ij = findBoundariesToCombine(boundaries)
        }
    }

    function normalizeBoundaries(allBoundaries) {
        allBoundaries = [...allBoundaries]
        removeSmallBoundaries(allBoundaries)
        let ij = findIntersectingBoundaries(allBoundaries)
        let cnt = 0
        while (hasValue(ij)) {
            cnt++
            const b1 = removeAtIdx(allBoundaries, ij[0])
            const b2 = removeAtIdx(allBoundaries, ij[1]-1)
            allBoundaries.push(...normalize(b1,b2))
            removeSmallBoundaries(allBoundaries)
            ij = findIntersectingBoundaries(allBoundaries)
        }
        combine(allBoundaries, canCombineVert, combineVert)
        combine(allBoundaries, canCombineHor, combineHor)
        return allBoundaries
    }

    function renderImage({clipPath, id}) {
        return re('image', {
            key: `bgrd-img-${id}`,
            x: 0,
            y: 0,
            width: imgWidth,
            height: imgHeight,
            href: 'img/p1.png',
            clipPath
        })
    }

    function renderModeSelector() {
        return RE.RadioGroup({
                row: true,
                value: state[s.DISPLAY_MODE],
                onChange: (event,newValue) => {
                    setState(prev => prev.set(s.DISPLAY_MODE, newValue))
                }
            },
            RE.FormControlLabel({label: dm.OVERLAPPING_RECTANGLES, value: dm.OVERLAPPING_RECTANGLES,
                control: RE.Radio({})}),
            RE.FormControlLabel({label: dm.COLORED_MERGED_RECTANGLES, value: dm.COLORED_MERGED_RECTANGLES,
                control: RE.Radio({})}),
            RE.FormControlLabel({label: dm.MERGED_RECTANGLES, value: dm.MERGED_RECTANGLES,
                control: RE.Radio({})}),
            RE.FormControlLabel({label: dm.EDIT_SELECTION, value: dm.EDIT_SELECTION,
                control: RE.Radio({})}),
            RE.FormControlLabel({label: dm.CLIPPED_INFO, value: dm.CLIPPED_INFO,
                control: RE.Radio({})}),
        )
    }

    function renderControlButtons() {
        const moveSpeed = state[s.MOVE_SPEED] == ms.SPEED_1 ? 1 : state[s.MOVE_SPEED] == ms.SPEED_2 ? 5 : 20
        const dirLeft = SVG_EX.rotate(180)
        const dirRight = SVG_EX
        const dirUp = SVG_EX.rotate(90)
        const dirDown = SVG_EX.rotate(-90)

        function move({dir}) {
            setState(state.set(s.SELECTED_BOUNDARIES, state[s.SELECTED_BOUNDARIES].modifyAtIdx(state[s.SELECTED_RECT_IDX], b => b.translate(dir,moveSpeed))))
        }

        function resize({dir}) {
            function resizeInner({dir,boundaries}) {
                if (state[s.EDIT_MODE] == em.RESIZE_LEFT) {
                    return new SvgBoundaries(boundaries.minX + dir.end.x, boundaries.maxX, boundaries.minY, boundaries.maxY)
                } else if (state[s.EDIT_MODE] == em.RESIZE_RIGHT) {
                    return new SvgBoundaries(boundaries.minX, boundaries.maxX + dir.end.x, boundaries.minY, boundaries.maxY)
                } else if (state[s.EDIT_MODE] == em.RESIZE_TOP) {
                    return new SvgBoundaries(boundaries.minX, boundaries.maxX, boundaries.minY + dir.end.y, boundaries.maxY)
                } else if (state[s.EDIT_MODE] == em.RESIZE_BOTTOM) {
                    return new SvgBoundaries(boundaries.minX, boundaries.maxX, boundaries.minY, boundaries.maxY + dir.end.y)
                }
            }

            setState(state.set(
                s.SELECTED_BOUNDARIES,
                state[s.SELECTED_BOUNDARIES].modifyAtIdx(state[s.SELECTED_RECT_IDX], b => resizeInner({dir,boundaries:b}))
            ))
        }

        function dirBtnClicked({dir}) {
            if (state[s.EDIT_MODE] == em.MOVE) {
                move({dir})
            } else {
                resize({dir:dir.scale(moveSpeed)})
            }
        }

        function isDirBtnActive({dir}) {
            if (state[s.EDIT_MODE] == em.RESIZE_BOTTOM || state[s.EDIT_MODE] == em.RESIZE_TOP) {
                return Math.abs(dir.end.x) < 0.1
            } else if (state[s.EDIT_MODE] == em.RESIZE_LEFT || state[s.EDIT_MODE] == em.RESIZE_RIGHT) {
                return Math.abs(dir.end.y) < 0.1
            } else {
                return true
            }
        }

        function getEditButtonColor(moveMode) {
            return state[s.EDIT_MODE] === moveMode ? 'rgb(150,150,255)' : undefined
        }

        function getSpeedButtonColor(speed) {
            return state[s.MOVE_SPEED] === speed ? 'rgb(150,150,255)' : undefined
        }

        function remove() {
            setState(
                state
                    .set(
                        s.SELECTED_BOUNDARIES,
                        state[s.SELECTED_BOUNDARIES].removeAtIdx(state[s.SELECTED_RECT_IDX])
                    )
                    .set(
                        s.SELECTED_RECT_IDX,
                        Math.max(0,state[s.SELECTED_RECT_IDX]-1)
                    )
            )
        }

        if (state[s.DISPLAY_MODE] === dm.EDIT_SELECTION) {
            const buttons = [[
                {iconName:"control_camera", style:{backgroundColor:getEditButtonColor(em.MOVE)}, onClick: () => setState(state.set(s.EDIT_MODE, em.MOVE))},
                {iconName:"skip_previous", style:{backgroundColor:getEditButtonColor(em.RESIZE_LEFT)}, onClick: () => setState(state.set(s.EDIT_MODE, em.RESIZE_LEFT))},
                {icon:RE.Icon({style:{transform: "rotate(90deg)"}}, "skip_previous"), style:{backgroundColor:getEditButtonColor(em.RESIZE_TOP)}, onClick: () => setState(state.set(s.EDIT_MODE, em.RESIZE_TOP))},
                {icon:RE.Icon({style:{transform: "rotate(-90deg)"}}, "skip_previous"), style:{backgroundColor:getEditButtonColor(em.RESIZE_BOTTOM)}, onClick: () => setState(state.set(s.EDIT_MODE, em.RESIZE_BOTTOM))},
                {iconName:"skip_next", style:{backgroundColor:getEditButtonColor(em.RESIZE_RIGHT)}, onClick: () => setState(state.set(s.EDIT_MODE, em.RESIZE_RIGHT))},
                {iconName:"chevron_left", onClick: () => dirBtnClicked({dir:dirLeft}), disabled: !isDirBtnActive({dir:dirLeft})},
                {iconName:"expand_less", onClick: () => dirBtnClicked({dir:dirUp}), disabled: !isDirBtnActive({dir:dirUp})},
                {iconName:"expand_more", onClick: () => dirBtnClicked({dir:dirDown}), disabled: !isDirBtnActive({dir:dirDown})},
                {iconName:"chevron_right", onClick: () => dirBtnClicked({dir:dirRight}), disabled: !isDirBtnActive({dir:dirRight})},
                {symbol:"1x", style:{backgroundColor:getSpeedButtonColor(ms.SPEED_1)}, onClick: () => setState(state.set(s.MOVE_SPEED, ms.SPEED_1))},
                {symbol:"2x", style:{backgroundColor:getSpeedButtonColor(ms.SPEED_2)}, onClick: () => setState(state.set(s.MOVE_SPEED, ms.SPEED_2))},
                {symbol:"3x", style:{backgroundColor:getSpeedButtonColor(ms.SPEED_3)}, onClick: () => setState(state.set(s.MOVE_SPEED, ms.SPEED_3))},
                {iconName:"delete_forever", onClick: remove},
            ]]

            return re(KeyPad, {
                componentKey: "controlButtons",
                keys: buttons,
                variant: "outlined",
            })
        }
    }

    const imgPath = '/img/book/p1.png'
    const imgWidth = 1122
    const imgHeight = 767

    const isClippedDisplayMode = state[s.DISPLAY_MODE] === dm.CLIPPED_INFO

    const {svgRectangles, rectBoundaries} = renderRectangles()

    const svgBoundaries = !isClippedDisplayMode
        ? new SvgBoundaries(0, imgWidth, 0, imgHeight)
        : rectBoundaries?.addAbsoluteMargin(5)??new SvgBoundaries(0, imgWidth, 0, imgHeight)


    return RE.Container.col.top.center({},{},
        renderModeSelector(),
        RE.svg(
            {
                width: svgBoundaries.width(),
                height: svgBoundaries.height(),
                boundaries: svgBoundaries,
                onClick: (clickImageX, clickImageY, nativeEvent) => {
                    if (nativeEvent.type === 'mouseup') {
                        processClick({clickedPoint: new Point(clickImageX,clickImageY)})
                    }
                },
                props: {
                    style: {cursor: getCursorType()}
                }
            },
            renderImage({clipPath: isClippedDisplayMode ? `url(#clip-path-boundaries)` : undefined}),
            ...renderDots(),
            ...svgRectangles,
        ),
        renderControlButtons()
    )
}