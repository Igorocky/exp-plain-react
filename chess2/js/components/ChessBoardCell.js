'use strict';

const ChessBoardCell = React.memo( ({configName, coords, size, checked, showImage, onClick}) => {

    // console.log("rendering cell - " + JSON.stringify(coords));

    const isWhite = useMemo(() => (cellToAbsNum(coords)+coords.y) % 2 == 1, [coords.x, coords.y])

    function getContent() {
        if (showImage) {
            const cellName = getCellName(coords)
            return RE.img( {
                src:"chess-board-configs/" + configName + "/" + cellName + ".png",
                className: "cell-img",
            })
        } else {
            return ""
        }
    }

    function calcOutline() {
        const color = isWhite?"white":"black"
        return (checked&&showImage)?("7px dashed " + color):""
    }

    return RE.div({
        className:(checked?"checked-cell":(isWhite?"white-cell":"black-cell")),
        style: {width: size, height: size, outline:calcOutline()},
        onClick: () => onClick(coords)
    }, getContent())

}, (o,n) => true
    && o.size==n.size
    && o.checked==n.checked
    && o.showImage==n.showImage
    && o.onClick==n.onClick
)