'use strict';

const TestChessboard = ({configName}) => {
    const {flipCell, flipImageOnCell, renderChessboard} = useChessboard({cellSize:72, configName:configName})
    const onCellClicked = useCallback(cell => {
        flipCell(cell)
        flipImageOnCell(cell)
    }, [])
    return renderChessboard({onCellClicked:onCellClicked})
}

ReactDOM.render(
    re(ExerciseSelector),
    document.getElementById('react-container')
)