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
    // re(ImgToCoordsExercise,{configName:"config1"}),
    re(VisionExerciseRev,{configName:"config1"}),
    document.getElementById('react-container')
)