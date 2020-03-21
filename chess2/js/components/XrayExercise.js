'use strict';

const XRAY_EXERCISE_STAGE_QUESTION = "XRAY_EXERCISE_STAGE_QUESTION"
const XRAY_EXERCISE_STAGE_ANSWER = "XRAY_EXERCISE_STAGE_ANSWER"

const XrayExercise = ({configName}) => {
    const [counts, setCounts] = useState(() => ints(0,63).map(i => 0))
    const [currCellIdx, setCurrCellIdx] = useState(() => nextRandomCellIndex({counts:counts}))
    const [stage, setStage] = useState(XRAY_EXERCISE_STAGE_QUESTION)
    const {renderChessboard, checkCell, uncheckAllCells, showImageOnCell, hideImageOnAllCells} = useChessboard({
        cellSize:profVal(PROFILE_MOBILE, 40, PROFILE_FUJ, 72),
        configName:configName
    })

    useEffect(
        () => {
            prepareCells(currCellIdx)
            setCounts(inc(counts, currCellIdx))
        }, []
    )

    function nextRandomCellIndex({counts}) {
        const minCnt = arrMin(counts)
        const cellsWithMinCnt = counts
            .map((c,i) => ({idx:i, cnt:c}))
            .filter(({idx,cnt}) => cnt == minCnt)
            .map(({idx,cnt}) => idx)
        return cellsWithMinCnt[randomInt(0, cellsWithMinCnt.length-1)]
    }

    function allNeighbors(cell) {
        return [12,2,3,4,6,8,9,10].map(h => moveToCellRelatively(cell, hourToDir(h))).filter(isValidCell)
    }

    function isCentralCell({x,y}) {
        return (1 <= x && x <= 2 && 1 <= y && y <= 2)
            || (1 <= x && x <= 2 && 5 <= y && y <= 6)
            || (5 <= x && x <= 6 && 1 <= y && y <= 2)
            || (5 <= x && x <= 6 && 5 <= y && y <= 6)
    }

    function getCentralCellFor(cell) {
        const cellColor = isWhiteCell(cell)?0:1
        return allNeighbors(cell)
            .filter(isCentralCell)
            .map(cc => ({cc:cc,color:isWhiteCell(cc)?0:1}))
            .filter(cc => cellColor == cc.color)[0].cc
    }

    function buildXFor(cell) {
        const centralCell = getCentralCellFor(cell)
        const rays = [11,1,7,5].map(h => moveToCellRelatively(centralCell, hourToDir(h)))
        return [centralCell, ...rays]
    }

    function prepareCells(currCellIdx) {
        const currCell = absNumToCell(currCellIdx)
        const allCells = buildXFor(currCell)
        uncheckAllCells()
        hideImageOnAllCells()
        allCells.forEach(showImageOnCell)
        checkCell(currCell)
    }

    function renderQuestion() {
        const questionFontSize = 100
        const questionDivSizePx = questionFontSize*1.5 + "px"
        const cellName = cellNumToCellName(currCellIdx);
        return RE.Container.row.center.center({
                style:{
                    fontSize:questionFontSize + "px",
                    width: questionDivSizePx,
                    height: questionDivSizePx,
                },
            }, {},
            cellName
        )
    }

    function renderAnswer() {
        return renderChessboard({})
    }

    function renderCard() {
        if (stage == XRAY_EXERCISE_STAGE_QUESTION) {
            return renderQuestion()
        } else if (stage == XRAY_EXERCISE_STAGE_ANSWER) {
            return renderAnswer()
        }
    }
    
    function nextClicked() {
        if (stage == XRAY_EXERCISE_STAGE_QUESTION) {
            setStage(XRAY_EXERCISE_STAGE_ANSWER)
        } else if (stage == XRAY_EXERCISE_STAGE_ANSWER) {
            const newCellIdx = nextRandomCellIndex({counts:counts});
            setCurrCellIdx(newCellIdx)
            setCounts(inc(counts, newCellIdx))
            prepareCells(newCellIdx)
            setStage(XRAY_EXERCISE_STAGE_QUESTION)
        }
    }

    function renderStat() {
        const minCnt = arrMin(counts)
        const remainingElems = counts.filter(c => c==minCnt).length
        return "Iteration: " + (minCnt+1) + ", remains: " + remainingElems
    }

    return RE.Container.col.top.center({},{style:{marginBottom:"20px"}},
        renderCard(),
        RE.span({}, renderStat()),
        RE.Container.row.center.top({},{style:{margin:"10px"}},
            RE.Button({onClick:nextClicked, style:{height:"100px", width:"100px"}}, "Next"),
        ),
    )
}

