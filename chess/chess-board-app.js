'use strict';

const revert = list => _.reduceRight(
    list,
    (memo, elem) => {
        memo.push(elem)
        return memo
    },
    []
)

const XX = ["a","b","c","d","e","f","g","h"]
const YY = ["1","2","3","4","5","6","7","8"]
const BOARD = []
for (let y = _.size(YY)-1; y >= 0; y--) {
    BOARD.push([])
    for (let x = 0; x < _.size(XX); x++) {
        _.last(BOARD).push({x:x,y:y, isWhite:(x+y)%2===1})
    }
}
function ints(start, end) {
    let i = start
    const res = [];
    while (i <= end) {
        res.push(i)
        i++
    }
    return res
}

function flatMap(list, func) {
    const res = []
    _.each(list, elem=>res.push(...func(elem)))
    return res
}

function combs(gens) {
    if (_.size(gens) == 0) return [[]]
    return flatMap(_.first(gens), elem=>_.map(combs(_.rest(gens)), comb=>[elem,...comb]))
}

function getCellName(cell) {
    return XX[cell.x] + YY[cell.y]
}

const HIDE_IMAGE_MSG = "HIDE_IMAGE_MSG"
const SHOW_IMAGE_MSG = "SHOW_IMAGE_MSG"
const HIDE_COORDS_MSG = "HIDE_COORDS_MSG"
const SHOW_COORDS_MSG = "SHOW_COORDS_MSG"
const CHECK_CELL = "CHECK_CELL"
const UNCHECK_CELL = "UNCHECK_CELL"

class ChessBoardCell extends React.Component {
    constructor(props) {
        super(props)
        this.cellName = XX[this.props.x] + YY[this.props.y]
        this.state={...props, isImage:false, showCoords: false, checked: false}
    }

    render() {
        return re(
            'div',
            {
                className:"chess-board-cell " + (this.state.checked?"checked-cell":(this.props.isWhite?"white-cell":"black-cell")),
                style: {width: this.props.size, height: this.props.size},
                onClick: ()=> {
                    if (this.props.onClick) {
                        this.props.onClick({x:this.props.x, y:this.props.y})
                    }
                    // this.flip()
                }
            },
            this.getContent()
        )
    }

    getContent() {
        if (this.state.isImage) {
            return re('img', {src:"./chess/chess-board-configs/" + this.props.configName
                    + "/" + this.cellName + ".png",
                className: "cell-img"})
        } else if (this.state.showCoords) {
            return re('div',{className: "cell-text"},this.cellName)
        } else {
            return re('div',{className: "cell-text"})
        }
    }

    flip() {
        this.setState((state,props)=>({isImage: !state.isImage}))
    }

    componentDidMount() {
        addMessageListener({name:this.getMsgListenerName(), callback:msgContent => {
            if (HIDE_IMAGE_MSG === msgContent) {
                this.setState((state,props)=>({isImage: false}))
            } else if (SHOW_IMAGE_MSG === msgContent) {
                this.setState((state,props)=>({isImage: true}))
            } else if (HIDE_COORDS_MSG === msgContent) {
                this.setState((state,props)=>({showCoords: false}))
            } else if (SHOW_COORDS_MSG === msgContent) {
                this.setState((state,props)=>({showCoords: true}))
            } else if (CHECK_CELL === msgContent) {
                this.setState((state,props)=>({checked: true}))
            } else if (UNCHECK_CELL === msgContent) {
                this.setState((state,props)=>({checked: false}))
            }
        }})
    }

    componentWillUnmount() {
        removeMessageListener(this.getMsgListenerName())
    }

    getMsgListenerName() {
        return "cell-" + this.cellName
    }
}

class ChessBoard extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }

    render() {
        return re('table', {className: "chessboard"},
            re('tbody', {className: "chessboard"},
                _.map(BOARD, (row, ri) =>
                    re('tr', {key: ri},
                        _.map(row, (cell, ci) =>
                            re('td', {key: ci},
                                re(ChessBoardCell, {
                                    ...cell,
                                    onClick: this.props.onClick,
                                    configName: this.props.configName,
                                    size: this.props.cellSize
                                })
                            )
                        )
                    )
                )
            )
        )
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);
        if (this.props.onMount) {
            this.props.onMount()
        }
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    handleKeyDown(event) {
        if (event.keyCode === 27) {
            hideAllImages()
        }
    }
}

class MoveTrainer extends React.Component {
    constructor(props) {
        super(props)
        this.state={cellsToAsk:[], currentCell:null}
    }

    render() {
        let style = {marginLeft:"50px"}
        return re(HContainer,{},
            this.renderCurrentCellButton(),
            re(Button,{key:"Next",variant:"contained", color:"primary", onClick: ()=>this.nextCell(), style:style}, "Next"),
            re(Button,{key:"Night",variant:"contained", color:"primary", onClick: ()=>this.openCellsForKnight(), style:style}, "Night"),
            re(Button,{key:"Queen",variant:"contained", color:"primary", onClick: ()=>this.openCellsForQueen(), style:style}, "Queen")
        )
    }

    renderCurrentCellButton() {
        return this.state.currentCell
            ? re(
                Button,
                {
                    key:"currentCellButton",
                    variant:"contained",
                    color:"primary",
                    onClick: ()=>this.openCurrentCell()
                },
                this.getCurrentCellName()
            )
            : null
    }

    getCurrentCellName() {
        return this.state.currentCell?XX[this.state.currentCell.x]+YY[this.state.currentCell.y]:null
    }

    nextCell() {
        hideAllImages()
        let cellsToAsk = this.state.cellsToAsk
        if (_.size(cellsToAsk)===0) {
            for (let x = 0; x < _.size(XX); x++) {
                for (let y = 0; y < _.size(YY); y++) {
                    cellsToAsk.push({x:x,y:y})
                }
            }
        }
        this.setState((state,props)=>{
            cellsToAsk = _.shuffle(cellsToAsk)
            return {currentCell: _.first(cellsToAsk), cellsToAsk:_.rest(cellsToAsk)}
        })
    }

    openCurrentCell() {
        if (!this.state.currentCell) {
            return;
        }
        resetBoard()
        openImage(this.state.currentCell,0,0)
    }

    openCellsForKnight() {
        if (!this.state.currentCell) {
            return;
        }
        resetBoard()
        openImage(this.state.currentCell,0,0)
        openImage(this.state.currentCell,-2,-1)
        openImage(this.state.currentCell,-2,+1)
        openImage(this.state.currentCell,-1,+2)
        openImage(this.state.currentCell,+1,+2)
        openImage(this.state.currentCell,+2,+1)
        openImage(this.state.currentCell,+2,-1)
        openImage(this.state.currentCell,+1,-2)
        openImage(this.state.currentCell,-1,-2)
    }

    openCellsForQueen() {
        if (!this.state.currentCell) {
            return;
        }
        resetBoard()
        for (let dx = 0; dx<8; dx++) {
            openImage(this.state.currentCell,dx,dx)
            openImage(this.state.currentCell,dx,-dx)
            openImage(this.state.currentCell,-dx,dx)
            openImage(this.state.currentCell,-dx,-dx)
            openImage(this.state.currentCell,dx,0)
            openImage(this.state.currentCell,-dx,0)
            openImage(this.state.currentCell,0,dx)
            openImage(this.state.currentCell,0,-dx)
        }
    }

    componentDidMount() {
        window.addEventListener("keydown", e => this.handleKeyDown(e));
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", e => this.handleKeyDown(e));
    }

    handleKeyDown(event) {
        console.log(event.keyCode);
        if (event.keyCode === 190) {
            this.nextCell()
        } else if (event.keyCode === 67) {
            this.openCurrentCell()
        } else if (event.keyCode === 78) {
            this.openCellsForKnight()
        } else if (event.keyCode === 81) {
            this.openCellsForQueen()
        }
    }
}

const CELL_TO_IMG = "CELL_TO_IMG"
const CELL_TO_IMG_WITH_NEIGHBOURS = "CELL_TO_IMG_WITH_NEIGHBOURS"
const IMG_TO_CELL = "IMG_TO_CELL"
const DIAGONALS = "DIAGONALS"
const DIAGONAL_SHORTCUTS = "DIAGONAL_SHORTCUTS"
const DIAGONAL_SHORTCUTS_REVERSE = "DIAGONAL_SHORTCUTS_REVERSE"
const CONNECTIONS = "CONNECTIONS"

class RandomElemSelector {
    constructor(params) {
        this.elemsGenerator = params.elemsGenerator
        this.reset()
    }

    getCurrentElem() {
        return this.state.currentElem
    }

    getIterationNumber() {
        return this.state.iterationNumber
    }

    getRemainingElements() {
        return _.size(this.state.elemsToAsk)
    }

    updateStateToNextElem() {
        let elemsToAsk = this.state.elemsToAsk
        if (_.size(elemsToAsk)===0) {
            elemsToAsk = this.elemsGenerator()
            this.state.iterationNumber += 1
        }
        elemsToAsk = _.shuffle(elemsToAsk)
        this.state.currentElem = _.first(elemsToAsk)
        this.state.elemsToAsk = _.rest(elemsToAsk)
    }

    reset() {
        this.state = {elemsToAsk: [], iterationNumber:0}
        this.updateStateToNextElem()
    }
}

class SeqElemSelector extends RandomElemSelector {
    constructor(params) {
        super(params)
    }

    updateStateToNextElem() {
        let elemsToAsk = this.state.elemsToAsk
        if (_.size(elemsToAsk)===0) {
            elemsToAsk = this.elemsGenerator()
            this.state.iterationNumber += 1
        }
        this.state.currentElem = _.first(elemsToAsk)
        this.state.elemsToAsk = _.rest(elemsToAsk)
    }
}

const listOfAllCellsGenerator = () => {
    const result = []
    for (let x = 0; x < _.size(XX); x++) {
        for (let y = 0; y < _.size(YY); y++) {
            result.push({x:x,y:y})
        }
    }
    return result;
}

function createListOfCellsGenerator(groups) {
    return () => {
        const result = []
        groups.forEach(i=>{
            const x = i%4;
            const y = Math.floor(i/4)
            result.push(...[{x:x,y:y},{x:x+4,y:y},{x:x,y:y+4},{x:x+4,y:y+4}])
        })
        return result
    }
}

const PHASE_CHECKED = "PHASE_CHECKED"
const PHASE_BASE_OPENED = "PHASE_BASE_OPENED"
const PHASE_NEIGHBOURS_CHECKED = "PHASE_NEIGHBOURS_CHECKED"
const PHASE_NEIGHBOURS_OPENED = "PHASE_NEIGHBOURS_OPENED"
class CellToImgExercise extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            randomCellSelector: new RandomElemSelector({elemsGenerator: listOfAllCellsGenerator}),
            randomNeighbourSelector: new RandomElemSelector({elemsGenerator: ()=>[1,2,3,4]}),
            phase:PHASE_CHECKED
        }
        this.handleKeyDownListener = e => this.handleKeyDown(e)
    }

    render() {
        return this.renderElems(
            re(ChessBoard, {configName: this.props.configName, cellSize: this.props.cellSize, onClick:()=>this.next()}),
            re(VContainer,{},
                re('div',{style:{paddingLeft:"30%"}},"Iteration: " + this.state.randomCellSelector.getIterationNumber()),
                re('div',{style:{paddingLeft:"30%"}},"Remaining elements: " + this.state.randomCellSelector.getRemainingElements())
            )
        )
    }

    renderElems(board, controls) {
        if (this.props.hMode) {
            return re(HContainer,{},board,controls)
        } else {
            return re(VContainer,{},board,controls)
        }
    }

    next() {
        this.setState((state,props)=>{
            if (state.phase===PHASE_CHECKED) {
                resetBoard()
                const currentCell = state.randomCellSelector.getCurrentElem()
                openImage(currentCell)
                if (this.props.withNeighbours) {
                    state.randomNeighbourSelector.reset()
                    this.getNeighbours(currentCell, state.randomNeighbourSelector.getCurrentElem())
                        .forEach(cell=>checkCell(cell))
                    return {phase:PHASE_NEIGHBOURS_CHECKED}
                } else {
                    return {phase:PHASE_BASE_OPENED}
                }
            } else if (state.phase===PHASE_NEIGHBOURS_CHECKED) {
                resetBoard()
                const currentCell = state.randomCellSelector.getCurrentElem()
                openImage(currentCell)
                this.getNeighbours(currentCell, state.randomNeighbourSelector.getCurrentElem())
                    .forEach(cell=>openImage(cell))
                return {phase:PHASE_NEIGHBOURS_OPENED}
            } else if (state.phase===PHASE_NEIGHBOURS_OPENED) {
                state.randomNeighbourSelector.updateStateToNextElem()
                if (state.randomNeighbourSelector.getIterationNumber()===1) {
                    resetBoard()
                    const currentCell = state.randomCellSelector.getCurrentElem()
                    openImage(currentCell)
                    this.getNeighbours(currentCell, state.randomNeighbourSelector.getCurrentElem())
                        .forEach(cell=>checkCell(cell))
                    return {phase:PHASE_NEIGHBOURS_CHECKED}
                } else {
                    resetBoard()
                    state.randomCellSelector.updateStateToNextElem()
                    checkCell(state.randomCellSelector.getCurrentElem())
                    return {phase: PHASE_CHECKED}
                }
            } else if (state.phase===PHASE_BASE_OPENED) {
                resetBoard()
                state.randomCellSelector.updateStateToNextElem()
                checkCell(state.randomCellSelector.getCurrentElem())
                return {phase: PHASE_CHECKED}
            }
        })
    }

    getNeighbours(baseCell, neighboursType) {
        if (neighboursType === 1) {
            return [{x:baseCell.x, y:baseCell.y-1}, {x:baseCell.x, y:baseCell.y+1}]
        } else if (neighboursType === 2) {
            return [{x:baseCell.x-1, y:baseCell.y}, {x:baseCell.x+1, y:baseCell.y}]
        } else if (neighboursType === 3) {
            return [{x:baseCell.x-1, y:baseCell.y-1}, {x:baseCell.x+1, y:baseCell.y+1}]
        } else if (neighboursType === 4) {
            return [{x:baseCell.x-1, y:baseCell.y+1}, {x:baseCell.x+1, y:baseCell.y-1}]
        }
    }

    componentDidMount() {
        checkCell(this.state.randomCellSelector.getCurrentElem())
        window.addEventListener("keydown", this.handleKeyDownListener);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDownListener);
    }

    handleKeyDown(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            this.next()
        }
    }
}

function isValidCell(cell) {
    return 0 <= cell.x && cell.x<_.size(XX) && 0 <= cell.y && cell.y<_.size(YY)
}

function createRay(x, y, dx, dy) {
    const result = [{x:x,y:y}]
    let nextCell = {x:result[0].x+dx,y:result[0].y+dy}
    while (isValidCell(nextCell)) {
        result.push(nextCell)
        nextCell = {x:nextCell.x+dx,y:nextCell.y+dy}
    }
    return result;
}

function createDiagonalByNumber(diagNumber) {
    if (diagNumber <= 8) {
        return createRay(0,8-diagNumber, 1,1)
    } else if (diagNumber <= 15) {
        return createRay(diagNumber-8,0, 1,1)
    } else if (diagNumber <= 23) {
        return createRay(23-diagNumber,7, 1,-1)
    } else if (diagNumber <= 30) {
        return createRay(0,30-diagNumber, 1,-1)
    } else if (diagNumber <= 38) {
        return createRay(diagNumber - 31,0, 0,1)
    } else if (diagNumber <= 46) {
        return createRay(0,diagNumber - 39, 1,0)
    }
}

function createSymbolByLineNumber(lineNumber) {
    const style = {fontSize:"3rem"}
    if (lineNumber <= 30) {
        let dir
        let dist
        let sign
        if (lineNumber <= 8) {
            dir = 0;
            dist = 8 - lineNumber
            sign = true;
        } else if (lineNumber <= 15) {
            dir = 0;
            dist = lineNumber - 8
            sign = false;
        } else if (lineNumber <= 23) {
            dir = 1;
            dist = 23 - lineNumber;
            sign = true;
        } else if (lineNumber <= 30) {
            dir = 1;
            dist = lineNumber - 23
            sign = false;
        }
        const dirElem = re('img', {key:"dir", src:"./chess/img/diag-sign-"+dir+".png"})
        const distElem = re('span', {key:"dist"}, sign?'+':'-', dist)
        return re('span', {style:style},
            dir%2===(sign?0:1)?[distElem,dirElem]:[dirElem,distElem]
        )
    } else if (lineNumber <= 46) {
        if (lineNumber <= 38) {
            return re('span', {style:style}, XX[lineNumber - 31])
        } else if (lineNumber <= 46) {
            return re('span', {style:style}, YY[lineNumber - 39])
        }
    }
}

function createListOfDiagonalsGenerator(diagNumbers) {
    return () => {
        const result = []
        diagNumbers.forEach(i=>result.push(createDiagonalByNumber(i)))
        return result
    }
}

const GTL = [[25, 7, 14, 21], [2, 8, 13, 20], [17, 26, 22, 11], [24, 6, 16, 29], [12, 3, 28, 19], [10, 18, 4, 27], [5, 15, 23, 9]]
const PHASE_DIAGONAL_CHECKED = "PHASE_DIAGONAL_CHECKED"
const PHASE_DIAGONAL_OPENED = "PHASE_DIAGONAL_OPENED"
class DiagonalsExercise extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            randomCellSelector: new RandomElemSelector({elemsGenerator: createListOfDiagonalsGenerator(ints(1,46))}),
            phase:PHASE_DIAGONAL_CHECKED
        }
        this.handleKeyDown = this.handleKeyDown.bind(this)
    }

    render() {
        return this.renderElems(
            re(ChessBoard, {configName: this.props.configName, cellSize: this.props.cellSize, onClick:()=>this.next()}),
            re(VContainer,{},
                re('div',{style:{paddingLeft:"30%"}},"Iteration: " + this.state.randomCellSelector.getIterationNumber()),
                re('div',{style:{paddingLeft:"30%"}},"Remaining elements: " + this.state.randomCellSelector.getRemainingElements())
            )
        )
    }

    renderElems(board, controls) {
        if (this.props.hMode) {
            return re(HContainer,{},board,controls)
        } else {
            return re(VContainer,{},board,controls)
        }
    }

    next() {
        this.setState((state,props)=>{
            if (state.phase===PHASE_DIAGONAL_CHECKED) {
                resetBoard()
                state.randomCellSelector.getCurrentElem().forEach(cell=>openImage(cell))
                return {phase:PHASE_DIAGONAL_OPENED}
            } else if (state.phase===PHASE_DIAGONAL_OPENED) {
                resetBoard()
                state.randomCellSelector.updateStateToNextElem()
                state.randomCellSelector.getCurrentElem().forEach(cell=>checkCell(cell))
                return {phase: PHASE_DIAGONAL_CHECKED}
            }
        })
    }

    componentDidMount() {
        this.state.randomCellSelector.getCurrentElem().forEach(cell=>checkCell(cell))
        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    handleKeyDown(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            this.next()
        }
    }
}

class DiagonalsShortcutsExercise extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            randomElemSelector: new RandomElemSelector({
                elemsGenerator: () => ints(1,46)
            }),
            phase: !this.props.reverse?PHASE_DIAGONAL_CHECKED:PHASE_DIAGONAL_OPENED
        }
        this.handleKeyDownListener = e => this.handleKeyDown(e)
    }

    render() {
        return this.renderElems(
            this.renderLine(),
            re(VContainer,{},
                re('div',{key:"iter",style:{paddingLeft:"30%"}},"Iteration: " + this.state.randomElemSelector.getIterationNumber()),
                re('div',{key:"remain",style:{paddingLeft:"30%"}},"Remaining elements: " + this.state.randomElemSelector.getRemainingElements())
            )
        )
    }

    renderLine() {
        const curElem = this.state.randomElemSelector.getCurrentElem()
        if (this.state.phase===PHASE_DIAGONAL_CHECKED) {
            return createSymbolByLineNumber(curElem)
        } else if (this.state.phase===PHASE_DIAGONAL_OPENED) {
            return re(ChessBoard, {
                configName: this.props.configName,
                cellSize: this.props.cellSize,
                onClick:()=>this.next(),
                onMount: () => createDiagonalByNumber(curElem).forEach(cell=>openImage(cell))
            })
        }
    }

    renderElems(board, controls) {
        if (this.props.hMode) {
            return re(HContainer,{},board,controls)
        } else {
            return re(VContainer,{},board,controls)
        }
    }

    next() {
        this.setState((state,props)=>{
            if (state.phase===PHASE_DIAGONAL_CHECKED) {
                if (this.props.reverse) {
                    state.randomElemSelector.updateStateToNextElem()
                }
                return {phase:PHASE_DIAGONAL_OPENED}
            } else if (state.phase===PHASE_DIAGONAL_OPENED) {
                if (!this.props.reverse) {
                    state.randomElemSelector.updateStateToNextElem()
                }
                return {phase: PHASE_DIAGONAL_CHECKED}
            }
        })
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDownListener);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDownListener);
    }

    handleKeyDown(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            this.next()
        }
    }
}

function createAllPossibleKnightMoves(cell) {
    return _.filter([
        moveToCellRelatively(cell,-2,-1),
        moveToCellRelatively(cell,-2,+1),
        moveToCellRelatively(cell,-1,+2),
        moveToCellRelatively(cell,+1,+2),
        moveToCellRelatively(cell,+2,+1),
        moveToCellRelatively(cell,+2,-1),
        moveToCellRelatively(cell,+1,-2),
        moveToCellRelatively(cell,-1,-2)
    ], c => isValidCell(c))
}

function createAllPossibleConnections(cell) {
    return [
        ...createRay(cell.x, cell.y, -1, -1),
        ...createRay(cell.x, cell.y, -1, 0),
        ...createRay(cell.x, cell.y, -1, 1),
        ...createRay(cell.x, cell.y, 0, -1),
        ...createRay(cell.x, cell.y, 0, 1),
        ...createRay(cell.x, cell.y, 1, -1),
        ...createRay(cell.x, cell.y, 1, 0),
        ...createRay(cell.x, cell.y, 1, 1),
        ...createAllPossibleKnightMoves(cell)
    ]
}

function calcConnections(cell) {
    return _.size(createAllPossibleConnections(cell)) - 8
}

const PHASE_IMAGE_SHOWN = "PHASE_IMAGE_SHOWN"
class CalculateConnectionsExercise extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            randomElemSelector: new RandomElemSelector({
                elemsGenerator: listOfAllCellsGenerator
            }),
            phase: PHASE_IMAGE_SHOWN
        }
        this.handleKeyDownListener = e => this.handleKeyDown(e)
    }

    render() {
        return this.renderElems(
            this.renderQuestionOrAnswer(),
            re(VContainer,{},
                this.state.phase===PHASE_DIAGONAL_OPENED
                    ?re('div',{key:"ANS:",style:{paddingLeft:"20%", fontWeight:"bold"}},"ANS: " + calcConnections(this.state.randomElemSelector.getCurrentElem()))
                    :null,
                re('div',{key:"iter",style:{paddingLeft:"30%"}},"Iteration: " + this.state.randomElemSelector.getIterationNumber()),
                re('div',{key:"remain",style:{paddingLeft:"30%"}},"Remaining elements: " + this.state.randomElemSelector.getRemainingElements())
            )
        )
    }

    renderQuestionOrAnswer() {
        const curElem = this.state.randomElemSelector.getCurrentElem()
        if (this.state.phase===PHASE_IMAGE_SHOWN) {
            return re('div',{style:{width: this.props.cellSize, height: this.props.cellSize}},
                re('img',
                    {
                        src:"./chess/chess-board-configs/"
                            + this.props.configName + "/" + getCellName(curElem) + ".png",
                        style:{maxHeight: "100%", maxWidth: "100%"}
                    }
                )
            )
        } else if (this.state.phase===PHASE_DIAGONAL_OPENED) {
            return re(ChessBoard, {
                configName: this.props.configName,
                cellSize: this.props.cellSize,
                onClick:()=>this.next(),
                onMount: () => createAllPossibleConnections(curElem).forEach(cell=>openImage(cell))
            })
        }
    }

    renderElems(board, controls) {
        if (this.props.hMode) {
            return re(HContainer,{},board,controls)
        } else {
            return re(VContainer,{},board,controls)
        }
    }

    next() {
        this.setState((state,props)=>{
            if (state.phase===PHASE_IMAGE_SHOWN) {
                return {phase:PHASE_DIAGONAL_OPENED}
            } else if (state.phase===PHASE_DIAGONAL_OPENED) {
                state.randomElemSelector.updateStateToNextElem()
                return {phase: PHASE_IMAGE_SHOWN}
            }
        })
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDownListener);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDownListener);
    }

    handleKeyDown(event) {
        if (event.keyCode === 13 || event.keyCode === 32) {
            this.next()
        }
    }
}

class ImgToCellExercise extends React.Component {
    constructor(props) {
        super(props)
        this.state={
            randomCellSelector: new RandomElemSelector({elemsGenerator: listOfAllCellsGenerator}),
            error:false
        }
    }

    render() {
        return this.renderElems(
            re(ChessBoard, {configName: this.props.configName, cellSize: this.props.cellSize, onClick:cell=>this.next(cell)}),
            re(VContainer,{},
                re('div',{style:{paddingLeft:"30%"}},"Iteration: " + this.state.randomCellSelector.getIterationNumber()),
                re('div',{style:{paddingLeft:"30%"}},"Remaining elements: " + this.state.randomCellSelector.getRemainingElements()),
                re('div',{style:{width: this.props.cellSize, height: this.props.cellSize, border:this.state.error?"5px red solid":null}},
                    re('img',
                        {
                            src:"./chess/chess-board-configs/"
                                + this.props.configName + "/" + this.getCurrentCellName() + ".png",
                            style:{maxHeight: "100%", maxWidth: "100%"}
                        }
                    )
                )
            )
        )
    }

    renderElems(board, controls) {
        if (this.props.hMode) {
            return re(HContainer,{},board,controls)
        } else {
            return re(VContainer,{},board,controls)
        }
    }

    next(clickedCell) {
        this.setState((state,props)=>{
            const currentCell = state.randomCellSelector.getCurrentElem()
            if (clickedCell.x===currentCell.x && clickedCell.y===currentCell.y) {
                state.randomCellSelector.updateStateToNextElem()
                return {randomCellSelector: state.randomCellSelector, error:false}
            } else {
                return {error:true}
            }
        })
    }

    getCurrentCellName() {
        return getCellName(this.state.randomCellSelector.getCurrentElem())
    }
}

class ChessBoardTrainer extends React.Component {
    constructor(props) {
        super(props)
        this.state={hMode:true, taskType: ""}
        this.compConstProps = {configName: this.props.configName}
    }

    render() {
        if (this.state.taskType === CELL_TO_IMG) {
            return re(CellToImgExercise, {...this.compConstProps, ...this.getCompVarProps()})
        } else if (this.state.taskType === CELL_TO_IMG_WITH_NEIGHBOURS) {
            return re(CellToImgExercise, {...this.compConstProps, ...this.getCompVarProps(), withNeighbours: true})
        } else if (this.state.taskType === IMG_TO_CELL) {
            return re(ImgToCellExercise, {...this.compConstProps, ...this.getCompVarProps()})
        } else if (this.state.taskType === DIAGONALS) {
            return re(DiagonalsExercise, {...this.compConstProps, ...this.getCompVarProps()})
        } else if (this.state.taskType === DIAGONAL_SHORTCUTS) {
            return re(DiagonalsShortcutsExercise, {...this.compConstProps, ...this.getCompVarProps()})
        } else if (this.state.taskType === DIAGONAL_SHORTCUTS_REVERSE) {
            return re(DiagonalsShortcutsExercise, {reverse:true, ...this.compConstProps, ...this.getCompVarProps()})
        } else if (this.state.taskType === CONNECTIONS) {
            return re(CalculateConnectionsExercise, {...this.compConstProps, ...this.getCompVarProps()})
        } else {
            return re(HContainer,{},
                re(Button,{key:"Cell to Img",variant:"contained", color:"primary",
                        onClick: ()=> this.setState((state,props)=>({taskType: CELL_TO_IMG}))},
                    "Cell to Img"),
                re(Button,{key:"Cell to Img with Neighbours",variant:"contained", color:"primary",
                        onClick: ()=> this.setState((state,props)=>({taskType: CELL_TO_IMG_WITH_NEIGHBOURS}))},
                    "Cell to Img with Neighbours"),
                re(Button,{key:"Img to Cell",variant:"contained", color:"primary",
                        onClick: ()=> this.setState((state,props)=>({taskType: IMG_TO_CELL}))},
                    "Img to Cell"),
                re(Button,{key:"Diagonals",variant:"contained", color:"primary",
                        onClick: ()=> this.setState((state,props)=>({taskType: DIAGONALS}))},
                    "Diagonals"),
                re(Button,{key:"Diagonal Shortcuts",variant:"contained", color:"primary",
                        onClick: ()=> this.setState((state,props)=>({taskType: DIAGONAL_SHORTCUTS}))},
                    "Diagonal Shortcuts"),
                re(Button,{key:"Diagonal Shortcuts Reverse",variant:"contained", color:"primary",
                        onClick: ()=> this.setState((state,props)=>({taskType: DIAGONAL_SHORTCUTS_REVERSE}))},
                    "Diagonal Shortcuts Reverse"),
                re(Button,{key:"Connections",variant:"contained", color:"primary",
                        onClick: ()=> this.setState((state,props)=>({taskType: CONNECTIONS}))},
                    "Connections"),
                !this.state.hMode?null:re(Button,{key:"H/V mode",variant:"contained", color:"primary",
                        onClick: ()=> this.setState((state,props)=>({hMode: !state.hMode}))},
                    "H/V mode")
            )
        }
    }

    getCompVarProps() {
        return {hMode: this.state.hMode, cellSize: this.state.hMode?"72px":"108px"}
    }

    renderButtons() {
        return re('table',{},
            re('tbody',{},
                re('tr',{},
                    re('td',{},
                        re(Button,{key:"Close all",variant:"contained", color:"primary", onClick: hideAllImages}, "Close all")
                    ),
                    re('td',{},
                        re(Button,{key:"Open all",variant:"contained", color:"primary",
                                onClick: ()=> sendMessage(ALL_CELLS_PREDICATE, SHOW_IMAGE_MSG)},
                            "Open all")
                    ),
                    re('td',{},
                        re(Button,{key:"Hide coordinates",variant:"contained", color:"primary",
                                onClick: ()=> sendMessage(ALL_CELLS_PREDICATE, HIDE_COORDS_MSG)},
                            "Hide coordinates")
                    ),
                    re('td',{},
                        re(Button,{key:"Show coordinates",variant:"contained", color:"primary",
                                onClick: ()=> sendMessage(ALL_CELLS_PREDICATE, SHOW_COORDS_MSG)},
                            "Show coordinates")
                    )
                ),
                re('tr',{},
                    re('td',{style: {padding:"70px 10px"}},
                        re(MoveTrainer,{})
                    )
                ),
                re('tr',{},
                    re('td',{},
                        re(Button,{key:"H/V mode",variant:"contained", color:"primary",
                                onClick: ()=> this.setState((state,props)=>({hMode: !state.hMode}))},
                            "H/V mode")
                    )
                )
            )
        )
    }
}

const ALL_CELLS_PREDICATE = listenerName => listenerName.startsWith("cell-")
const hideAllImages = ()=> sendMessage(ALL_CELLS_PREDICATE, HIDE_IMAGE_MSG)
const uncheckAllCells = ()=> sendMessage(ALL_CELLS_PREDICATE, UNCHECK_CELL)
const resetBoard = ()=> {
    hideAllImages()
    uncheckAllCells()
}
function moveToCellRelatively(baseCell,dx,dy) {
    return {x:baseCell.x+dx, y:baseCell.y+dy}
}
function sendMessageToCell(msg,baseCell,dx,dy) {
    dx = dx?dx:0
    dy = dy?dy:0
    const targetCell = moveToCellRelatively(baseCell,dx,dy)
    if (!isValidCell(targetCell)) {
        return;
    }
    const targetCellName = "cell-" + XX[targetCell.x]+YY[targetCell.y]
    sendMessage(name=>name===targetCellName, msg)
}
function openImage(baseCell,dx,dy) {
    sendMessageToCell(SHOW_IMAGE_MSG, baseCell, dx, dy)
}
function checkCell(baseCell,dx,dy) {
    sendMessageToCell(CHECK_CELL, baseCell, dx, dy)
}


ReactDOM.render(
    re(ChessBoardTrainer,{configName: "config2"}),
    document.getElementById('react-container')
)