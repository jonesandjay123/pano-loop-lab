# NEXT.md

下一步建議：

1. 修目前四區 production loop 裡那條可見 Photoshop seam artifact。
2. 重新載入 `/#adapter-workbench`，上傳修正後的 finished adapter，確認首頁 loop。
3. 同步更新 `public/panos/production/scene.json` 與 `public/panos/production/world-ring.json`。
4. 在 `jovicheer-world-stage` 依照 `docs/research/JOVICHEER_WORLD_STAGE_HANDOFF.md` 做第一個最小 consume slice：讀 world-ring manifest、flatten region/adapter sequence、渲染背景 ring、發布 world telemetry。
5. 如果 consumer 真的需要新欄位，再回到 `src/pano/worldRingPackage.ts` 擴 schema；不要先加 runtime 行為到這個 repo。

不要加回 legacy research candidates、old seam registries、GPT/HF sweeps，或固定 A/B/C assumptions。不要把 workbench UI 搬進 `jovicheer-world-stage`。
