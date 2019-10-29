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

    function modCellAttrs(cell, modifier) {
        setCellAttrsList(cellAttrsList => {
            const result = [...cellAttrsList]
            const cellNum = cellToAbsNum(cell)
            const attrs = cellAttrsList[cellNum]
            result[cellNum] = clone(attrs,modifier(attrs?attrs:{}))
            return result
        })
    }

    function modAllCellAttrs(modifier) {
        setCellAttrsList(cellAttrsList => {
            const result = []
            ints(0,63).forEach(cellNum => {
                const attrs = cellAttrsList[cellNum]
                result[cellNum] = clone(attrs,modifier(attrs?attrs:{}))
            })
            return result
        })
    }

    function renderChessboard({onCellClicked}) {
        return re(ChessBoard, {
            cellSize:cellSize,
            configName:configName,
            cellAttrsList: cellAttrsList,
            onCellClicked:onCellClicked
        })
    }

    return {
        checkCell: useCallback(function (cell) {
            modCellAttrs(cell, () => ({checked: true}))
        },[]),

        uncheckCell: useCallback(function (cell) {
            modCellAttrs(cell, () => ({checked: false}))
        },[]),

        uncheckAllCells: useCallback(function () {
            modAllCellAttrs(() => ({checked: false}))
        },[]),

        flipCell: useCallback(function (cell) {
            modCellAttrs(cell, attrs => ({checked: !attrs.checked}));
        }, []),

        showImageOnCell:useCallback(function (cell) {
            modCellAttrs(cell, () => ({showImage: true}))
        },[]),

        hideImageOnCell:useCallback(function (cell) {
            modCellAttrs(cell, () => ({showImage: false}))
        },[]),

        flipImageOnCell:useCallback(function (cell) {
            modCellAttrs(cell, attrs => ({showImage: !attrs.showImage}))
        },[]),

        renderChessboard: renderChessboard,
    }
}