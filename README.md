# pano-loop-lab

這是我自己的循環遠景搭景工具台，不是通用開源套件。

目標是快速建立一組可以橫向循環播放的遠方背景：

```text
plate 0 -> adapter 0→1 -> plate 1 -> adapter 1→2 -> ... -> adapter last→0
```

repo 不負責 AI 補圖，也不追求自動把兩張圖接得漂亮。它只做穩定、可預期的流水線：

- 上傳 plate
- 嚴格檢查尺寸
- 調整順序
- 依照順序自動推導 pair
- 自動產生 work adapter
- 讓我上傳 Photoshop 手修後的 finished adapter
- 批次下載所有 work adapter 給 Photoshop
- 追蹤每組 pair 是 finished 還是 work fallback
- 批次下載 finished adapters
- 匯出外部交付用 manifest
- 首頁即時用 finished adapter，沒有 finished 時就用 work adapter fallback

## 固定規格

這一版開始不再沿用舊的 `3136 / 523 / 2090` demo 規格。

```text
Plate:            6144 x 1536
Work adapter:     6144 x 1536
Finished adapter: 6144 x 1536

m = 1024
left edge  = 1024
X zone     = 4096
right edge = 1024

ratio = 1 : 4 : 1
```

work adapter 的組成方式：

```text
from plate 最右 1024px
+ 中間 4096px Photoshop 工作區
+ to plate 最左 1024px
```

X 區只是手修底稿，不做智慧融合、不做漸層遮醜。

## 使用

```bash
npm install
npm run dev
npm run build
```

首頁：

```text
http://localhost:5173/
```

工具台：

```text
http://localhost:5173/#adapter-workbench
```

## 保存與搬移

工具台會自動把目前場景保存到此瀏覽器的 IndexedDB。這是純前端保存，不需要後端；重整頁面或重啟 dev server 後，只要是同一個瀏覽器 origin，場景就會自動還原。

工具台左側的「匯出 config」仍然很重要：它是備份、搬到另一個瀏覽器、或避免瀏覽器資料被清掉時的保險。

scene config 會包含 plate / finished adapter 的圖片資料、順序、label 與目前幾何規格。匯入時會檢查版本、規格和圖片尺寸，不符合就拒絕。

## 圖片方向

第一組素材建議維持同一個世界觀、同一種地理氣質，但不要做同一張地圖換時間。

比較適合：

```text
開闊草坡與遠山村落
松林山脊與遠方小教堂
河谷、石橋、紅屋頂小鎮
湖面、遠山、遠方古堡或遺跡
```

也就是同一片中歐 / 類德國 / 阿爾卑斯前緣世界裡的不同段落。

## 目前狀態

工具台目前使用瀏覽器本地狀態加 IndexedDB 自動保存。也可以匯出 / 匯入 scene config。

舊的 `public/panos` demo 圖已移除。現在 runtime 靠內建 staging plates、瀏覽器上傳、或 scene config 匯入。

第一組 production source plates 已經放在：

```text
generated/production-plates/raw/
```

目前是四張 `6144 x 1536` PNG，可以用工具台替換進 plate slots，再下載 work adapters 給 Photoshop 手修。`generated/production-plates/contact-sheet-current.png` 只是檢查用 contact sheet，不是 runtime plate。

下一步會考慮：

- 修掉目前 Photoshop 成品裡那條可見接縫
- finished adapters 都確認後，從工具台匯出一份 scene config
- 視需要加入更完整的成品檢查清單
