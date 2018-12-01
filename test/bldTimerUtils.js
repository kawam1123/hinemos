const assert = require('assert');
const bldTimerUtils = require('../src/js/bldTimerUtils');

const inputStr = `
L' 1542472521000
@ 1542472522618
U' 1542472532618
L' 1542472533397
U 1542472534178
L 1542472535438
R' 1542472535438
L 1542472536337
R' 1542472536338
D' 1542472537298
L 1542472537717
D 1542472538197
D' 1542472540537
L' 1542472541318
L' 1542472541497
D 1542472542278
L 1542472546477
R' 1542472546537
L 1542472547497
R' 1542472547557
U' 1542472548577
L' 1542472549237
L' 1542472549357
U 1542472550077
U' 1542472552657
L 1542472553376
U 1542472554096
R' 1542472554936
L 1542472554937
L 1542472555657
R' 1542472555657
D' 1542472556376
L' 1542472557036
D 1542472557816
L' 1542472563337
D' 1542472563756
L 1542472564176
D 1542472564656
L 1542472565736
R' 1542472566336
L 1542472566457
R' 1542472566457
U' 1542472567236
L' 1542472567657
U 1542472568136
L 1542472568496
U' 1542472570536
L' 1542472571016
U 1542472571496
L 1542472572276
R' 1542472572276
R' 1542472573056
L 1542472573057
D' 1542472573836
L 1542472574255
D 1542472574676
U' 1542472582236
L' 1542472583195
L' 1542472583376
U 1542472584156
L 1542472585056
R' 1542472585115
L 1542472585836
R' 1542472585836
D' 1542472586555
L' 1542472587335
L' 1542472587455
D 1542472588295
F' 1542472591056
D 1542472591715
R 1542472593035
U' 1542472593394
R' 1542472593935
U' 1542472594415
R 1542472595194
U 1542472595495
R' 1542472596035
F' 1542472596514
R 1542472597115
U 1542472597235
R' 1542472597715
U' 1542472598075
R' 1542472598975
F 1542472599395
R 1542472599755
D' 1542472601315
F 1542472602035
F' 1542472603954
R 1542472604734
U' 1542472605034
R' 1542472605454
U' 1542472605815
R 1542472606300
U 1542472606534
R' 1542472606600
F' 1542472607315
R 1542472607794
U 1542472607974
R' 1542472608454
U' 1542472608813
R' 1542472609474
F 1542472609835
R 1542472610254
F 1542472611154
D' 1542472613014
R2' 1542472614634
U' 1542472615294
R' 1542472615714
U' 1542472615955
R 1542472616074
U 1542472616075
R' 1542472616076
F' 1542472617454
R 1542472617814
U 1542472618114
R' 1542472618474
U' 1542472618714
R' 1542472619074
F 1542472619313
D 1542472620274
`.slice(1);

describe('bldTimerUtils.js', () => {
    describe('splitMoveOpsSeq()', () => {
        // これは、M列と持ち替え記号を消さないロジックの場合
        // it('正常系: スクランブル:L\'', () => {
        //     const moves = bldTimerUtils.parseMoveHistoryStr(inputStr);
        //     const actual = bldTimerUtils.splitMoveOpsSeq(moves);
        //     assert.deepStrictEqual(actual.length, 9); // エッジ5、コーナー3、パリティ処理
        // });

        // これは、M列と持ち替え記号を消さないロジックの場合
        // it('正常系: スクランブル:L\' M列表記にする場合', () => {
        //     const moves = bldTimerUtils.parseMoveHistoryStr(inputStr);
        //     const merged = bldTimerUtils.mergeSliceAuto(moves);
        //     const actual = bldTimerUtils.splitMoveOpsSeq(merged);
        //     console.log(JSON.stringify(actual[0]));
        //     assert.deepStrictEqual(actual.length, 9); // エッジ5、コーナー3、パリティ処理
        // });

        it('正常系: スクランブル:L\' M列表記にして、更に回転記号を消した場合', () => {
            const moves = bldTimerUtils.parseMoveHistoryStr(inputStr);
            const merged = bldTimerUtils.mergeSliceAuto(moves);
            const rotated = bldTimerUtils.mergeRotationAfterSlice(merged);
            const actual = bldTimerUtils.splitMoveOpsSeq(rotated);
            // for (let i = 0; i < actual.length; i++) {
            //     console.log(JSON.stringify(actual[i]));
            // }

            assert.deepStrictEqual(actual.length, 9); // エッジ5、コーナー3、パリティ処理
        });
    });

    describe('compareMovesAndScramble()', () => {
        it('正常系', () => {
            const moves = [ 'U', 'R', 'L', ];
            const scramble = [ 'U', 'R', 'D', ];
            const actual = bldTimerUtils.compareMovesAndScramble(moves, scramble);
            const expected = {
                match: [ 'U', 'R', ],
                overdo: [ 'L', ],
                remain: [ 'D', ],
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 90度だけ回す部分で180度回した', () => {
            const moves = [ 'U', 'R', 'L2', ];
            const scramble = [ 'U', 'R', 'L', ];
            const actual = bldTimerUtils.compareMovesAndScramble(moves, scramble);
            const expected = {
                match: [ 'U', 'R', 'L', ],
                overdo: [ 'L', ],
                remain: [],
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: スクランブル180度回転のうち90度だけ一致', () => {
            const moves = [ 'U', 'R', 'L', ];
            const scramble = [ 'U', 'R', 'L2', ];
            const actual = bldTimerUtils.compareMovesAndScramble(moves, scramble);
            const expected = {
                match: [ 'U', 'R', 'L', ],
                overdo: [],
                remain: [ 'L', ],
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: スクランブル180度回転のうち90度だけ一致、正規化前を返す', () => {
            const moves = [ 'U', 'R', 'L', ];
            const scramble = [ 'U', 'R', 'L2', 'D2', 'R', ];
            const actual = bldTimerUtils.compareMovesAndScramble(moves, scramble);
            const expected = {
                match: [ 'U', 'R', 'L', ],
                overdo: [],
                remain: [ 'L', 'D2', 'R', ],
            };
            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: プライム', () => {
            const moves = [ 'F', 'D2', 'L', ];
            // eslint-disable-next-line quotes
            const scramble = [ 'F', 'D2', 'L', "D'", ];
            const actual = bldTimerUtils.compareMovesAndScramble(moves, scramble);
            const expected = {
                match: [ 'F', 'D2', 'L', ],
                overdo: [],
                // eslint-disable-next-line quotes
                remain: [ "D'", ],
            };
            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('mergeSliceAuto()', () => {
        it('正常系: L R\' -> M', () => {
            const MoveOps = bldTimerUtils.MoveOps;
            const moveOpsList = [
                new MoveOps('U', 0),
                new MoveOps('L', 15),
                new MoveOps('R\'', 30),
            ];

            const actual = bldTimerUtils.mergeSliceAuto(moveOpsList);
            const expected = [
                new MoveOps('U', 0),
                new MoveOps('M\'', 30),
                new MoveOps('x\'', 30),
            ];

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: L2 R2 -> M2', () => {
            const MoveOps = bldTimerUtils.MoveOps;
            const moveOpsList = [
                new MoveOps('L2', 0),
                new MoveOps('R2', 15),
            ];

            const actual = bldTimerUtils.mergeSliceAuto(moveOpsList);
            const expected = [
                new MoveOps('M2', 15),
                new MoveOps('x2', 15),
            ];

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: R\' L2 R\'-> M2', () => {
            const MoveOps = bldTimerUtils.MoveOps;
            const moveOpsList = [
                new MoveOps('R\'', 0),
                new MoveOps('L2', 15),
                new MoveOps('R\'', 30),
            ];

            const actual = bldTimerUtils.mergeSliceAuto(moveOpsList);
            const expected = [
                new MoveOps('M2', 30),
                new MoveOps('x2', 30),
            ];

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: @をまたいでのマージはしない', () => {
            const MoveOps = bldTimerUtils.MoveOps;
            const moveOpsList = [
                new MoveOps('L2', 0),
                new MoveOps('@', 15),
                new MoveOps('R2', 30),
            ];

            const actual = bldTimerUtils.mergeSliceAuto(moveOpsList);
            const expected = [
                new MoveOps('L2', 0),
                new MoveOps('@', 15),
                new MoveOps('R2', 30),
            ];

            assert.deepStrictEqual(actual, expected);
        });
    });

    describe('mergeRotationAfterSlice()', () => {
        it('正常系: x2', () => {
            const MoveOps = bldTimerUtils.MoveOps;
            const moveOpsList = [
                new MoveOps('U', 0),
                new MoveOps('x2', 0),
                new MoveOps('U', 30),
            ];

            const actual = bldTimerUtils.mergeRotationAfterSlice(moveOpsList);
            const expected = [
                new MoveOps('U', 0),
                new MoveOps('D', 30),
            ];

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: S z\' R2', () => {
            const MoveOps = bldTimerUtils.MoveOps;
            const moveOpsList = [
                new MoveOps('S', 0),
                new MoveOps('z\'', 0),
                new MoveOps('R2', 30),
            ];

            const actual = bldTimerUtils.mergeRotationAfterSlice(moveOpsList);
            const expected = [
                new MoveOps('S', 0),
                new MoveOps('D2', 30),
            ];

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: x4', () => {
            const MoveOps = bldTimerUtils.MoveOps;
            const moveOpsList = [
                new MoveOps('x4', 0),
                new MoveOps('M', 1),
                new MoveOps('S', 2),
                new MoveOps('E', 3),
            ];

            const actual = bldTimerUtils.mergeRotationAfterSlice(moveOpsList);
            const expected = [
                new MoveOps('M', 1),
                new MoveOps('S', 2),
                new MoveOps('E', 3),
            ];

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: UFステッカーの手順', () => {
            const MoveOps = bldTimerUtils.MoveOps;
            /* eslint-disable */
            const moveOpsList = [
                new MoveOps("x2", 1542901411987),
                new MoveOps("D'", 1542901411988),
                new MoveOps("D'", 1542901412048),
                new MoveOps("M'", 1542901412234),
                new MoveOps("x'", 1542901412234),
                // new MoveOps("L", 1542901412228),
                // new MoveOps("R'", 1542901412234),
                new MoveOps("B'", 1542901412407),
                new MoveOps("B'", 1542901412468),
                // new MoveOps("R'", 1542901412588),
                // new MoveOps("L", 1542901412593),
                new MoveOps("M'", 1542901412593),
                new MoveOps("x'", 1542901412593),
            ];

            const actual = bldTimerUtils.mergeRotationAfterSlice(moveOpsList);
            const expected = [
                new MoveOps("U'", 1542901411988),
                new MoveOps("U'", 1542901412048),
                new MoveOps("M'", 1542901412234),
                new MoveOps("U'", 1542901412407),
                new MoveOps("U'", 1542901412468),
                new MoveOps("M'", 1542901412593),
            ];
            /* eslint-enable */

            assert.deepStrictEqual(actual, expected);
        });

        it('正常系: 2ステッカー', () => {
            const MoveOps = bldTimerUtils.MoveOps;
            /* eslint-disable */
            const moveOpsList = [
                new MoveOps("L'", 1542901409889),
                new MoveOps("U'", 1542901410008),
                new MoveOps("L", 1542901410128),
                new MoveOps("U", 1542901410248),
                new MoveOps("M2", 1542901410788),
                new MoveOps("x2", 1542901410788),
                new MoveOps("D'", 1542901410848),
                new MoveOps("L'", 1542901411027),
                new MoveOps("D", 1542901411088),
                new MoveOps("L", 1542901411268),

                new MoveOps("D'", 1542901411988),
                new MoveOps("D'", 1542901412048),
                new MoveOps("M'", 1542901412234),
                new MoveOps("x'", 1542901412234),
                new MoveOps("B'", 1542901412407),
                new MoveOps("B'", 1542901412468),
                new MoveOps("M'", 1542901412593),
                new MoveOps("x'", 1542901412593),
            ];

            const actual = bldTimerUtils.mergeRotationAfterSlice(moveOpsList);
            const expected = [
                new MoveOps("L'", 1542901409889),
                new MoveOps("U'", 1542901410008),
                new MoveOps("L", 1542901410128),
                new MoveOps("U", 1542901410248),
                new MoveOps("M2", 1542901410788),
                new MoveOps("U'", 1542901410848),
                new MoveOps("L'", 1542901411027),
                new MoveOps("U", 1542901411088),
                new MoveOps("L", 1542901411268),

                new MoveOps("U'", 1542901411988),
                new MoveOps("U'", 1542901412048),
                new MoveOps("M'", 1542901412234),
                new MoveOps("U'", 1542901412407),
                new MoveOps("U'", 1542901412468),
                new MoveOps("M'", 1542901412593),
            ];
            /* eslint-enable */

            assert.deepStrictEqual(actual, expected);
        });
    });
});
