# Manual Inpaint Workflow

1. Open `/#adapter-workbench`.
2. Download the work canvas for `AXB`, `BXC`, or `CXA`.
3. Fill the X region in Photoshop / Kling / Midjourney / Firefly.
4. Export the full `[A][X][B]` image at `3136 x 1344`.
5. Add the completed image under:

```text
public/panos/adapters-clean/
```

6. Wire the corresponding pair in `src/pano/panoRing.ts` to the completed image.

The runtime uses full AXB images with `523px` anchor overlap on both sides. Anchors
are sockets; X is the visible transition.
