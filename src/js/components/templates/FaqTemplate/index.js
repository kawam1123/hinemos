import React from 'react';
import Header from '../../organisms/Header';
import Paragraph from '../../molecules/Paragraph';

const FaqTemplate = (props) => (
    <div>
        <Header title="FAQ" />

        <main>
            <Paragraph
                title="不具合や要望を伝えたい"
                desc="誤字・不具合・ご要望はいずれかのアカウントにお気軽にご連絡ください。" />

            <ul>
                <li>公式アカウント(Twitter): <a href="https://twitter.com/hinemos_BLD">@hinemos_BLD</a></li>
                <ul>
                    <li>メンテナンス情報などを告知します</li>
                </ul>
                <li><a href="https://peing.net/ja/hinemos_bld">質問箱</a></li>
                <ul>
                    <li>匿名で質問したい方はこちらへ</li>
                </ul>
                <li>開発者(Twitter): <a href="https://twitter.com/sak_3x3x3">@sak_3x3x3</a></li>
            </ul>

            <Paragraph
                title="BLD Smart Timerの挙動"
                desc="既知のバグ・仕様FAQはこちらです。もしこの他に気になる点があれば開発者にご連絡いただけるとありがたいです。" />
            <ul>
                <li>仕様 (現時点で修正できる見込みが薄いもの)</li>
                    <ul>
                        <li>Giiker i3には対応していない? → していません、初代のGiikerのみに対応しております。</li>
                        <li>途中の回転が認識されず抜け落ちる → Giiker本体の問題かもしれません。Giikerの公式アプリでも回転が認識されないことがあるかどうか、ご確認ください</li>
                        <li>スライスムーブをすると表示がおかしくなる → 仕様です、今のところ直せません</li>
                        <li>最後にクリックが要るのはなぜ? ソルブ完了を自動認識できないの? → 仕様です、大会でのタイマーストップを意識しています。</li>
                        <li>キューブの画像の反映が遅い・完成状態のまま変化しない → 仕様です。参考程度にしてください。</li>
                    </ul>
                <li>バグ (修正の見込みがあるもの)</li>
                    <ul>
                        <li>白上緑前以外の向きを基準面にするとスライスムーブが正しく表示されない</li>
                        <li>手順と手順の間で勝手にキャンセルと認識されてしまい、2つの手順がくっついてしまう</li>
                        <li>「タイマーストップ」の値がマイナスになることがある</li>
                    </ul>
            </ul>

            <h2>3-styleの手順を一気に登録したい</h2>
            <p>できません。3-styleの手順を覚えていく時には、未知の手順は少しずつ登録したほうが良いと考えています。
    3-styleのクイズ機能は正解率の低い手順や、回すのに時間がかかっている手順を優先的に出題します。
    初めての手順を一度にたくさん登録してしまうと、同じ問題が出題されるまでの間隔が広がってしまい、再度出題された時には忘れてしまっている可能性が高くなります。
    そのため、<b>まずは簡単な手順から5個程度登録して、クイズ機能で充分に覚えた後で次の5個程度の手順を登録する、というサイクルをお勧めします。</b>焦りは禁物です。</p>

            <h2>「分析文字列から変換」で、エッジの分析のつもりでもコーナーの3-styleが表示される</h2>
            <p>仕様です。</p>

            <h2>「鮮度」って何?</h2>
            <p>おおざっぱに言うと、3-styleクイズなどで「直近で何日前にその問題を解いたか」を表す指標です。最大値は0で、全ての問題を24時間以内に解いた場合に実現します。</p>

            <h2>間違って登録していたデータを消してしまった</h2>
            <p>Twitter @hinemos_BLD にご連絡いただければ、復旧を試みます。</p>

            <h2>運営から返信が無い</h2>
            <p>見逃している可能性があるので、3日以上返答が無い場合はお手数ですが再度ご連絡いただけるとありがたいです。また、いわゆる鍵アカウントのユーザからの @hinemos_BLD アカウントへのリプライは見ることができません。一時的に鍵を外すか、他のユーザ経由で伝えていただくか、質問箱を使うかしてください。</p>

            <h2>自分のレターペアが他の人にサジェストされないようにしてほしい</h2>
            <p>レターペアをサジェストできることはhinemosの強みの一つですが、「自分がイメージしやすいが他の人には見られたくない言葉」があるのは事実だと思いますので、バランスを考えながらいずれは実現させる予定です</p>

            <h2>3-styleの手順にもサジェストが欲しい</h2>
            <p>レターペアと違い、手順には『ダメな手順』が存在し、そのような手順をサジェストするのは害であると考えているため、他userの手順サジェストは意図的に封印中です。その代わり「世界トップレベルの方々の手順表からサジェストする」機能を将来実装予定です。</p>

            <h2>問題リスト編集が使いにくい</h2>
            <p>「複数のリストを保存できるようにする」「前方一致や後方一致を使えるようにする」など、改善要望はいくつもいただいております。時間はかかってしまうと思いますが、実現予定です。</p>

            <h2>Twitterアカウントでログインしたい</h2>
            <p>機能を実現するために、Twitter社にAPI Tokenをリクエストしました。しばらくお待ちください。</p>

        </main>
    </div>
);

export default FaqTemplate;
