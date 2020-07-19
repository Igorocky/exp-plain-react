"use strict";

const MovementsExercise = () => {
    const s = {
        PHASE: 'PHASE',
        CURR_CON: 'CURR_CON',
        CON_COUNTS: 'CON_COUNTS',
    }

    const p = {
        QUESTION: 'QUESTION',
        ANSWER: 'ANSWER',
    }

    const ALL_CONNECTIONS = useMemo(() =>
        ints(0,63).flatMap(i =>
            [12,3,6,9]
                .map(h => ({from:absNumToCell(i), dir:hourToDir(h)}))
                .map(({from,dir}) => ({from, to:moveToCellRelatively(from,dir)}))
                .filter(({from,to}) => isValidCell(to))
        ).map((con,idx) => ({...con, idx}))
    )

    const [state, setState] = useState(() => createState())

    function createState() {
        const currCon = ALL_CONNECTIONS[randomInt(0,ALL_CONNECTIONS.length-1)];
        return createObj({
            [s.CURR_CON]: currCon,
            [s.CON_COUNTS]: inc(new Array(ALL_CONNECTIONS.length).fill(0), currCon.idx),
            [s.PHASE]: p.QUESTION,
        })
    }

    function nextRandomConnection({prevCon, conCounts}) {
        const possibleCons = ALL_CONNECTIONS
            .filter(con => equalCells(prevCon.to, con.from))
            .filter(con => !equalCells(con.to, prevCon.from))
            .map(con => ({...con, cnt:conCounts[con.idx]}))

        const minCnt = possibleCons.attr('cnt').min()

        const consWithMinCnt = possibleCons.filter(con => con.cnt == minCnt)

        return consWithMinCnt[randomInt(0,consWithMinCnt.length-1)]
    }

    function nextState(state) {
        if (state[s.PHASE] == p.QUESTION) {
            state = state.set(s.PHASE, p.ANSWER)
        } else {
            state = state.set(s.PHASE, p.QUESTION)
            state = state.set(s.CURR_CON, nextRandomConnection({prevCon:state[s.CURR_CON], conCounts:state[s.CON_COUNTS]}))
            state = state.set(s.CON_COUNTS, inc(state[s.CON_COUNTS], state[s.CURR_CON].idx))
        }
        return state
    }

    function renderStatistics() {
        return `numOfMoves=${state[s.CON_COUNTS].sum()}, minCnt=${state[s.CON_COUNTS].min()}, maxCnt=${state[s.CON_COUNTS].max()}`
    }

    function nextClicked() {
        const newState = ints(1,1).reduce((s,i)=>nextState(s),state)
        setState(newState)
    }

    function renderCircle({x, y, radius, stroke, strokeWidth}) {
        return svg.circle({key:`circle-${x}-${y}-${strokeWidth}`,
            cx:x, cy:y, r:radius,
            stroke, fill:'transparent', strokeWidth
        })
    }

    function renderCellImage({dist, dx, dy, radius, cellName}) {
        const size = ((radius**2)/2)**0.5*2;
        const imgCenterX = dx*dist;
        const x = imgCenterX-size/2
        const imgCenterY = dy*dist;
        const y = imgCenterY-size/2
        const href=`./chess-board-configs/config1/${cellName}.png`
        return svg.image({key:`img-${cellName}-${x}-${y}`, x, y, height:size, width:size, href})
    }

    function renderDots() {
        const dist = 10
        const radius = dist*0.15
        const circleStrokeWidthNormal = radius*0.01
        const circleStrokeWidthSelected = circleStrokeWidthNormal*8
        const imgRadius = radius-circleStrokeWidthSelected/2

        const minX = -(dist+dist*0.2+radius+circleStrokeWidthSelected)
        const xWidth = -minX*2
        const minY = minX
        const yWidth = xWidth

        const shapes = [];

        [[0,1],[-1,0],[1,0],[0,0],[0,-1]]
            .map(a=>a.map(c=>c*dist))
            .map(([x,y])=>renderCircle({x,y,radius,stroke:'black',strokeWidth:circleStrokeWidthNormal}))
            .forEach(c => shapes.push(c))

        const cellFrom = state[s.CURR_CON].from
        shapes.push(renderCellImage({dist, radius:imgRadius, dx:0, dy:0, cellName:getCellName(cellFrom)}))

        const cellTo = state[s.CURR_CON].to
        const dx = cellTo.x - cellFrom.x;
        const dy = cellTo.y - cellFrom.y;
        shapes.push(renderCircle({x:dx*dist,y:dy*dist,radius,stroke:'rgb(230,126,34)',strokeWidth:circleStrokeWidthSelected}))
        if (state[s.PHASE] == p.ANSWER) {
            shapes.push(renderCellImage({dist, radius:imgRadius, dx, dy, cellName:getCellName(cellTo)}))
        }

        return RE.svg({width:800, height:800, minX, minY, xWidth, yWidth},
            shapes
        )
    }

    return RE.Container.row.center.center({},{},
        RE.Container.col.top.center({},{},
            renderDots(),
            renderStatistics(),
            RE.Button({onClick: nextClicked}, 'Next'),
        )
    )
}