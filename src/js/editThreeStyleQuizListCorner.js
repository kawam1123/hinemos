const rp = require('request-promise');
const config = require('./config');

// テキストボックスに入ってる文字で検索
// <あか|あ?|?か>
const searchThreeStyles = () => {
    const userName = localStorage.userName;
    const inputText = document.querySelector('.editQuizListForm__inputArea__text');
    const letters = inputText.value;

    const inputAreaUlistNode = document.querySelector('.editQuizListForm__inputArea .editQuizListForm__uList');

    // ulの現在の子を全て削除
    while (inputAreaUlistNode.firstChild) {
        inputAreaUlistNode.removeChild(inputAreaUlistNode.firstChild);
    };

    // なぜか、3文字以上あってもAPIがヒットしてしまうため
    if (letters.length > 2) {
        return;
    };

    const threeStyleOptions = {
        url: `${config.apiRoot}/threeStyleFromLetters/corner?userName=${userName}&letters=${letters}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    rp(threeStyleOptions)
        .then((ans) => {
            const results = ans.success.result;
            // const stickersHash = {};

            // 結果を追加
            // FIXME 1個しか入力しない場合はループで回す必要がない
            const stickers = results[0].stickers;
            // for (let i = 0; i < results.length; i++) {
            //     const stickers = results[i].stickers;
            // if (stickers in stickersHash) {
            //     continue;
            // }
            // stickersHash[stickers] = true;

            const liNode = document.createElement('li');
            const text = `${letters} (${stickers})`; // FIXME 正規表現verにする場合は、ここを変えないといけない
            liNode.appendChild(document.createTextNode(text));
            liNode.addEventListener('click', () => {
                inputAreaUlistNode.removeChild(liNode);
                addCandStickers(text);
            });
            inputAreaUlistNode.appendChild(liNode);
            // }
        })
        .catch(() => {
            // alert(err);
        });
};

// stickersを渡して、追加候補に入れる
const addCandStickers = (text) => {
    const addCandAreaUlistNode = document.querySelector('.editQuizListForm__addCandArea .editQuizListForm__uList--cand');

    const liNode = document.createElement('li');
    liNode.appendChild(document.createTextNode(text));
    liNode.addEventListener('click', () => {
        addCandAreaUlistNode.removeChild(liNode);
    });
    addCandAreaUlistNode.appendChild(liNode);
};

// stickersを渡して、削除候補に入れる
const deleteCandStickers = (text) => {
    const deleteCandAreaUlistNode = document.querySelector('.editQuizListForm__deleteCandArea .editQuizListForm__uList--cand');

    const liNode = document.createElement('li');
    liNode.appendChild(document.createTextNode(text));
    liNode.addEventListener('click', () => {
        deleteCandAreaUlistNode.removeChild(liNode);
    });
    deleteCandAreaUlistNode.appendChild(liNode);
};

const submit = () => {
    // 追加候補になっているものをまとめて、POST
    const token = localStorage.token;
    const registeredLiNodes = document.querySelectorAll('.editQuizListForm__registeredArea .editQuizListForm__uList li');
    const addCandLiNodes = document.querySelectorAll('.editQuizListForm__addCandArea .editQuizListForm__uList--cand li');
    const deleteCandLiNodes = document.querySelectorAll('.editQuizListForm__deleteCandArea .editQuizListForm__uList--cand li');

    // "UBL UFR DFR" -> true
    const stickersHash = {};

    // 最初から登録済のものをONに
    for (let i = 0; i < registeredLiNodes.length; i++) {
        const text = registeredLiNodes[i].textContent;
        const m = text.match(/\((\S{3} \S{3} \S{3})\)/);
        if (!m) {
            continue;
        }

        const stickers = m[1];
        stickersHash[stickers] = true;
    }

    // 追加候補のものをONに
    for (let i = 0; i < addCandLiNodes.length; i++) {
        const text = addCandLiNodes[i].textContent;
        const m = text.match(/\((\S{3} \S{3} \S{3})\)/);
        if (!m) {
            continue;
        }

        const stickers = m[1];
        stickersHash[stickers] = true;
    }

    // 削除候補のものをOFFに
    for (let i = 0; i < deleteCandLiNodes.length; i++) {
        const text = deleteCandLiNodes[i].textContent;
        const m = text.match(/\((\S{3} \S{3} \S{3})\)/);
        if (!m) {
            continue;
        }

        const stickers = m[1];
        stickersHash[stickers] = false;
    }

    // 登録
    const instances = [];
    const keys = Object.keys(stickersHash);
    for (let i = 0; i < keys.length; i++) {
        const stickers = keys[i];
        if (!stickersHash[stickers]) {
            continue;
        }

        const m = stickers.match(/(\S{3}) (\S{3}) (\S{3})/);
        if (!m) {
            continue;
        }
        const buffer = m[1];
        const sticker1 = m[2];
        const sticker2 = m[3];

        const instance = {
            buffer,
            sticker1,
            sticker2,
            stickers: `${buffer} ${sticker1} ${sticker2}`,
        };
        instances.push(instance);
    }

    const options = {
        url: `${config.apiRoot}/threeStyleQuizList/corner`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {
            token,
            threeStyleQuizList: instances,
        },
    };

    rp(options)
        .then(() => {
            alert('登録しました');
        })
        .catch((err) => {
            alert(`エラー: ${err}`);
        });
};

// 登録済の問題リストを読み込んで表示
const loadList = () => {
    const userName = localStorage.userName;

    const problemListOptions = {
        url: `${config.apiRoot}/threeStyleQuizList/corner/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    // ナンバリング
    const numberingOptions = {
        url: `${config.apiRoot}/numbering/corner/${userName}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    const registeredAreaUlistNode = document.querySelector('.editQuizListForm__registeredArea .editQuizListForm__uList');

    rp(numberingOptions)
        .then((ans) => {
            const numberings = ans.success.result;

            rp(problemListOptions)
                .then((ans) => {
                    const results = ans.success.result;

                    for (let i = 0; i < results.length; i++) {
                        const result = results[i];

                        const liNode = document.createElement('li');

                        const letter1 = numberings.filter(x => x.sticker === result.sticker1)[0].letter;
                        const letter2 = numberings.filter(x => x.sticker === result.sticker2)[0].letter;
                        const text = `${letter1}${letter2} (${result.stickers})`;

                        liNode.appendChild(document.createTextNode(text));
                        liNode.addEventListener('click', () => {
                            deleteCandStickers(text);
                        });
                        registeredAreaUlistNode.appendChild(liNode);
                    }
                })
                .catch(() => {
                    //
                });
        })
        .catch(() => {
            //
        });
};

const init = () => {
    // 内部表現
    // const addCandHash = {};
    // const deleteCandHash = {};

    const inputText = document.querySelector('.editQuizListForm__inputArea__text');
    inputText.addEventListener('keyup', searchThreeStyles);

    const buttons = document.querySelectorAll('.editQuizListForm__submitBtn');
    for (let i = 0; i < buttons.length; i++) {
        const button = buttons[i];
        button.addEventListener('click', submit);
    }

    loadList();
};

init();
