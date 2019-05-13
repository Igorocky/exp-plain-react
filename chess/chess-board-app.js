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
const BOARD = _.map(revert(YY), (y, yi)=>_.map(XX, (x, xi)=>({x:x, y:y, isWhite:(xi+yi)%2===0})))

const HIDE_IMAGE_MSG = "HIDE_IMAGE_MSG"
const SHOW_IMAGE_MSG = "SHOW_IMAGE_MSG"
const HIDE_COORDS_MSG = "HIDE_COORDS_MSG"
const SHOW_COORDS_MSG = "SHOW_COORDS_MSG"
const CHECK_CELL = "CHECK_CELL"
const UNCHECK_CELL = "UNCHECK_CELL"

class ChessBoardCell extends React.Component {
    constructor(props) {
        super(props)
        this.cellName = this.props.x + this.props.y
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

const CELL_TO_IMG = "cell-to-img"
const IMG_TO_CELL = "img-to-cell"

class RandomCellSelector {
    constructor() {
        this.state = {cellsToAsk: [], iterationNumber:0}
        this.updateStateToNextCell()
    }

    getCurrentCell() {
        return this.state.currentCell;
    }

    getIterationNumber() {
        return this.state.iterationNumber;
    }

    updateStateToNextCell() {
        let cellsToAsk = this.state.cellsToAsk
        if (_.size(cellsToAsk)===0) {
            for (let x = 0; x < _.size(XX); x++) {
                for (let y = 0; y < _.size(YY); y++) {
                    cellsToAsk.push({x:x,y:y})
                }
            }
            this.state.iterationNumber += 1
        }
        cellsToAsk = _.shuffle(cellsToAsk)
        this.state.currentCell = _.first(cellsToAsk)
        this.state.cellsToAsk = _.rest(cellsToAsk)
    }
}

class CellToImgExercise extends React.Component {
    constructor(props) {
        super(props)
        this.state={randomCellSelector: new RandomCellSelector(), checkedCell:true}
        this.state.randomCellSelector.updateStateToNextCell()
        this.handleKeyDownListener = e => this.handleKeyDown(e)
    }

    render() {
        return this.renderElems(
            re(ChessBoard, {configName: "config2", cellSize: this.props.hMode?"72px":"108px", onClick:()=>this.next()}),
            re('div',{style:{paddingLeft:"30%"}},"Iteration: " + this.state.randomCellSelector.getIterationNumber())
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
            resetBoard()
            if (state.checkedCell) {
                openImage(state.randomCellSelector.getCurrentCell())
                return {checkedCell:!state.checkedCell}
            } else {
                state.randomCellSelector.updateStateToNextCell()
                checkCell(state.randomCellSelector.getCurrentCell())
                return {randomCellSelector: state.randomCellSelector, checkedCell:!state.checkedCell}
            }
        })
    }

    componentDidMount() {
        checkCell(this.state.randomCellSelector.getCurrentCell())
        window.addEventListener("keydown", this.handleKeyDownListener);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDownListener);
    }

    handleKeyDown(event) {
        if (event.keyCode === 13) {
            this.next()
        }
    }
}

class ChessBoardTrainer extends React.Component {
    constructor(props) {
        super(props)
        this.state={hMode:true, taskType: ""}
    }

    render() {
        if (this.state.taskType === CELL_TO_IMG) {
            return re(CellToImgExercise, {hMode: this.state.hMode})
        } else {
            return re(HContainer,{},
                re(Button,{key:"Cell to Img",variant:"contained", color:"primary",
                        onClick: ()=> this.setState((state,props)=>({taskType: CELL_TO_IMG}))},
                    "Cell to Img"),
                !this.state.hMode?null:re(Button,{key:"H/V mode",variant:"contained", color:"primary",
                        onClick: ()=> this.setState((state,props)=>({hMode: !state.hMode}))},
                    "H/V mode")
            )
        }
    }

    handleTaskTypeChange(event) {
        this.setState((state,props)=>({taskType: event.target.value}))
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
function sendMessageToCell(msg,baseCell,dx,dy) {
    dx = dx?dx:0
    dy = dy?dy:0
    const targetCell = {x:baseCell.x+dx, y:baseCell.y+dy}
    if (targetCell.x < 0 || targetCell.x > _.size(XX) - 1 || targetCell.y < 0 || targetCell.y > _.size(YY) - 1) {
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
    re(ChessBoardTrainer,{}),
    document.getElementById('react-container')
)