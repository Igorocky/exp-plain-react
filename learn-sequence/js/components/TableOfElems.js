'use strict';

const ELEM_CELL_SIZE = 45
const ELEM_CELL_SIZE_PX = ELEM_CELL_SIZE+"px"
const ELEM_CELL_FONT_SIZE_PX = ELEM_CELL_SIZE*0.6+"px"

const TableOfElems = ({
                          numberOfHundreds, elems,
                          focusedElemIdx, minElemIdx, maxElemIdx,
                          onElemLeftClicked, onRowLeftClicked, onDigitLeftClicked
                      }) => {

    function getElemIndex(rowNum, colNum) {
        return numberOfHundreds*100 + (rowNum-1)*10 + colNum - 1
    }

    function renderCellContent(rowNum, colNum, elemIndex) {
        if (rowNum == 0) {
            if (colNum > 0) {
                return colNum%10
            } else {
                return ""
            }
        } else {
            if (colNum == 0) {
                return elemIndex - colNum + 1
            } else {
                return elems[elemIndex].opened ? elems[elemIndex].value : ""
            }
        }
    }

    function getBackgroundColorForCell(elemIndex, isCellWithElemToLearn, isFocused) {
        if (isCellWithElemToLearn) {
            if (isFocused) {
                if (elems[elemIndex].failed) {
                    return "red"
                } else {
                    return "orange"
                }
            } else if (elemIndex < minElemIdx || maxElemIdx < elemIndex) {
                return "rgb(181,136,99)"
            } else if (!elems[elemIndex].opened) {
                return "rgb(240,217,181)"
            } else if (elems[elemIndex].opened && elems[elemIndex].failed) {
                return "red"
            }
        } else {
            return "rgb(200,200,200)"
        }

        return ""
    }

    function getCellStyleClasses(rowNum, colNum, isCellWithElemToLearn) {
        let result = "elem-to-learn-cell"
        if (isCellWithElemToLearn) {
            result += " with-yellow-outline-on-hover"
            result += " cursor-pointer-on-hover"
        } else if (colNum == 0 && rowNum > 0) {
            result += " with-red-outline-on-hover"
            result += " cursor-pointer-on-hover"
        } else if (colNum > 0 && rowNum == 0) {
            result += " with-blue-outline-on-hover"
            result += " cursor-pointer-on-hover"
        }

        return result
    }

    function renderCell(rowNum, colNum) {
        const elemIndex = getElemIndex(rowNum, colNum)
        const isCellWithElemToLearn = rowNum > 0 && colNum > 0;
        const isFocused = isCellWithElemToLearn && focusedElemIdx == elemIndex;
        return RE.div({
                className: getCellStyleClasses(rowNum, colNum, isCellWithElemToLearn),
                style:{
                    width:ELEM_CELL_SIZE_PX,
                    height:ELEM_CELL_SIZE_PX,
                    backgroundColor: getBackgroundColorForCell(elemIndex, isCellWithElemToLearn, isFocused),
                    fontSize: ELEM_CELL_FONT_SIZE_PX,
                },
                onClick: () => {
                    if (isCellWithElemToLearn) {
                        onElemLeftClicked(elemIndex)
                    } else if (colNum == 0 && rowNum > 0) {
                        onRowLeftClicked(elemIndex+1)
                    } else if (colNum > 0 && rowNum == 0) {
                        onDigitLeftClicked(colNum%10)
                    }
                },
            },
            renderCellContent(rowNum, colNum, elemIndex)
        )

    }

    function renderTable() {
        return RE.table({className: "table-of-elems-to-learn"},
            re('tbody', {className: "table-of-elems-to-learn-body"},
                ints(0, 10).map(rowNum => RE.tr({key: rowNum},
                    ints(0, 10).map(colNum => RE.td({key: colNum},
                        renderCell(rowNum, colNum)
                    ))
                ))
            )
        )
    }

    return renderTable()
}