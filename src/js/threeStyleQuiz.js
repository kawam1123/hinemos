const rp = require('request-promise');
const url = require('url');
const constant = require('./constant');
const config = require('./config');
const utils = require('./utils');

const getHint = (setup, move1, move2) => {
    if (setup === '') {
        return '(セットアップなし)';
    }

    // Cyclic Shiftの場合: 4手目まで返す
    if (move1.length === 0) {
        const setupList = setup.split(' ');
        return `[${setupList.slice(0, 4).join(' ')}    ]`;
    }

    // セットアップとmove1の1手目を返す
    const move1List = move1.split(' ');
    return `[${setup} [${move1List[0]}    ]]`;
};

const stickersToThreeStyles = (threeStyles, stickers) => {
    return {
        stickers,
        hints: threeStyles.filter(x => x.stickers === stickers).map(x => getHint(x.setup, x.move1, x.move2)),
        moves: threeStyles.filter(x => x.stickers === stickers).map(x => utils.showMove(x.setup, x.move1, x.move2)),
    };
};

// クイズに使うlettersを決定
// まだやっていない問題がある → それをやる
// やっていない問題がない → 正解数が少ないもの順
const selectThreeStyles = (threeStyles, quizLogRes) => {
    // セットアップ1手まで、5問以内にベタ打ち
    let setupMax = 100;
    if (localStorage.setupMax) {
        setupMax = localStorage.setupMax; // FIXME 公なオプションに直す
    }

    const smallThreeStyles = threeStyles.filter(x => x.setup.split(' ').length <= setupMax);

    const allThreeStyles = Array.from(new Set(smallThreeStyles.map(x => x.stickers)));
    const solvedThreeStyles = quizLogRes.map(x => x.stickers).filter(stickers => allThreeStyles.includes(stickers));
    const unsolvedThreeStyles = allThreeStyles.filter(x => !solvedThreeStyles.includes(x));

    return unsolvedThreeStyles.length > 0 ? unsolvedThreeStyles.map(stickers => stickersToThreeStyles(smallThreeStyles, stickers)) : solvedThreeStyles.map(stickers => stickersToThreeStyles(smallThreeStyles, stickers));
};

// threeStyleのうち、problemListに含まれるもののみを抽出
const selectFromManualList = (threeStyles, problemList) => {
    if (threeStyles.length === 0 || problemList.length === 0) {
        return [];
    }

    // stickers -> bool のハッシュ
    const problemHash = {};
    for (let i = 0; i < problemList.length; i++) {
        const stickers = problemList[i].stickers;
        problemHash[stickers] = true;
    }

    return threeStyles.filter(x => problemHash[x.stickers]);
};

const showHint = () => {
    const hintText = document.querySelector('.quizForm__hintText');
    hintText.style.display = 'block';
};

const submit = (part, letterPairs, numberings, selectedThreeStyles, isRecalled) => {
    const token = localStorage.token;
    const hintText = document.querySelector('.quizForm__hintText');
    const quizIndHidden = document.querySelector('.quizForm__quizIndHidden');
    const quizFormStartUnixTimeHidden = document.querySelector('.quizForm__startUnixTimeHidden');
    const quizFormLettersText = document.querySelector('.quizForm__lettersText');
    const quizFormPrevSecText = document.querySelector('.quizForm__prevSecText');
    const quizFormPrevAnsText = document.querySelector('.quizForm__prevAnsText');

    const usedHint = hintText.style.display === 'none' ? 0 : 1;

    const ind = parseInt(quizIndHidden.value.split(':')[1]);
    if (ind > selectedThreeStyles.length - 1) {
        return;
    }

    const stickers = selectedThreeStyles[ind].stickers;
    const lst = stickers.split(' ');
    const buffer = lst[0];
    const sticker1 = lst[1];
    const sticker2 = lst[2];
    const moves = selectedThreeStyles[ind].moves;

    const startTime = parseFloat(quizFormStartUnixTimeHidden.value);
    const now = new Date().getTime();
    const sec = (now - startTime) / 1000.0;

    // secが短すぎる場合、誤操作の可能性が高いので無視
    if (sec < 0.5) {
        return;
    }

    const sendSec = sec / 3.0; // 1回ぶん回すタイムに換算

    const options = {
        url: `${config.apiRoot}/threeStyleQuizLog/${part.name}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            buffer,
            sticker1,
            sticker2,
            usedHint,
            isRecalled,
            token,
            sec: sendSec,
        },
    };

    return rp(options)
        .then((ans) => {
            const prevAns = '前問の答え\n' + moves.join('\n');
            if (isRecalled === 0) {
                alert(prevAns);
            }
            const nextInd = ind + 1;

            if (nextInd <= selectedThreeStyles.length - 1) {
                quizFormStartUnixTimeHidden.value = String(new Date().getTime());
                quizIndHidden.value = `このセッションで解いた問題数:${nextInd}`;
                const letters = selectedThreeStyles[nextInd].stickers.split(' ').map(sticker => numberings.filter(x => x.sticker === sticker)[0].letter).join('').replace(/@/g, '');
                const words = letterPairs.filter(x => x.letters === letters).map(x => x.word).join(',');
                quizFormLettersText.value = `${letters}: ${words}`;

                const hints = selectedThreeStyles[nextInd].hints;
                hintText.style.display = 'none';
                hintText.value = hints.join('\nまたは\n');

                quizFormPrevAnsText.value = prevAns;
                quizFormPrevSecText.value = `前問の秒数:${sec.toFixed(2)}`;
            } else {
                quizIndHidden.value = `このセッションで解いた問題数:${nextInd}`;
                quizFormLettersText.value = 'お疲れ様です、ページを更新してください。';
                quizFormPrevAnsText.value = prevAns;
                quizFormPrevSecText.value = `前問の秒数:${sec.toFixed(2)}`;
            }
        })
        .catch((err) => {
            alert('通信に失敗しました:' + err);
        });
};

// 問題リストは、全問か、それとも自分で設定した問題のみか
const ProblemListType = {
    all: { value: 0, name: 'all', },
    manual: { value: 1, name: 'manual', },
};

// 右/左のボタンの挙動を設定
// 画面での配置を変えた時にはこれも変えないといけない
const keyUpAction = (part, letterPairs, numberings, selectedThreeStyles) => {
    return (evt) => {
        if (evt.which === 37) {
            // 左キー
            submit(part, letterPairs, numberings, selectedThreeStyles, 1);
        } else if (evt.which === 38) {
            // 上キー
        } else if (evt.which === 39) {
            // 右キー
            submit(part, letterPairs, numberings, selectedThreeStyles, 0);
        } else if (evt.which === 40) {
            // 下キー
            showHint();
        }
    };
};

const init = () => {
    const userName = localStorage.userName;
    const hintBtn = document.querySelector('.quizForm__submitBtn--hint');
    const okBtn = document.querySelector('.quizForm__submitBtn--OK');
    const ngBtn = document.querySelector('.quizForm__submitBtn--NG');
    const quizFormLettersText = document.querySelector('.quizForm__lettersText');
    const hintText = document.querySelector('.quizForm__hintText');
    const quizFormStartUnixTimeHidden = document.querySelector('.quizForm__startUnixTimeHidden');
    const h2Part = document.querySelector('.h2__part');

    // テスト時などは以降の処理をスキップ
    if (!quizFormLettersText) {
        return;
    }

    const urlObj = url.parse(location.href, true);

    // URLのオプションでpart=(corner|edgeMiddle)という形式で、パートが渡される
    // それ以外の場合はエラー
    const partQuery = urlObj.query.part;
    let part;
    if (partQuery === 'corner') {
        part = constant.partType.corner;
        h2Part.appendChild(document.createTextNode('コーナー'));
    } else if (partQuery === 'edgeMiddle') {
        part = constant.partType.edgeMiddle;
        h2Part.appendChild(document.createTextNode('エッジ'));
    } else {
        alert('URLが不正です: part=corner か part=edgeMiddle のどちらかを指定してください');
        return;
    }

    // URLでproblemListType=manualが指定された場合、自分が設定した問題でやる
    const problemListType = urlObj.query.problemListType === ProblemListType.manual.name ? ProblemListType.manual : ProblemListType.all;

    // 登録済の3-styleを持っておく
    const threeStyleOptions = {
        url: `${config.apiRoot}/threeStyle/${part.name}?userName=${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // クイズ履歴
    const quizOptions = {
        url: `${config.apiRoot}/threeStyleQuizLog/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // ナンバリング
    const numberingOptions = {
        url: `${config.apiRoot}/numbering/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // レターペア
    const letterPairOptions = {
        url: `${config.apiRoot}/letterPair?userName=${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // 登録した問題
    const problemListOptions = {
        url: `${config.apiRoot}/threeStyleQuizList/${part.name}/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    return rp(letterPairOptions)
        .then((ans) => {
            const letterPairs = ans.success.result;

            return rp(numberingOptions)
                .then((ans) => {
                    const numberings = ans.success.result;

                    if (numberings.length === 0) {
                        return;
                    }

                    return rp(quizOptions)
                        .then((ans) => {
                            const quizLogRes = ans.success.result;

                            return rp(threeStyleOptions)
                                .then((ans) => {
                                    const threeStyles = ans.success.result;

                                    return rp(problemListOptions)
                                        .then((ans) => {
                                            const problemList = ans.success.result;

                                            let selectedThreeStyles = [];

                                            if (problemListType === ProblemListType.all) {
                                                selectedThreeStyles = utils.chunkAndShuffle(selectThreeStyles(threeStyles, quizLogRes), 10);
                                            } else if (problemListType === ProblemListType.manual) {
                                                // 取得したproblemListとthreeStyleCornerを組み合わせて、
                                                // 問題リストを作る
                                                const manualThreeStyles = selectFromManualList(threeStyles, problemList);

                                                // FIXME 変な実装になっていて、selectThreeStyles()とは結果の形式が異なる
                                                selectedThreeStyles = utils.chunkAndShuffle(problemList.map(p => stickersToThreeStyles(manualThreeStyles, p.stickers)), 10);
                                            }

                                            if (selectedThreeStyles.length === 0) {
                                                alert('出題できる3-styleがありません。先に登録してください。');
                                                return;
                                            }

                                            const stickers = selectedThreeStyles[0].stickers;
                                            const lst = stickers.split(' ');
                                            // const buffer = lst[0];
                                            const sticker1 = lst[1];
                                            const sticker2 = lst[2];

                                            const letter1 = numberings.filter(x => x.sticker === sticker1)[0].letter;
                                            const letter2 = numberings.filter(x => x.sticker === sticker2)[0].letter;
                                            const letters = letter1 + letter2;
                                            const words = letterPairs.filter(x => x.letters === letters).map(x => x.word).join(',');
                                            quizFormLettersText.value = `${letters}: ${words}`;

                                            const hints = selectedThreeStyles[0].hints;
                                            hintText.style.display = 'none';
                                            hintText.value = hints.join('\nまたは\n');

                                            quizFormStartUnixTimeHidden.value = String(new Date().getTime());
                                            okBtn.addEventListener('click', () => submit(part, letterPairs, numberings, selectedThreeStyles, 1));
                                            ngBtn.addEventListener('click', () => submit(part, letterPairs, numberings, selectedThreeStyles, 0));
                                            hintBtn.addEventListener('click', showHint);

                                            // 左右のキーのショートカット
                                            document.onkeyup = keyUpAction(part, letterPairs, numberings, selectedThreeStyles);
                                        })
                                        .catch((err) => {
                                            alert('1' + err);
                                            // alert('エラー');
                                        });
                                })
                                .catch((err) => {
                                    alert('2' + err);
                                    // alert('エラー');
                                });
                        })
                        .catch((err) => {
                            alert('3' + err);
                            // alert('エラー');
                        });
                })
                .catch((err) => {
                    alert('4' + err);
                    // alert('エラー');
                });
        })
        .catch((err) => {
            alert('5' + err);
            // alert('エラー');
        });
};

init();

exports.getHint = getHint;
exports.selectFromManualList = selectFromManualList;