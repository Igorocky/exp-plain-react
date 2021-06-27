"use strict";

const BookView = () => {

    //state props
    const s = {
        BOOK: 'BOOK',
        VIEW_CURR_Y: 'VIEW_CURR_Y',
        VIEW_MAX_Y: 'VIEW_MAX_Y',
        VIEW_HEIGHT: 'VIEW_HEIGHT',
        SCROLL_SPEED: 'SCROLL_SPEED',
    }

    //scroll speed
    const ss = {
        SPEED_1: 'SPEED_1',
        SPEED_2: 'SPEED_2',
        SPEED_3: 'SPEED_3',
    }

    const [state, setState] = useState(() => createState({}))
    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (!ready) {
            const book = state[s.BOOK]
            let y = 0
            for (let page of book.pages) {
                page.y1 = y
                y += page.height
                page.y2 = y
            }
            book.maxY = y
            setState(state.set(s.VIEW_MAX_Y, book.maxY-state[s.VIEW_HEIGHT]))
            setReady(true)
        }
    }, [])

    function createState({prevState, params}) {
        const getParam = createParamsGetter({prevState, params})

        return createObj({
            [s.BOOK]: BOOK1,
            [s.VIEW_CURR_Y]: getParam(s.VIEW_CURR_Y, 0),
            [s.VIEW_HEIGHT]: getParam(s.VIEW_HEIGHT, 1700),
            [s.SCROLL_SPEED]: getParam(s.SCROLL_SPEED, ss.SPEED_1),
        })
    }

    function createRect({boundaries, key, color, opacity, borderColor}) {
        return boundaries.toRect({
            key,
            props: {
                fill: color,
                fillOpacity: opacity,
                strokeWidth: borderColor ? 1 : 0,
                stroke: borderColor,
            }
        })
    }

    function createClipPath({id, boundaries}) {
        return re('clipPath', {key:`clip-path-${id}`, id},
            createRect({boundaries, key:`clip-path-rect-${id}`})
        )
    }

    function renderImage({imgPath, key, x, y, width, height, clipPath}) {
        return re('image', {
            key,
            x,
            y,
            width,
            height,
            href: imgPath,
            clipPath
        })
    }

    function renderViewableContent() {
        function rangesDontIntersect({r1:{y1:a,y2:b}, r2:{y1:c,y2:d}}) {
            return b <= c || d <= a
        }
        function rangesIntersect(args) {
            return !rangesDontIntersect(args)
        }

        const minY = state[s.VIEW_CURR_Y]
        const maxY = minY + state[s.VIEW_HEIGHT]

        const svgContent = []
        let boundaries = new SvgBoundaries(0,0,minY,maxY)
        const book = state[s.BOOK]
        const pagesToRender = state[s.BOOK].pages.filter(p => rangesIntersect({r1:{y1:p.y1,y2:p.y2}, r2:{y1:minY,y2:maxY}}))

        for (let page of pagesToRender) {
            svgContent.push(renderImage({
                imgPath: `${book.basePath}/${page.fileName}`,
                key: `page-img-${page.y1}`,
                x:0,
                y:page.y1,
                height: page.height,
                width: page.width,
                clipPath:'url(#viewableContent)'
            }))
            boundaries = boundaries.addPoints(new Point(page.width,minY))
        }

        return {
            svgContent:[
                createClipPath({id:'viewableContent', boundaries}),
                ...svgContent
            ],
            boundaries
        }
    }

    function renderControlButtons() {
        const viewMaxY = state[s.VIEW_MAX_Y]
        const viewCurrY = state[s.VIEW_CURR_Y]
        const viewHeight = state[s.VIEW_HEIGHT]
        const scrollSpeed = state[s.SCROLL_SPEED] == ss.SPEED_1 ? viewHeight*0.05
                : state[s.SCROLL_SPEED] == ss.SPEED_2 ? viewHeight*0.5
                : viewHeight*0.95


        function getSpeedButtonColor(speed) {
            return state[s.SCROLL_SPEED] === speed ? 'rgb(150,150,255)' : undefined
        }

        function scroll({dir = +1, dy}) {
            setState(state.set(s.VIEW_CURR_Y, Math.max(0, Math.min(viewMaxY, viewCurrY+dir*dy))))
        }

        const buttons = [[
            {icon:RE.Icon({style:{transform: "rotate(90deg)"}}, "skip_previous"), onClick: () => null},
            {iconName:"expand_less", style:{}, onClick: () => scroll({dir:-1,dy:scrollSpeed})},
            {iconName:"expand_more", style:{}, onClick: () => scroll({dir:1,dy:scrollSpeed})},
            {icon:RE.Icon({style:{transform: "rotate(-90deg)"}}, "skip_previous"), onClick: () => null},
            {symbol:"1x", style:{backgroundColor:getSpeedButtonColor(ss.SPEED_1)}, onClick: () => setState(state.set(s.SCROLL_SPEED, ss.SPEED_1))},
            {symbol:"2x", style:{backgroundColor:getSpeedButtonColor(ss.SPEED_2)}, onClick: () => setState(state.set(s.SCROLL_SPEED, ss.SPEED_2))},
            {symbol:"3x", style:{backgroundColor:getSpeedButtonColor(ss.SPEED_3)}, onClick: () => setState(state.set(s.SCROLL_SPEED, ss.SPEED_3))},
        ]]

        return re(KeyPad, {
            componentKey: "book-controlButtons",
            keys: buttons,
            variant: "outlined",
        })
    }

    if (!ready) {
        return "Loading..."
    } else {
        const {svgContent:viewableContentSvgContent, boundaries:viewableContentBoundaries} = renderViewableContent()

        return RE.Container.col.top.center({},{},
            renderControlButtons(),
            RE.svg(
                {
                    width: 800,
                    height: 800,
                    boundaries: viewableContentBoundaries,
                },
                ...viewableContentSvgContent,
                createRect({
                    boundaries:viewableContentBoundaries,
                    opacity:0,
                    borderColor:'red',
                    key: 'ddadsasdas'
                })
            ),
        )
    }
}