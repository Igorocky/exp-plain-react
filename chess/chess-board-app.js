'use strict';

const revert = list => _.reduceRight(
    list,
    (memo, elem) => {
        memo.push(elem)
        return memo
    },
    []
)

const xx = ["a","b","c","d","e","f","g","h"]
const yy = ["1","2","3","4","5","6","7","8"]
const board = _.map(revert(yy), (y,yi)=>_.map(xx, (x,xi)=>({x:x, y:y, isWhite:(xi+yi)%2===0})))

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
                _.map(board, (row, ri) =>
                    re('tr', {key: ri},
                        _.map(row, (cell, ci) =>
                            re('td', {key: ci},
                                re(ChessBoardCell, {...cell, configName: this.props.configName})
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

const allCellsPredicate = listenerName => listenerName.startsWith("cell-")
const hideAllImages = ()=> sendMessage(allCellsPredicate, HIDE_IMAGE_MSG)

ReactDOM.render(
    re('table',{className: "chessboard-container"},
        re('tbody',{},
            re('tr',{},
                re('td',{}, re(ChessBoard, {configName: "config2"})),
                re('td',{},
                    re(Button,{variant:"contained", color:"primary", onClick: hideAllImages}, "Close all"),
                    re(Button,{variant:"contained", color:"primary",
                        onClick: ()=> sendMessage(allCellsPredicate, SHOW_IMAGE_MSG)},
                        "Open all"),
                    re(Button,{variant:"contained", color:"primary",
                        onClick: ()=> sendMessage(allCellsPredicate, HIDE_COORDS_MSG)},
                        "Hide coordinates"),
                    re(Button,{variant:"contained", color:"primary",
                        onClick: ()=> sendMessage(allCellsPredicate, SHOW_COORDS_MSG)},
                        "Show coordinates")
                )
            )
        )
    ),
    document.getElementById('react-container')
)