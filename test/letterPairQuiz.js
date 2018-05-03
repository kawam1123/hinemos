const assert = require('assert');
const letterPairQuiz = require('../src/js/letterPairQuiz');

describe('letterPairQuiz.js', () => {
    describe('selectSolvedLetterPairs()', () => {
        it('正常系: 両方とも空のときは空', () => {
            assert.deepEqual(letterPairQuiz.selectSolvedLetterPairs([], []), []);
        });

        it('正常系: 解いた問題が空のときは空', () => {
            assert.deepEqual(letterPairQuiz.selectSolvedLetterPairs([ undefined, ], []), []);
        });

        it('正常系: 登録済のレターペアが空のときは空', () => {
            assert.deepEqual(letterPairQuiz.selectSolvedLetterPairs([], [ undefined, ]), []);
        });

        it('正常系: 両方とも値がある', () => {
            const letterPairs = [
                { letters: 'あい', word: '合いの手', },
                { letters: 'あい', word: '愛', },
            ];

            const solvedQuizRes = [
                { userName: 'user1', letters: 'あい', avgSec: '3.0', },
            ];

            const actual = letterPairQuiz.selectSolvedLetterPairs(letterPairs, solvedQuizRes);
            const expected = [ { letters: 'あい', words: [ '合いの手', '愛', ], }, ];
            assert.deepEqual(actual, expected);
        });

        it('正常系: 登録済のレターペアのほうが多い', () => {
            const letterPairs = [
                { letters: 'あい', word: '合いの手', },
                { letters: 'あい', word: '愛', },
                { letters: 'あか', word: '赤', },
            ];

            const solvedQuizRes = [
                { userName: 'user1', letters: 'あい', avgSec: '3.0', },
            ];

            const actual = letterPairQuiz.selectSolvedLetterPairs(letterPairs, solvedQuizRes);
            const expected = [ { letters: 'あい', words: [ '合いの手', '愛', ], }, ];
            assert.deepEqual(actual, expected);
        });

        it('正常系: quizLogの順番を維持する', () => {
            const letterPairs = [
                { letters: 'あい', word: '合いの手', },
                { letters: 'あい', word: '愛', },
                { letters: 'あか', word: '赤', },
            ];

            const solvedQuizRes = [
                { userName: 'user1', letters: 'あか', avgSec: '4.0', },
                { userName: 'user1', letters: 'あい', avgSec: '3.0', },
            ];

            const actual = letterPairQuiz.selectSolvedLetterPairs(letterPairs, solvedQuizRes);
            const expected = [
                { letters: 'あか', words: [ '赤', ], },
                { letters: 'あい', words: [ '合いの手', '愛', ], },
            ];
            assert.deepEqual(actual, expected);
        });

        it('正常系: 削除済のレターペアは出題しない', () => {
            const letterPairs = [
                { letters: 'あか', word: '赤', },
            ];

            const solvedQuizRes = [
                { userName: 'user1', letters: 'あい', avgSec: '3.0', },
                { userName: 'user1', letters: 'あか', avgSec: '3.0', },
            ];

            const actual = letterPairQuiz.selectSolvedLetterPairs(letterPairs, solvedQuizRes);
            const expected = [ { letters: 'あか', words: [ '赤', ], }, ];
            assert.deepEqual(actual, expected);
        });
    });
});
