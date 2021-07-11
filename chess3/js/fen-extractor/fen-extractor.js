"use strict";

function extractFenFromPgn(pgn) {

    const matchResult = pgn.split('\n').find(l => l.startsWith('[FEN ')).match(/\[FEN "((\S+) ([bw])).*/)
    return {
        fen: matchResult[1],
        pos: matchResult[2],
        colorToMove: matchResult[3]
    }
}

function fenToBoard(fen) {
    const board = []
    for (let x = 0; x < 8; x++) {
        board.push([])
        for (let y = 0; y < 8; y++) {
            board[x].push('.')
        }
    }

    let cellPointer = 0;
    let charPointer = 0;
    while (cellPointer < 64) {
        const chCode = fen.charCodeAt(charPointer)
        if (48 <= chCode && chCode <= 57) {
            cellPointer += chCode - 48
        } else if (chCode == 47/*"/"*/) {
            //doNothing
        } else {
            let x = cellPointer%8
            let y = 7-Math.floor(cellPointer/8)
            board[x][y] = String.fromCharCode(chCode)
            cellPointer++
        }
        charPointer++
    }

    return board
}

function extractFirstMoveFromPgn({pgn,colorToMove}) {
    const firstLine = pgn.split('\n')
        .map(s => s.trim())
        .filter(s => s.length)
        .filter(s => s.charAt(0) != '[')[0]

    let match = firstLine.match(/^\d+\.\s+(\S+)(\s+(\S+))?.*$/)
    if (!match) match = firstLine.match(/^\d+(\.\.\.+)(\s+(\S+)).*$/)

    return colorToMove === 'w' ? match[1] : match[3]
}

function calcMoveCoords({board,colorToMove,move}) {
    function charXToNum(charX) {
        return charX.charCodeAt(0)-97
    }

    function charYToNum(charY) {
        return charY.charCodeAt(0)-49
    }

    let match = move.match(/([abcdefgh])x([abcdefgh])([0-9])/)
    if (match) {
        console.log({match})
        const endX = charXToNum(match[2])
        const endY = charYToNum(match[3])
        const startX = charXToNum(match[1])
        const startY = colorToMove === 'w' ? endY - 1 : endY + 1
        return {
            from:{x:startX,y:startY},
            to:{x:endX,y:endY},
        }
    }

    match = move.match(/([KQRBK])x?([abcdefgh])([0-9])/)
    if (match) {
        console.log({match})
        const endX = charXToNum(match[2])
        const endY = charYToNum(match[3])
        const startX = charXToNum(match[1])
        const startY = colorToMove === 'w' ? endY - 1 : endY + 1
        return {
            from:{x:startX,y:startY},
            to:{x:endX,y:endY},
        }
    }

    match = move.match(/([KQRBK])x?([abcdefgh])([0-9])/)
    if (match) {
        console.log({match})
        const endX = charXToNum(match[2])
        const endY = charYToNum(match[3])
        const startX = charXToNum(match[1])
        const startY = colorToMove === 'w' ? endY - 1 : endY + 1
        return {
            from:{x:startX,y:startY},
            to:{x:endX,y:endY},
        }
    }
}

function printBoard(board) {
    const res = []
    for (let y = 7; y >= 0; y--) {
        for (let x = 0; x < 8; x++) {
            res.push(board[x][y])
        }
        res.push('\n')
    }
    return res.join('')
}

function invertColor(color) {
    return color === 'w' ? 'b' : 'w'
}

function describePosition({board,orientation}) {
    function getCoordsComparator(orientation) {
        if (orientation === 'w') {
            return (a,b) => a.x - b.x
        } else {
            return (a,b) => b.x - a.x
        }
    }

    function coordsToStr({x,y}) {
        return String.fromCharCode(x+97)+String.fromCharCode(y+49)
    }

    function findCoordsOf(char) {
        const res = []
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                if (board[x][y] === char) {
                    res.push({x,y})
                }
            }
        }
        return res.sort(getCoordsComparator(orientation)).map(coordsToStr)
    }

    function getMyPiece(char) {
        return orientation === 'w' ? char.toUpperCase() : char.toLowerCase()
    }

    function getOpponentPiece(char) {
        return orientation === 'w' ? char.toLowerCase() : char.toUpperCase()
    }

    function listPawns(pieceTransformer) {
        return `${pieceTransformer('p')}: ${findCoordsOf(pieceTransformer('p')).join(' ')}`
    }

    function listPieces(pieceTransformer, piecesToList) {
        return piecesToList.flatMap(piece => findCoordsOf(pieceTransformer(piece)).map(c=>pieceTransformer(piece)+c)).join(' ')
    }

    const myPawns = listPawns(getMyPiece)
    const myKQR = listPieces(getMyPiece, ['k','q','r'])
    const myBN = listPieces(getMyPiece, ['b','n'])

    const opponentPawns = listPawns(getOpponentPiece)
    const opponentKQR = listPieces(getOpponentPiece, ['k','q','r'])
    const opponentBN = listPieces(getOpponentPiece, ['b','n'])

    return [
        myPawns,
        myKQR,
        myBN,
        opponentPawns,
        opponentKQR,
        opponentBN,
    ]
}

function describePgn(pgn) {
    const fenFromPgn = extractFenFromPgn(pgn)
    const board = fenToBoard(fenFromPgn.fen)
    const firstMove = extractFirstMoveFromPgn({pgn,colorToMove:fenFromPgn.colorToMove})
    const positionDescription = describePosition({board,orientation:invertColor(fenFromPgn.colorToMove)})

    return {
        board: positionDescription,
        move: firstMove,
        fen: fenFromPgn.fen
    }
}

function describePuzzle(puzzle) {
    const {board, move, fen} = describePgn(puzzle.pgn)
    return [
        ...board,
        '-----------------------',
        move,
        fen
    ]
}

testData.forEach(({pgn}) => {
    // const fenFromPgn = extractFenFromPgn(pgn)
    // console.log({fenFromPgn})
    // const board = fenToBoard(fenFromPgn.fen)
    // console.log(printBoard(board))

    // const firstMove = extractFirstMoveFromPgn({pgn,colorToMove:fenFromPgn.colorToMove})
    // console.log({firstMove})
    // console.log({calcMoveCoords:calcMoveCoords({board,colorToMove:fenFromPgn.colorToMove,move:firstMove})})

    // console.log({describePgn:describePgn(pgn)})

    // console.log('--------------------------------------------------------------------------')
})

runTests({
    extractFirstMoveFromPgn: pgn => {
        const fenFromPgn = extractFenFromPgn(pgn)
        const board = fenToBoard(fenFromPgn.fen)
        return extractFirstMoveFromPgn({pgn,colorToMove:fenFromPgn.colorToMove})
    },
    extractFirstColorToMoveFromPgn: pgn => {
        const fenFromPgn = extractFenFromPgn(pgn)
        return fenFromPgn.colorToMove
    },
    extractFenPosFromPgn: pgn => {
        return extractFenFromPgn(pgn).pos
    }
})
