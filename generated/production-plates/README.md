# Production plates

這個資料夾保存目前 production ring 的來源素材與 Photoshop finished adapter 工作成果。真正給 app / consumer 讀取的 Git-synced preset 會 mirror 到 `public/panos/production/`。

## Current set

```text
raw/01-plate.png
raw/02-plate.png
raw/03-plate.png
raw/04-plate.png
```

四張 plate 都必須是精準 `6144 x 1536`。

`contact-sheet-current.png` 只用來檢查，不是 runtime plate，也不要寫進 world-ring package。

## Finished adapters

Photoshop-filled connection images 放在：

```text
finished-adapters/
```

每張都必須是完整 `6144 x 1536` adapter：

```text
left 1024px source edge + filled 4096px X zone + right 1024px target edge
```

目前四區 loop 的檔名：

```text
01-to-02-finished.png
02-to-03-finished.png
03-to-04-finished.png
04-to-01-finished.png
```

## Runtime mirror

app runtime preset mirror 在：

```text
public/panos/production/scene.json
public/panos/production/world-ring.json
public/panos/production/raw/
public/panos/production/finished-adapters/
```

`scene.json` 是 workbench / preview 用的 production preset。`world-ring.json` 是給 `jovicheer-world-stage` consume 的 schema manifest。

## Usage

1. 開啟 `/#adapter-workbench`。
2. 使用 `raw/` 裡的 plate 建立或替換 slots。
3. 下載 generated work adapters。
4. 在 Photoshop 補完中間 X zone。
5. 將完整 finished adapter 存到 `finished-adapters/`。
6. 上傳 finished adapters 回 matching pairs。
7. 確認 loop preview。
8. 更新 runtime mirror 與 `world-ring.json`。
