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

class ChessBoardCell extends React.Component {
    constructor(props) {
        super(props)
        this.cellName = this.props.x + this.props.y
        this.state={...props, isImage:false, showCoords: false}
    }

    render() {
        return re(
            'div',
            {
                className:"chess-board-cell " + (this.props.isWhite?"white-cell":"black-cell"),
                style: {width: this.props.size, height: this.props.size},
                onClick: ()=> this.flip()
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
        window.addEventListener("keyup", this.handleKeyUp);
    }

    componentWillUnmount() {
        window.removeEventListener("keyup", this.handleKeyUp);
    }

    handleKeyUp(event) {
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
        return re(HContainer,{},
            re('span', {}, this.getCurrentCellName()),
            re(Button,{key:"Next",variant:"contained", color:"primary", onClick: ()=>this.nextCell()}, "Next"),
            re(Button,{key:"Night",variant:"contained", color:"primary", onClick: ()=>this.openCellsForKnight()}, "Night"),
            re(Button,{key:"Queen",variant:"contained", color:"primary", onClick: ()=>this.openCellsForQueen()}, "Queen")
        )
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

    openCellsForKnight() {
        if (!this.state.currentCell) {
            return;
        }
        hideAllImages()
        this.openImage(this.state.currentCell,0,0)
        this.openImage(this.state.currentCell,-2,-1)
        this.openImage(this.state.currentCell,-2,+1)
        this.openImage(this.state.currentCell,-1,+2)
        this.openImage(this.state.currentCell,+1,+2)
        this.openImage(this.state.currentCell,+2,+1)
        this.openImage(this.state.currentCell,+2,-1)
        this.openImage(this.state.currentCell,+1,-2)
        this.openImage(this.state.currentCell,-1,-2)
    }

    openCellsForQueen() {
        if (!this.state.currentCell) {
            return;
        }
        hideAllImages()
        for (let dx = 0; dx<8; dx++) {
            this.openImage(this.state.currentCell,dx,dx)
            this.openImage(this.state.currentCell,dx,-dx)
            this.openImage(this.state.currentCell,-dx,dx)
            this.openImage(this.state.currentCell,-dx,-dx)
            this.openImage(this.state.currentCell,dx,0)
            this.openImage(this.state.currentCell,-dx,0)
            this.openImage(this.state.currentCell,0,dx)
            this.openImage(this.state.currentCell,0,-dx)
        }
    }

    openImage(baseCell,dx,dy) {
        const targetCell = {x:baseCell.x+dx, y:baseCell.y+dy}
        if (targetCell.x < 0 || targetCell.x > _.size(XX) - 1 || targetCell.y < 0 || targetCell.y > _.size(YY) - 1) {
            return;
        }
        const targetCellName = "cell-" + XX[targetCell.x]+YY[targetCell.y]
        sendMessage(name=>name===targetCellName, SHOW_IMAGE_MSG)
    }
}

class ChessBoardTrainer extends React.Component {
    constructor(props) {
        super(props)
        this.state={hMode:true}
    }

    render() {
        return re(VContainer,{},
            re(HContainer,{},
                re(ChessBoard, {configName: "config2", cellSize: this.state.hMode?"72px":"108px"}),
                this.state.hMode ? this.renderButtons() : null
            ),
            this.state.hMode
                ? null
                : this.renderButtons()
        )
    }

    renderButtons_new() {
        return re(VContainer,{},
            re(HContainer,{},
                re(Button,{key:"Close all",variant:"contained", color:"primary", onClick: hideAllImages}, "Close all"),
                re(Button,{key:"Open all",variant:"contained", color:"primary",
                        onClick: ()=> sendMessage(ALL_CELLS_PREDICATE, SHOW_IMAGE_MSG)},
                    "Open all"),
                re(Button,{key:"Hide coordinates",variant:"contained", color:"primary",
                        onClick: ()=> sendMessage(ALL_CELLS_PREDICATE, HIDE_COORDS_MSG)},
                    "Hide coordinates"),
                re(Button,{key:"Show coordinates",variant:"contained", color:"primary",
                        onClick: ()=> sendMessage(ALL_CELLS_PREDICATE, SHOW_COORDS_MSG)},
                    "Show coordinates")
            ),
            re(MoveTrainer,{}),
            re(HContainer,{},
                re(Button,{key:"H/V mode",variant:"contained", color:"primary",
                        onClick: ()=> this.setState((state,props)=>({hMode: !state.hMode}))},
                    "H/V mode")
            )
        )
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
                    re('td',{},
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

ReactDOM.render(
    re(ChessBoardTrainer,{}),
    document.getElementById('react-container')
)