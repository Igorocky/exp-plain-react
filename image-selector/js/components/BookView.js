"use strict";

const BookView = () => {
    const {renderSelectedArea} = SelectedAreaRenderer()

    //state props
    const s = {
        BOOK: 'BOOK',
        VIEW_CURR_Y: 'VIEW_CURR_Y',
        VIEW_MAX_Y: 'VIEW_MAX_Y',
        VIEW_HEIGHT: 'VIEW_HEIGHT',
        SCROLL_SPEED: 'SCROLL_SPEED',
        SELECTIONS: 'SELECTIONS',
        FOCUSED_SELECTION_ID: 'FOCUSED_SELECTION_ID',
        EDIT_MODE: 'EDIT_MODE',
    }

    //scroll speed
    const ss = {
        SPEED_1: 'SPEED_1',
        SPEED_2: 'SPEED_2',
        SPEED_3: 'SPEED_3',
    }

    //edit mode
    const em = {
        RENAME: 'RENAME',
        MODIFY_BOUNDARIES: 'MODIFY_BOUNDARIES',
    }

    const [state, setState] = useState(() => createState({}))
    const [ready, setReady] = useState(false)
    const [openConfirmActionDialog, closeConfirmActionDialog, renderConfirmActionDialog] = useConfirmActionDialog()
    const {
        getCursorType:getCursorTypeForImageSelector,
        renderControlButtons: renderControlButtonsOfImageSelector,
        renderSelectedArea:renderEditedSelectedArea,
        renderDots,
        clickHandler: imageSelectorClickHandler,
        renderDisplayModeSelector,
        state:imageSelectorState,
        stateAttrs: imageSelectorStateAttrs,
        displayModes: imageSelectorDisplayModes,
        renderSettings,
        setSelections: setSelectionsForImageSelector
    } = useImageSelector({
        onCancel: () => setState(prev=>prev.set(s.EDIT_MODE,null)),
        onSave: newParts => setState(prev=>{
            const newState = objectHolder(prev)
            const focusedId = prev[s.FOCUSED_SELECTION_ID]
            const idxToModify = prev[s.SELECTIONS].map((s,idx) => ({id: s.id, idx})).find(s => s.id == focusedId).idx
            const newSelections = sortBy(
                prev[s.SELECTIONS].modifyAtIdx(
                    idxToModify,
                    s => ({
                        ...s,
                        parts:newParts,
                        overallBoundaries: newParts.length?mergeSvgBoundaries(...newParts):null
                    })
                ),
                e => (e.overallBoundaries?.minY) ?? -1
            )
            newState.set(s.SELECTIONS, newSelections)
            newState.set(s.EDIT_MODE, null)
            return newState.get()
        })
    })

    useEffect(() => {
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
    }, [])

    function createState({prevState, params}) {
        const getParam = createParamsGetter({prevState, params})

        return createObj({
            [s.BOOK]: BOOK1,
            [s.VIEW_CURR_Y]: getParam(s.VIEW_CURR_Y, 0),
            [s.VIEW_HEIGHT]: getParam(s.VIEW_HEIGHT, 1300),
            [s.SCROLL_SPEED]: getParam(s.SCROLL_SPEED, ss.SPEED_1),
            [s.FOCUSED_SELECTION_ID]: getParam(s.FOCUSED_SELECTION_ID, 1),
            [s.SELECTIONS]: getParam(s.SELECTIONS, [
                {
                    id:1,
                    title:'selection 1',
                    parts:[],
                    overallBoundaries: null,
                },
                {
                    id:2,
                    title:'selection 2',
                    parts:[],
                    overallBoundaries: null,
                },
                {
                    id:3,
                    title:'selection 3',
                    parts:[],
                    overallBoundaries: null,
                },
            ]),
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
        let boundaries = new SvgBoundaries({minX:0, maxX:0, minY, maxY})
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
            }))
            svgContent.push(createRect({
                key:`page-delimiter-${page.y1}`,
                boundaries: new SvgBoundaries({minX:0, maxX:page.width, minY:page.y2-1, maxY:page.y2+2}),
                color: 'black'
            }))
            boundaries = boundaries.addPoints(new Point(page.width,minY))
        }

        const selectionIdToHide = state[s.EDIT_MODE]===em.MODIFY_BOUNDARIES?state[s.FOCUSED_SELECTION_ID]:null
        const selectionsToRender = state[s.SELECTIONS]
            .filter(s => hasValue(s.overallBoundaries))
            .filter(s => s.id != selectionIdToHide)
            .filter(s => rangesIntersect({
                r1:{y1:s.overallBoundaries.minY,y2:s.overallBoundaries.maxY},
                r2:{y1:minY,y2:maxY}
            }))
        for (let selection of selectionsToRender) {
            svgContent.push(renderSelectedArea({
                key:`selection-${selection.id}`,
                clipPathId:`selection-clipPath-${selection.id}`,
                color:'yellow',
                svgBoundaries: selection.parts,
            }).svgContent)
        }

        if (state[s.EDIT_MODE] === em.MODIFY_BOUNDARIES) {
            svgContent.push(
                renderEditedSelectedArea({
                    renderSelections: true,
                    clipPathId: 'clip-path-boundaries'
                }).svgContent
            )
            svgContent.push(
                ...renderDots()
            )
        }

        return {
            svgContent,
            boundaries
        }
    }

    function scroll({dy}) {
        const viewMaxY = state[s.VIEW_MAX_Y]
        const viewCurrY = state[s.VIEW_CURR_Y]
        setState(state.set(s.VIEW_CURR_Y, Math.max(0, Math.min(viewMaxY, viewCurrY+dy))))
    }

    function renderControlButtons() {

        const viewHeight = state[s.VIEW_HEIGHT]
        const scrollSpeed = state[s.SCROLL_SPEED] == ss.SPEED_1 ? viewHeight*0.05
                : state[s.SCROLL_SPEED] == ss.SPEED_2 ? viewHeight*0.5
                : viewHeight*0.95


        function getSpeedButtonColor(speed) {
            return state[s.SCROLL_SPEED] === speed ? 'rgb(150,150,255)' : undefined
        }

        const buttons = [[
            {icon:RE.Icon({style:{transform: "rotate(90deg)"}}, "skip_previous"), onClick: () => setState(state.set(s.VIEW_CURR_Y, 0))},
            {iconName:"expand_less", style:{}, onClick: () => scroll({dy:-1*scrollSpeed})},
            {iconName:"expand_more", style:{}, onClick: () => scroll({dy:scrollSpeed})},
            {icon:RE.Icon({style:{transform: "rotate(-90deg)"}}, "skip_previous"), onClick: () => setState(state.set(s.VIEW_CURR_Y, state[s.VIEW_MAX_Y]))},
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

    function renderPagination() {
        const pages = state[s.BOOK].pages
        const currY = state[s.VIEW_CURR_Y]
        const midY = currY + state[s.VIEW_HEIGHT]/2
        return re(Pagination,{
            numOfPages: pages.length,
            curPage:pages.map((p,i)=>({p,i})).find(({p,i}) => p.y1 <= midY && midY <= p.y2).i+1,
            onChange: newPage => setState(state.set(s.VIEW_CURR_Y, pages[newPage-1].y1))
        })
    }

    function onWheel({nativeEvent}) {
        scroll({dy:nativeEvent.deltaY})
    }

    function deleteSelection() {
        openConfirmActionDialog({
            confirmText: `Delete '${state[s.SELECTIONS][state[s.FOCUSED_SELECTION_IDX]].title}'?`,
            onCancel: closeConfirmActionDialog,
            startActionBtnText: "Delete",
            startAction: ({updateInProgressText,onDone}) => {
                setState(old => {
                    const newState = objectHolder(old)
                    const idx = old[s.FOCUSED_SELECTION_IDX];
                    newState.set(s.SELECTIONS, old[s.SELECTIONS].removeAtIdx(idx))
                    if (idx >= newState.get(s.SELECTIONS).length) {
                        newState.set(s.FOCUSED_SELECTION_IDX, newState.get(s.SELECTIONS).length-1)
                    }
                    return newState.get()
                })
                closeConfirmActionDialog()
            },
        })
    }

    function addNewSelection() {
        setState(old => old.set(
            s.SELECTIONS,
            [
                {
                    id: old[s.SELECTIONS].map(e=>e.id).max()+1,
                    title: 'New selection',
                    parts: []
                },
                ...old[s.SELECTIONS]
            ]
        ))
    }

    function modifyBoundariesOfSelection() {
        setState(prev=>prev.set(s.EDIT_MODE, em.MODIFY_BOUNDARIES))
        const focusedSelectionId = state[s.FOCUSED_SELECTION_ID]
        const parts = state[s.SELECTIONS].find(s=> s.id == focusedSelectionId).parts
        setSelectionsForImageSelector({selections: parts})
        setState(prev=>prev.set(s.VIEW_CURR_Y, parts.length?parts.map(p=>p.minY).min():prev[s.VIEW_CURR_Y]))
    }

    function renderSelectionsList() {
        const buttons = [[
            {iconName:"add", style:{}, onClick: addNewSelection},
            {iconName:"edit", style:{}, disabled: !state[s.SELECTIONS].length, onClick: modifyBoundariesOfSelection},
            {iconName:"delete_forever", style:{}, disabled: !state[s.SELECTIONS].length, onClick: deleteSelection},
        ]]

        return RE.Container.col.top.left({style:{padding: '5px'}},{style:{marginBottom:'2px'}},
            re(KeyPad, {
                componentKey: "book-selectionList-controlButtons",
                keys: buttons,
                variant: "outlined",
            }),
            state[s.SELECTIONS].map((selection,idx) => RE.Paper(
                {
                    key:`selection-${selection.id}-${selection.overallBoundaries?.minY??0}`,
                    style:{
                        backgroundColor:state[s.FOCUSED_SELECTION_ID] == selection.id ? 'yellow' : undefined,
                        padding:'5px',
                        cursor: 'pointer',
                    },
                    onClick: () => {
                        if (hasNoValue(state[s.EDIT_MODE])) {
                            setState(old => old.set(s.FOCUSED_SELECTION_ID, selection.id))
                        }
                    }
                },
                `${selection.title} | [${selection.parts?.length??0}]`
            ))
        )
    }

    function getCursorType() {
        if (hasNoValue(state[s.EDIT_MODE])) {
            return 'grab'
        } else {
            return getCursorTypeForImageSelector()
        }
    }

    function renderPages() {
        const {svgContent:viewableContentSvgContent, boundaries:viewableContentBoundaries} = renderViewableContent()

        const height = 800
        const width = height * (viewableContentBoundaries.width()/viewableContentBoundaries.height())
        return RE.Container.col.top.left({},{},
            renderPagination(),
            state[s.EDIT_MODE]===em.MODIFY_BOUNDARIES
                ? renderControlButtonsOfImageSelector()
                :null,
            RE.svg(
                {
                    width,
                    height,
                    boundaries: viewableContentBoundaries,
                    onClick: imageSelectorClickHandler,
                    onWheel,
                    props: {
                        style: {cursor: getCursorType()}
                    }
                },
                ...viewableContentSvgContent,
                createRect({
                    boundaries:viewableContentBoundaries,
                    opacity:0,
                    borderColor:'black',
                    key: 'book-view-boarder'
                })
            ),
            renderControlButtons(),
        )
    }

    if (!ready) {
        return "Loading..."
    } else {
        return RE.Container.row.left.top({},{},
            renderPages(),
            renderSelectionsList(),
            renderConfirmActionDialog()
        )
    }
}