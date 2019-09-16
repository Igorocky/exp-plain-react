'use strict';

const volatile = {}

function handleCellClicked(cell) {
    apply(volatile.flipCell, cell)
    apply(volatile.flipImageOnCell, cell)
}

const TestChessboard = () => {
    const {flipCell, flipImageOnCell, renderChessboard} = useChessboard({cellSize:72, configName:"config1"})
    volatile.flipCell = flipCell
    volatile.flipImageOnCell = flipImageOnCell
    return renderChessboard(handleCellClicked)
}

ReactDOM.render(
    re(TestChessboard,{}),
    document.getElementById('react-container')
)