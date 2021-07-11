"use strict";

const PGN_TEST_1 = {
    pgn:'[Event "?"]\n' +
            '[Site "?"]\n' +
        '[Date "????.??.??"]\n' +
        '[Round "?"]\n' +
        '[White "?"]\n' +
        '[Black "?"]\n' +
        '[Result "*"]\n' +
        '[SetUp "1"]\n' +
        '[FEN "2kr3r/1p3pp1/2p5/5q2/4R1p1/7P/PPP1QP2/R5K1 w - - 0 23"]\n' +
        '[Puzzle_Length "5"]\n' +
        '[Tactic_line "Qh7 Qf3 Qh2+ Kf1 Qh1+ Qxh1 Rxh1+ Ke2 Rxa1"]\n' +
        '\n' +
        '23. hxg4 Qh7 ({+0.15} 23... Qd5 24. Re1 f5 25. gxf5 Qxf5 26. Qg4 Qxg4+ 27. Rxg4\n' +
        'Rd2 28. Rxg7 =) 24. Qf3 Qh2+ ({-0.43} 24... Rd2 25. Qf5+ Qxf5 26. gxf5 Rxc2 27.\n' +
        'Re7 Rh4 28. Rae1 Rxb2 29. Rxf7 =) ({+0.50} 24... g6 25. Rae1 f5 26. Re7 Qh2+ 27.\n' +
        'Kf1 f4 28. Qg2 Qh4 29. a3 =) 25. Kf1 Qh1+ ({-0.45} 25... Rd2 26. Re2 Rxe2 27.\n' +
        'Kxe2 Qe5+ 28. Kf1 Qxb2 29. Qf5+ Kc7 30. Rd1 =) ({+0.79} 25... Rd6 26. Rae1 Rf6\n' +
        '27. Qg2 Qh4 28. Re8+ Rxe8 29. Rxe8+ Kc7 30. Re3 ⩲) 26. Qxh1 Rxh1+ ({+8.27} 26...\n' +
        'Rd1+ 27. Rxd1 Rxh1+ 28. Ke2 Rxd1 29. Kxd1 Kd8 30. f4 f6 31. f5 +−) ({+9.15}\n' +
        '26... f5 27. Qf3 fxe4 28. Qxe4 Rh6 29. Kg2 Rdh8 30. Qf5+ Kc7 31. Qe5+ +−) 27.\n' +
        'Ke2 Rxa1 ({+1.03} 27... Rh4 28. Kf3 Rd2 29. Re8+ Kd7 30. Rae1 g5 31. R8e7+ Kd6\n' +
        '32. Rxf7 ⩲) ({+1.24} 27... Rh6 28. Re1 b5 29. Re7 Rd7 30. Kf3 Rf6+ 31. Kg3 Rfd6\n' +
        '32. R1e3 ⩲) *',
    expectedFenPos: '2kr3r/1p3pp1/2p5/5q2/4R1p1/7P/PPP1QP2/R5K1',
    expectedFirstColorToMove: 'w',
    expectedFirstMove: 'hxg4',
    expectedInitialPosition: '2kr3r/1p3pp1/2p5/5q2/4R1P1/8/PPP1QP2/R5K1 b',
}

const PGN_TEST_2 = {
    pgn: '[Event "Quick (?) start, slow games (5) - Round 1"]\n' +
            '[Site "Chess.com"]\n' +
        '[Date "2014.04.10"]\n' +
        '[Round "?"]\n' +
        '[White "?"]\n' +
        '[Black "?"]\n' +
        '[Result "*"]\n' +
        '[FEN "1r2k1nr/3bppb1/1q1p2pp/2p5/4P3/NpP1BP2/P2QN1PP/R4RK1 w k -"]\n' +
        '[FirstMove "16w"]\n' +
        '[FULL "16. Rfb1 b2 17. Rxb2 Qxb2 18. Rb1 Qxb1+ 19. Nxb1 Rxb1+"]\n' +
        '[MOVES "4"]\n' +
        '[PlyCount "8"]\n' +
        '[PUZZLE_TYPE "material"]\n' +
        '[SetUp "1"]\n' +
        '[START_SCORE "-4.06"]\n' +
        '[START_SCORE_DIFFERENCE "-4.71"]\n' +
        '\n' +
        ' 16.    Rfb1\n' +
        '\t\t\t({24:-5.22} 16. Rfb1 b2 17. Rxb2 Qxb2 18. Rb1 Qxb1+ 19. Nxb1 Rxb1+  $19)\n' +
        '\t\t\t({24:0.31} 16. Nc4 Qc7 17. axb3 Be6 18. Na5 Nf6 19. b4 g5  $14)\n' +
        '\t\t\t({24:0.3} 16. axb3 Qd8 17. Nc4 Bb5 18. Ra3 Nf6 19. Na5 Qc8  $10)\n' +
        '\t\t\t({24:-0.7} 16. Qb2 Nf6 17. axb3 Qxb3 18. Qd2 O-O 19. Bxh6 Qb2  $15)\n' +
        '\t\t\t({24:-1.28} 16. Nf4 b2 17. Rab1 Nf6 18. Nc4 Qa6 19. Nxb2 Qxa2  $17)\n' +
        ' 16.     ...      b2\n' +
        '\t\t\t({24:-5.24} 16. ... b2 17. Rxb2 Qxb2 18. Rb1 Qxb1+ 19. Nxb1 Rxb1+ 20. Kf2  $19)\n' +
        '\t\t\t({24:0.06} 16. ... Qd8 17. axb3 Be6 18. Nf4 Bxb3 19. Rb2 c4 20. Nc2  $10)\n' +
        '\t\t\t({24:0.1} 16. ... Qc7 17. axb3 h5 18. Nc4 Bb5 19. Na3 Bd7 20. Bf4  $10)\n' +
        '\t\t\t({24:0.14} 16. ... Be6 17. axb3 Qd8 18. Nf4 Bxb3 19. Rb2 c4 20. Ne2  $10)\n' +
        ' 17.    Rxb2\n' +
        '\t\t\t({24:-5.31} 17. Rxb2 Qxb2 18. Rb1 Qxb1+ 19. Nxb1 Rxb1+ 20. Kf2 Nf6  $19)\n' +
        '\t\t\t({24:-6.92} 17. Nc2 bxa1=R 18. Rxa1 Nf6 19. Nb4 Bb5 20. a4 Bxe2  $19)\n' +
        '\t\t\t({24:-6.98} 17. Qd3 bxa1=Q 18. Rxa1 Nf6 19. c4 Qa6 20. Re1 Bc6  $19)\n' +
        '\t\t\t({24:-7.04} 17. Qe1 bxa1=Q 18. Rxa1 Qa6 19. Bc1 Nf6 20. Nc2 O-O  $19)\n' +
        ' 17.     ...    Qxb2\n' +
        '\t\t\t({24:-5.47} 17. ... Qxb2 18. Rb1 Qxb1+ 19. Nxb1 Rxb1+ 20. Nc1 Nf6 21. e5  $19)\n' +
        '\t\t\t({24:0.38} 17. ... Qa7 18. Rxb8+ Qxb8 19. Rb1 Qc7 20. c4 Nf6 21. Nb5  $14)\n' +
        '\t\t\t({24:0.39} 17. ... Qc7 18. Rxb8+ Qxb8 19. Rb1 Qa7 20. c4 Nf6 21. Nc3  $14)\n' +
        '\t\t\t({24:0.4} 17. ... Qd8 18. Rxb8 Qxb8 19. Rb1 Qa7 20. c4 Nf6 21. Nc3  $14)\n' +
        ' 18.     Rb1\n' +
        '\t\t\t({24:-5.25} 18. Rb1 Qxb1+ 19. Nxb1 Rxb1+ 20. Kf2 Nf6 21. e5 dxe5  $19)\n' +
        '\t\t\t({24:-7.67} 18. Nc2 Ba4 19. Rc1 Qxa2 20. c4 Rb2 21. Qd5 Kf8  $19)\n' +
        '\t\t\t({24:-7.81} 18. Qxb2 Rxb2 19. Nf4 Bxc3 20. Rc1 Bd4 21. Bxd4 cxd4  $19)\n' +
        '\t\t\t({24:-10.91} 18. Qe1 Qxa3 19. Bc1 Qa4 20. Bd2 Nf6 21. Qc1 Bb5  $19)\n' +
        ' 18.     ...   Qxb1+\n' +
        '\t\t\t({24:-5.29} 18. ... Qxb1+ 19. Nxb1 Rxb1+ 20. Kf2 Nf6 21. e5 dxe5 22. Bxc5  $19)\n' +
        '\t\t\t({24:-0.12} 18. ... Qb7 19. Rxb7 Rxb7 20. Qd5 Rb8 21. Nc4 Bb5 22. a4  $10)\n' +
        '\t\t\t({24:0} 18. ... Qb6 19. Rxb6 Rxb6 20. Nc4 Rb8 21. Nf4 Nf6 22. Nxd6+  $10)\n' +
        '\t\t\t({24:0.51} 18. ... Qxd2 19. Rxb8+ Bc8 20. Bxd2 Kd7 21. c4 Kc7 22. Rb3  $14)\n' +
        ' 19.    Nxb1\n' +
        '\t\t\t({24:-5.13} 19. Nxb1 Rxb1+ 20. Kf2 Nf6 21. e5 dxe5 22. Bxc5 Rb8  $19)\n' +
        '\t\t\t({24:-15.05} 19. Kf2 Qa1 20. Qe1 Qxa2 21. Bc1 Rb3 22. Nc4 Bxc3  $19)\n' +
        '\t\t\t({24:-15.06} 19. Nc1 Qb2 20. Nc4 Qxc3 21. Qxc3 Bxc3 22. Kf2 Rb1  $19)\n' +
        '\t\t\t({24:-18.45} 19. Qc1 Qxa2 20. Ng3 Rb2 21. Qf1 Qxa3 22. Bc1 Qxc3  $19)\n' +
        ' 19.     ...   Rxb1+\n' +
        '\t\t\t({24:-5.3} 19. ... Rxb1+ 20. Kf2 Nf6 21. e5 dxe5 22. Bxc5 Rb8 23. Qc2  $19)\n' +
        '\t\t\t({24:-1.6} 19. ... Nf6 20. Qc2 O-O 21. c4 Rb4 22. a3 Rb7 23. Nbc3  $19)\n' +
        '\t\t\t({24:-1.38} 19. ... h5 20. Na3 Nf6 21. Nc4 Be6 22. Qd3 Nd7 23. a4  $17)\n' +
        '\t\t\t({24:-1.18} 19. ... Rb7 20. Na3 Nf6 21. e5 dxe5 22. Nc4 e4 23. Bxc5  $17)\n' +
        ' *',
    expectedFenPos: '1r2k1nr/3bppb1/1q1p2pp/2p5/4P3/NpP1BP2/P2QN1PP/R4RK1',
    expectedFirstColorToMove: 'w',
    expectedFirstMove: 'Rfb1',
    expectedInitialPosition: '1r2k1nr/3bppb1/1q1p2pp/2p5/4P3/NpP1BP2/P2QN1PP/RR4K1 b',
}

const PGN_TEST_3 = {
    pgn: '[Event "?"]\n' +
        '[Site "?"]\n' +
        '[Date "????.??.??"]\n' +
        '[Round "?"]\n' +
        '[White "?"]\n' +
        '[Black "?"]\n' +
        '[Result "1-0"]\n' +
        '[SetUp "1"]\n' +
        '[FEN "r1b1r2k/ppp3pB/8/4pp2/3n3Q/2q2P2/P5PP/3R3K b - - 1 21"]\n' +
        '[Puzzle_Length "3"]\n' +
        '[Tactic_line "Bg6+ Kg8 Qd8+ Re8 Qxe8#"]\n' +
        '\n' +
        '21... Re6 22. dsdsdd ({-9.72} 22. Bxf5+ Kg8 23. Qh7+ Kf7 24. Qh5+ Ke7 25. Qg5+ Kf8\n' +
        '26. Bxe6 Nxe6 −+) 22... Kg8 23. Qd8+ ({-10.19} 23. Qh7+ Kf8 24. Qh8+ Ke7 25.\n' +
        'Qxg7+ Kd6 26. Bxf5 Re8 27. Bg6 Rd8 −+) ({-11.88} 23. Qh5 Qc2 24. Qh7+ Kf8 25.\n' +
        'Qh8+ Ke7 26. Qxg7+ Kd6 27. Rg1 Kc6 −+) 23... Re8 24. Qxe8# ({0.00} 24. Bxe8 Ne6\n' +
        '25. Qe7 Kh7 26. Qh4+ Kg8 27. Qe7 =) ({-11.82} 24. Qh4 Be6 25. Bxe8 Rxe8 26. Qe1\n' +
        'Qxe1+ 27. Rxe1 Bd5 28. Kg1 b5 −+) 1-0',
    expectedFenPos: 'r1b1r2k/ppp3pB/8/4pp2/3n3Q/2q2P2/P5PP/3R3K',
    expectedFirstColorToMove: 'b',
    expectedFirstMove: 'Re6',
}

const testData = [PGN_TEST_1, PGN_TEST_2, PGN_TEST_3]

function assert(testCaseName, iteration, expected, actual) {
    if (expected !== actual) {
        throw new Error(`Failed ${testCaseName} for iteration=${iteration}: expected=${expected}, actual=${actual}`)
    }
}

function runTests({extractFenPosFromPgn,extractFirstColorToMoveFromPgn,extractFirstMoveFromPgn}) {
    for (let i = 0; i < testData.length; i++) {
        const testDatum = testData[i]
        const pgn = testDatum.pgn;
        assert('FenPos', i, testDatum.expectedFenPos, extractFenPosFromPgn(pgn))
        assert('FirstColorToMove', i, testDatum.expectedFirstColorToMove, extractFirstColorToMoveFromPgn(pgn))
        assert('FirstMove', i, testDatum.expectedFirstMove, extractFirstMoveFromPgn(pgn))
    }
    console.log('ALL TESTS PASSED')
}
