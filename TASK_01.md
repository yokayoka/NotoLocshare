# 取り組みたいこと  
- maff_elvchange.html の表示の改善

# 現在の問題点
- レイヤー 5m色別 の表示が value = 0　を挟んで、プラス側とマイナス側が、どちらも緑色系統なので識別しにくい。

# 改善のための提案
- 0 を白色に設定。
- -75 - 0 を青色～白色に、0 - 70m以上を白色～赤色に色調を変化させる。
- class のrangeは現在のものを踏襲する

# 実装の流れ
1. プロジェクトフォルダに移動する
2. 設計を行う
3. 実装する。修正したファイルは maff_elvchange2.html として保存する。
4. README.md に修正点を追記する。

# 注意点
- 5m色別 のレイヤーの値は 標高PNG のタイル　https://forestgeo.info/opendata/17_ishikawa/noto/henka_2024/{z}/{x}/{y}.png を float calculateAltitude(vec3 rgb) で計算した値を使用している。