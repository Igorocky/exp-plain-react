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


class ChessBoardCell extends React.Component {
    constructor(props) {
        super(props)
        this.state={...props, isImage:true}
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
            return re('img', {src:"./chess/chess-board-configs/config1/" + this.props.x + this.props.y + ".png",
                className: "cell-img"})
        } else {
            return re('div',{className: "cell-text"},this.props.x + this.props.y)
        }
    }

    flip() {
        this.setState((state,props)=>({isImage: !state.isImage}))
    }
}

class ChessBoard extends React.Component {
    constructor(props) {
        super(props)
        this.state={}
    }

    render() {
        return re('table',{className: "chessboard"},
            re('tbody',{className: "chessboard"},
                _.map(board, (row,ri)=>re('tr',{key:ri},_.map(row, (cell,ci)=>re('td',{key:ci},re(ChessBoardCell,cell)))))
            )
        )
    }
}

ReactDOM.render(
    re(ChessBoard, {}),
    document.getElementById('react-container')
)