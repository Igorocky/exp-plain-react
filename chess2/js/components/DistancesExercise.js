'use strict';

const DISTANCES_STAGE_QUESTION = "DISTANCES_STAGE_QUESTION"
const DISTANCES_STAGE_ANSWER = "DISTANCES_STAGE_ANSWER"

const DistancesExercise = ({configName}) => {
    const [maxDist, setMaxDist] = useState(4)
    const [cons, setCons] = useState(() => createConnections(maxDist))
    const [counts, setCounts] = useState(() => createCounts(cons))
    const {renderChessboard, checkCell, uncheckAllCells, showImageOnCell, hideImageOnAllCells} = useChessboard({
        cellSize:profVal(PROFILE_MOBILE, 40, PROFILE_FUJ, 72),
        configName:configName
    })
    const [curCon, setCurCon] = useState(() => nextRandomConnection({cons:cons,counts:counts}))
    const [stage, setStage] = useState(DISTANCES_STAGE_QUESTION)
    const [settingsOpened, setSettingsOpened] = useState(false)

    useEffect(
        () => {
            prepareCells(curCon)
            setCounts(inc(counts, curCon.idx))
        },
        []
    )

    const questionCellSize = profVal(PROFILE_MOBILE, 110, PROFILE_FUJ, 180) + "px"
    const tdStyle = {width: questionCellSize, height: questionCellSize}

    function createConnections(maxDist) {
        return ints(0,63).flatMap(i =>
            [12,2,3,4,6,8,9,10]
                .map(h => ({from:absNumToCell(i), dir:hourToDir(h)}))
                .flatMap(({from,dir}) => ints(1,maxDist).map(l => ({
                    from:from,dir:dir,len:l,cells:createRay(from.x, from.y, dir.dx, dir.dy).filter((c,i) => i<=l)
                })))
                .filter(con => isValidCell({x:con.from.x+con.dir.dx*con.len, y:con.from.y+con.dir.dy*con.len}))
                .map((con, i) => ({...con, idx:i}))
        )
    }

    function createCounts(cons) {
        return cons.map(c => 0)
    }

    function init(maxDist) {
        setMaxDist(maxDist)
        const cons = createConnections(maxDist);
        setCons(cons)
        const counts = createCounts(cons);
        const curCon = nextRandomConnection({cons:cons,counts:counts});
        setCounts(inc(counts, curCon.idx))
        setCurCon(curCon)
        setStage(DISTANCES_STAGE_QUESTION)
        prepareCells(curCon)
    }

    function nextRandomConnection({cons,counts}) {
        const minCnt = arrMin(counts)
        const consWithMinCnt = counts
            .map((c,i) => ({con:cons[i], cnt:c}))
            .filter(({con,cnt}) => cnt == minCnt)
            .map(({con,cnt}) => con)
        return consWithMinCnt[randomInt(0, consWithMinCnt.length-1)]
    }

    function prepareCells(curCon) {
        uncheckAllCells()
        hideImageOnAllCells()
        curCon.cells.forEach(showImageOnCell)
        checkCell(curCon.cells[0])
    }

    function renderCell({dir}) {
        return RE.td({
                style: {...tdStyle}
            },
            RE.Container.row.center.top({},{},
                getContentForBorderCell({dir:dir})
            )
        )
    }

    function getContentForBorderCell({dir}) {
        if (isSameDir(dir, curCon.dir)) {
            return RE.span({style:{fontSize: "80px"}}, curCon.len)
        } else {
            return ""
        }
    }

    function renderImage(cell) {
        return RE.img({
            src:"chess-board-configs/" + configName + "/" + getCellName(cell) + ".png",
            className: "cell-img"
        })
    }

    function renderQuestion() {
        return RE.table({className: "chessboard"}, RE.tbody({},
            RE.tr({},
                renderCell({dir:{dx:-1,dy:1}}),
                renderCell({dir:{dx:0,dy:1}}),
                renderCell({dir:{dx:1,dy:1}}),
            ),
            RE.tr({},
                renderCell({dir:{dx:-1,dy:0}}),
                RE.td({style: tdStyle, onClick: () => setSettingsOpened(true)}, renderImage(curCon.from)),
                renderCell({dir:{dx:1,dy:0}}),
            ),
            RE.tr({},
                renderCell({dir:{dx:-1,dy:-1}}),
                renderCell({dir:{dx:0,dy:-1}}),
                renderCell({dir:{dx:1,dy:-1}}),
            ),
        ))
    }

    function renderAnswer() {
        return renderChessboard({})
    }

    function renderCard() {
        if (stage == DISTANCES_STAGE_QUESTION) {
            return renderQuestion()
        } else if (stage == DISTANCES_STAGE_ANSWER) {
            return renderAnswer()
        }
    }
    
    function nextClicked() {
        if (stage == DISTANCES_STAGE_QUESTION) {
            setStage(DISTANCES_STAGE_ANSWER)
        } else if (stage == DISTANCES_STAGE_ANSWER) {
            const newCon = nextRandomConnection({cons:cons,counts:counts});
            setCurCon(newCon)
            setCounts(inc(counts, newCon.idx))
            prepareCells(newCon)
            setStage(DISTANCES_STAGE_QUESTION)
        }
    }

    function renderStat() {
        const minCnt = arrMin(counts)
        const remainingElems = counts.filter(c => c==minCnt).length
        return "Iteration: " + (minCnt+1) + ", remains: " + remainingElems
    }

    function onSettingsClose() {
        init(maxDist)
        setSettingsOpened(false)
    }

    function renderDistSelector({title, value, min, max, setter}) {
        return RE.Container.col.top.left({},{style:{}},
            RE.div({style:{width:"200px"}},
                RE.Slider({
                    value:value,
                    onChange: (event, newValue) => {
                        if (min <= newValue && newValue <= max) {
                            setter(newValue)
                        }
                    },
                    step:1,
                    min:min,
                    max:max,
                    valueLabelDisplay:"on"
                })
            ),
            RE.Typography({gutterBottom:true}, title)
        )
    }

    function renderSettings() {
        if (settingsOpened) {
            return RE.Dialog({open:true, onClose:onSettingsClose},
                RE.Container.col.top.left(
                    {style:{paddingTop:"50px", paddingLeft:"20px", paddingRight:"25px"}},
                    {style:{marginBottom: "50px"}},
                    renderDistSelector({title: "Distance", value:maxDist, min:1, max:7, setter:setMaxDist}),
                )
            )
        } else {
            return null
        }
    }

    return RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
        renderCard(),
        RE.span({}, renderStat()),
        RE.Container.row.center.top({},{style:{margin:"10px"}},
            RE.Button({onClick:nextClicked, style:{height:"100px", width:"100px"}}, "Next"),
        ),
        renderSettings(),
    )
}

