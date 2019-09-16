'use strict';

const ChessBoard = ({cellSize, configName, cellAttrsList, onCellClicked}) => {

    console.log("render Chessboard");

    const cells = useMemo(() => _.map(ints(0,7).reverse(), y => _.map(ints(0,7), x => (
        {coords:{x:x,y:y}, size:cellSize, configName:configName}
    ))), [])

    function getCellAttrs(cellNum) {
        const attrs = cellAttrsList[cellNum]
        return attrs?attrs:{}
    }

    return RE.table({className: "chessboard"},
        RE.tbody({className: "chessboard"},
            _.map(cells, (row,idx) => RE.tr({key:idx},
                _.map(row, (cell,idx) => RE.td({key:idx},
                    re(ChessBoardCell,{...cell, ...getCellAttrs(cellToAbsNum(cell.coords)), onClick: onCellClicked}))
                )
            ))
        )
    )
}

function useChessboard({cellSize, configName}) {
    const [cellAttrsList, setCellAttrsList] = useState([])

    function getCellAttrs(cell) {
        const attrs = cellAttrsList[cellToAbsNum(cell)]
        return attrs?attrs:{}
    }

    function modCellAttr(cell, modifiers) {
        setCellAttrsList(cellAttrsList => {
            const result = [...cellAttrsList]
            const cellNum = cellToAbsNum(cell)
            result[cellNum] = clone(cellAttrsList[cellNum],modifiers)
            return result
        })
    }

    function checkCell(cell) {
        modCellAttr(cell,{checked:true})
    }
    function uncheckCell(cell) {
        modCellAttr(cell,{checked:false})
    }
    function flipCell(cell) {
        modCellAttr(cell,{checked:!getCellAttrs(cell).checked})
    }

    function showImageOnCell(cell) {
        modCellAttr(cell,{showImage:true})
    }
    function hideImageOnCell(cell) {
        modCellAttr(cell,{showImage:false})
    }
    function flipImageOnCell(cell) {
        modCellAttr(cell,{showImage:!getCellAttrs(cell).showImage})
    }

    function renderChessboard(onCellClicked) {
        return re(ChessBoard, {
            cellSize:cellSize,
            configName:configName,
            cellAttrsList: cellAttrsList,
            onCellClicked:onCellClicked
        })
    }

    return {
        checkCell: checkCell,
        uncheckCell: uncheckCell,
        flipCell: flipCell,
        showImageOnCell:showImageOnCell,
        hideImageOnCell:hideImageOnCell,
        flipImageOnCell:flipImageOnCell,
        renderChessboard: renderChessboard,
    }
}