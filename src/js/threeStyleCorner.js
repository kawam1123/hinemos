const rp = require('request-promise');

// FIXME テスト書く
const isValidMoves = (moveStr) => {
    return /^(([BDFLRUEMS]w?)|[xyz])'?2?( (([BDFLRUEMS]w?)|[xyz])'?2?)*$/.test(moveStr);
};

const checkNew = () => {
    const lettersText = document.querySelector('.registerThreeStyleCornerForm__lettersText');
    const userName = localStorage.userName;
    const letters = lettersText.value.replace(/\s*$/, '');

    const options = {
        url: API_ROOT + '/threeStyleFromLetters/corner?userName=' + userName + '&letters=' + letters,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    rp(options)
        .then((ans) => {
            if (ans.success.result.length === 0) {
                lettersText.style.border = 'solid #00ff00';
            } else {
                lettersText.style.border = 'solid #ff0000';
            }
        })
        .catch(() => {
            lettersText.style.border = 'solid #ff0000';
        });
};

const saveThreeStyleCorner = () => {
    const lettersText = document.querySelector('.registerThreeStyleCornerForm__lettersText');
    const setupText = document.querySelector('.registerThreeStyleCornerForm__setupText');
    const move1Text = document.querySelector('.registerThreeStyleCornerForm__move1Text');
    const move2Text = document.querySelector('.registerThreeStyleCornerForm__move2Text');

    const userName = localStorage.userName;
    const token = localStorage.token;

    const letters = '@' + lettersText.replace(/\s*$/, '').value; // バッファを意味する'@'を付けておく
    const setup = setupText.value.replace(/\s*$/, '').replace(/^\s*/, '');
    const move1 = move1Text.value.replace(/\s*$/, '').replace(/^\s*/, '');
    const move2 = move2Text.value.replace(/\s*$/, '').replace(/^\s*/, '');

    if (move1 === '' || move2 === '') {
        alert('手順1と手順2を入力してください');
        return;
    }

    if ((setup !== '' && !isValidMoves(setup)) || !isValidMoves(move1) || !isValidMoves(move2)) {
        alert('手順の記法に誤りがあります。各操作の間にはスペースを入れてください。\n例: y Lw\'2 E U');
        return;
    }

    if (lettersText.value.length !== 2) {
        alert('ひらがなは2文字入力してください');
        return;
    }

    if (lettersText.value[0] === lettersText.value[1]) {
        alert('ひらがなの1文字目と2文字目は異なります');
        return;
    }

    // ひらがなをステッカーに変換する
    const numberingOptions = {
        url: API_ROOT + '/numbering/corner/' + userName + '?letters=' + letters,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        json: true,
        form: {},
    };

    rp(numberingOptions)
        .then((ans) => {
            const result = ans.success.result;
            if (result.length !== 3) {
                alert('ナンバリングに含まれていない文字を登録しようとしています。\n先に、ナンバリングを登録してください');
                return;
            }

            let stickers = [];
            for (let i = 0; i < letters.length; i++) {
                const ch = letters[i];
                const sticker = result.filter(x => x.letter === ch)[0].sticker;
                stickers.push(sticker);
            }

            const buffer = stickers[0];
            const sticker1 = stickers[1];
            const sticker2 = stickers[2];

            const threeStyleOptions = {
                url: API_ROOT + '/threeStyle/corner/',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                json: true,
                form: {
                    buffer,
                    sticker1,
                    sticker2,
                    setup,
                    move1,
                    move2,
                    token,
                },
            };

            return rp(threeStyleOptions)
                .then(() => {
                    lettersText.value = '';
                    setupText.value = '';
                    move1Text.value = '';
                    move2Text.value = '';
                })
                .catch(() => {
                    alert('登録に失敗しました');
                });
        })
        .catch(() => {
            alert('エラーが発生しました');
        });
};

const init = () => {
    const saveBtn = document.querySelector('.registerThreeStyleCornerForm__saveBtn');
    const checkBtn = document.querySelector('.registerThreeStyleCornerForm__checkBtn');

    saveBtn.addEventListener('click', saveThreeStyleCorner);
    checkBtn.addEventListener('click', checkNew);
};

init();
