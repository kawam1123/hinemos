const rp = require('request-promise');
const math = require('mathjs');
const url = require('url');
const config = require('./config');
const constant = require('./constant');
const threeStyleUtils = require('./threeStyleUtils');

const renderStats = (threeStyles, threeStyleQuizLog) => {
    const msgArea = document.querySelector('.msgArea');

    const threshold = 6.0;
    const threeStyleStickerSet = new Set(threeStyles.map(x => x.stickers));

    const avgSecs = threeStyleQuizLog.map(x => x.avg_sec);
    const over5Secs = avgSecs.filter(x => x >= threshold);
    const sum = math.sum(avgSecs);
    const mean = avgSecs.length === 0 ? 0 : math.mean(avgSecs);
    const sumOver5 = math.sum(over5Secs);
    const avgSecsIn6 = avgSecs.filter(x => x < threshold);
    const meanIn6 = avgSecsIn6.length === 0 ? 0 : math.mean(avgSecsIn6);

    const p1 = document.createElement('p');
    p1.appendChild(document.createTextNode(`所要時間合計: ${sum.toFixed(1)}秒 (${Math.floor(sum / 60)}分${(Math.floor(sum) % 60)}秒)`));
    msgArea.appendChild(p1);

    const p3 = document.createElement('p');
    // ここ、マジックナンバー入っている FIXME
    p3.appendChild(document.createTextNode(`28日間で解いた手順数: ${avgSecs.length}/${threeStyleStickerSet.size}手順`));
    msgArea.appendChild(p3);

    const p2 = document.createElement('p');
    p2.appendChild(document.createTextNode(`平均: ${mean.toFixed(2)}秒 (全体)`));
    msgArea.appendChild(p2);

    const p8 = document.createElement('p');
    p8.appendChild(document.createTextNode(`平均: ${meanIn6.toFixed(2)}秒 (${threshold}秒以内の手順)`));
    msgArea.appendChild(p8);

    const p4 = document.createElement('p');
    p4.appendChild(document.createTextNode(`${threshold}秒以上かかっている手順の数: ${over5Secs.length}手順`));
    msgArea.appendChild(p4);

    const p5 = document.createElement('p');
    p5.appendChild(document.createTextNode(`${threshold}秒以上かかっている手順の合計時間: ${sumOver5.toFixed(1)}秒 (${Math.floor(sumOver5 / 60)}分${(Math.floor(sumOver5) % 60)}秒)`));
    msgArea.appendChild(p5);

    const p6 = document.createElement('p');
    p6.appendChild(document.createTextNode(`${threshold}秒以上かかっている手順を3回ずつ回す練習にかかる時間: ${(sumOver5 * 3).toFixed(1)}秒 (${Math.floor(sumOver5 * 3 / 60)}分${Math.floor(sumOver5 * 3) % 60}秒)`));
    msgArea.appendChild(p6);
};

const init = () => {
    const userName = localStorage.userName;
    const h2Part = document.querySelector('.h2__part');

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

    return threeStyleUtils.getThreeStyles(userName, part)
        .then((threeStyles) => {
            return rp(quizOptions)
                .then((ans) => {
                    const threeStyleQuizLog = ans.success.result;
                    renderStats(threeStyles, threeStyleQuizLog);
                })
                .catch((err) => {
                    alert(`エラーが発生しました:${err}`);
                });
        })
        .catch((err) => {
            alert(`エラーが発生しました:${err}`);
        });
};

init();
