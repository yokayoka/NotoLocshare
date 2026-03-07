 # 作業のイメージ
maff_elvchange3.html に  \src\ffpri_json\fill.geojson のポリゴンを追加する。このポリゴンレイヤーは能登半島における大規模盛土の分布を示す。
 
# fill.geojsonの表示条件
- 線の色はオレンジ色にする
- fill color もオレンジ色で透過度を50%に設定する
- attribution に 作成機関は森林総合研究所で Bridge Project の予算の成果であること示すため"FFPRI & Bridge Project" のような表記を行う。

# mapcontrolの変更 
- 追加したgeojsonをオーバーレイに追加する。名称は”盛土”とする。


# 制約事項
- Leafletを使う
- scriptが長い場合は見通しをよく留守ために、jsファイルとして分離する
- 修正版は maff_elvchange3.html として保存する
# 実装の流れ（固定）
1. プロジェクトフォルダに移動する
2. 設計を行う
3. 実装する
4. README.md に仕様をまとめる
 
# 注意点
 
- ファイル内コメントなどはすべて日本語を使用する
 
# 命令
 
上記のタスクを進めてください。