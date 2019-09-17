'use strict';

const volatile = {}

function handleCellClicked(cell) {
    apply(volatile.flipCell, cell)
    apply(volatile.flipImageOnCell, cell)
}

const TestChessboard = ({configName}) => {
    const {flipCell, flipImageOnCell, renderChessboard} = useChessboard({cellSize:72, configName:configName})
    volatile.flipCell = flipCell
    volatile.flipImageOnCell = flipImageOnCell
    return renderChessboard({onCellClicked:handleCellClicked})
}

ReactDOM.render(
    re(TestChessboard,{configName:"config1"}),
    document.getElementById('react-container')
)