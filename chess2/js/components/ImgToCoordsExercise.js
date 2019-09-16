'use strict';

const ImgToCoordsExercise = ({configName}) => {
    const [dirImgToCoords, setDirImgToCoords] = useState(true)
    const [rndElemSelector, setRndElemSelector] = useState(new RandomElemSelector({
        elems: _.map(ints(0,63), cellNumToCard)
    }))
    const cellSize = "150px"
    const divStyle = {width: cellSize, height: cellSize, fontSize: "120px"}

    function cellNumToCard(cellNum) {
        return {cellName: getCellName(absNumToCell(cellNum))}
    }

    function renderImage(card) {
        return RE.div({style: divStyle}, RE.Container.row.center.top({},{},
            RE.img({
                src:"chess-board-configs/" + configName + "/" + card.cellName + ".png",
                className: "cell-img"
            })
        ))
    }

    function renderCoords(card) {
        return RE.div({style: divStyle}, RE.Container.row.center.top({},{},
            card.cellName
        ))
    }


    return re(CardsExercise, {
        rndElemSelector:rndElemSelector,
        renderQuestion: card => dirImgToCoords?renderImage(card):renderCoords(card),
        renderAnswer: card => dirImgToCoords?renderCoords(card):renderImage(card),
        onIterationComplete: null
    })
}