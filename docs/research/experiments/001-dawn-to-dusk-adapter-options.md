# EXPERIMENT_001 — Dawn to dusk adapter options

> Loop 1 design artifact. No images were generated in this turn.
> One boundary only: `dawn-valley -> dusk-ridge`.

- **Date:** 2026-06-17
- **Boundary:** `dawn-valley -> dusk-ridge`
- **Hypothesis tested:** H1 primary, with H4 as one deliberately bounded variant
- **Branch:** `exp/h1-dawn-dusk-adapter`

## Goal

Design three candidate adapter-generation experiments for Loop 2. The Runner must
choose exactly one candidate, generate exactly one new adapter variant, keep the
current baseline, inspect honestly at `blend = 0`, record the result, and stop.

The purpose is not to make the current three-scene demo prettier. The purpose is
to learn which generation method, if any, can become repeatable for arbitrary
adjacent scene plates.

## Candidate A — Full-reference pair bridge

### Hypothesis

H1: A dedicated `dawn-valley -> dusk-ridge` adapter generated from both full plates
can preserve the shared atmospheric language and produce a plausible transition
world, even if it may not weld exact ridge / lake geometry.

This is the baseline pair-specific method: feed both neighboring plates as
references and ask for a standalone bridge image that belongs to neither plate.

### Inputs / assets needed

- `public/panos/dawn-valley.jpg` as the left / source scene reference.
- `public/panos/dusk-ridge.jpg` as the right / destination scene reference.
- Current baseline adapter for comparison only:
  `public/panos/seams/dawn-valley__dusk-ridge.jpg`.

### Generation method

- Tool + model: Higgsfield `nano_banana_2`, `21:9`, `2k`.
- Use both full plates as `medias` with role `image`.
- Generate one standalone adapter candidate. Do not outpaint either plate. Do not
  overwrite the baseline seam.
- Suggested output path for Loop 2:
  `public/panos/adapters/dawn-valley__dusk-ridge/exp001-full-reference-v1.jpg`.

### Exact prompt strategy

```text
Create a standalone panoramic transition adapter between two adjacent scene
plates. The left reference is a soft dawn valley with pale sky, mist, distant
mountains, and calm lowland atmosphere. The right reference is a dusk ridge scene
with deeper twilight color, layered mountain silhouettes, and warm fading light.

The generated image must read as the transition world between them, not as a
collage and not as an extension of only one side. Preserve a calm cinematic
matte-painting style, wide 21:9 panoramic composition, atmospheric depth, soft
mist, distant ridgelines, and gentle tonal progression from dawn on the left to
dusk on the right.

Important constraints:
- The left edge should be visually compatible with the right edge of the dawn
  valley plate.
- The right edge should be visually compatible with the left edge of the dusk
  ridge plate.
- Avoid hard vertical seams, abrupt value jumps, pasted-looking landmarks,
  text, signs, people, buildings, UI elements, logos, or sharp foreground
  objects.
- Do not create a final combined panorama. Generate only the adapter image.
```

### Expected success

- Strongest chance of matching color palette, mood, sky softness, and general
  visual language.
- `blend = 16` should feel calm and production-plausible if structural conflicts
  are not too large.
- Useful as a reference point because it tests the simplest repeatable H1 method.

### Likely failure mode

- The adapter may average the two scenes tonally but fail structurally.
- Ridge lines, water / land shapes, or horizon height may still jump at one or
  both joins.
- It may look like a nice middle wallpaper rather than a boundary-aware adapter.

### Evaluation method

- In inspect mode, select `dawn-valley -> adapter` and `adapter -> dusk-ridge`.
- At `blend = 0`, inspect the raw butt-joins:
  - left join: no hard value break, compatible sky gradient, no sudden horizon
    height change, no obvious mountain / valley collision.
  - right join: no hard value break, compatible ridge scale, no abrupt switch from
    soft valley depth to dense dusk ridge shapes.
- At `blend = 16`, inspect whether feathering merely hides a failure or whether
  the raw structure was already acceptable.
- Compare against `public/panos/seams/dawn-valley__dusk-ridge.jpg`; do not judge
  on vibes alone.

### Future insertion check

Supported in principle. The method can be repeated for `A -> Christmas`,
`Christmas -> B`, `A -> Snow`, or `World Cup -> B` because it uses only the two
adjacent plates as references and does not modify either neighbor.

### Accept / reject / inconclusive criteria

- **ACCEPT:** At `blend = 0`, both joins avoid hard color / value breaks, horizon
  and major structures do not visibly collide, and the adapter reads as one
  journey rather than a wallpaper between two wallpapers.
- **REJECT:** At `blend = 0`, either join has a clear structural snap, major
  horizon jump, or obvious scene collision that `blend = 16` merely hides.
- **INCONCLUSIVE:** Tonal continuity improves over baseline, but one structural
  issue remains ambiguous enough that a stricter edge-anchored test is needed.

## Candidate B — Edge-anchored bridge from boundary crops

### Hypothesis

H1: Feeding only the relevant edge crops, rather than the full plates, will force
the model to respect the actual boundary geometry and create a better adapter
endpoint. This should test whether edge anchoring improves the raw `blend = 0`
joins.

### Inputs / assets needed

- Crop from the right side of `public/panos/dawn-valley.jpg`.
- Crop from the left side of `public/panos/dusk-ridge.jpg`.
- Suggested crop guidance: use the outer 20-30% of each plate as references. This
  is a temporary generation input only; it does not define or lock plate / seam /
  socket widths.
- Current baseline adapter for comparison only:
  `public/panos/seams/dawn-valley__dusk-ridge.jpg`.

### Generation method

- Tool + model: Higgsfield `nano_banana_2`, `21:9`, `2k`.
- Prepare two crop references for the Runner's generation session:
  - `dawn-valley` right edge crop.
  - `dusk-ridge` left edge crop.
- Generate one standalone adapter candidate from the two edge crops. Do not
  outpaint either source plate into the other. Do not overwrite the baseline seam.
- Suggested output path for Loop 2:
  `public/panos/adapters/dawn-valley__dusk-ridge/exp001-edge-anchored-v1.jpg`.

### Exact prompt strategy

```text
Create a standalone 21:9 panoramic transition adapter between two provided edge
references. The first reference is the actual right-edge crop of the dawn valley
plate; the second reference is the actual left-edge crop of the dusk ridge plate.

The generated adapter must be boundary-aware:
- Its left edge should continue naturally from the dawn valley edge crop.
- Its right edge should continue naturally into the dusk ridge edge crop.
- The middle may invent a believable atmospheric transition, but the endpoint
  geometry, horizon height, sky value, and large landform silhouettes must remain
  compatible with the corresponding edge crop.

Use a soft cinematic matte-painting style, atmospheric depth, distant mountain
layers, low-detail mist, and a gradual dawn-to-dusk light transition. Avoid sharp
foreground objects, hard vertical divisions, pasted landmarks, buildings, people,
text, logos, or anything that would expose the join.

Generate only the adapter image, not a combined panorama and not an outpainted
version of either source plate.
```

### Expected success

- Better `blend = 0` endpoint alignment than the full-reference approach.
- Less chance of the model inventing incompatible landforms at the joins.
- Most useful for learning whether pair-specific adapters need cropped edge
  references, not just full-scene references.

### Likely failure mode

- The generated middle may become compositionally weak or overly literal.
- The model may preserve the endpoints but create an awkward center transition.
- Crops may lack enough context to preserve the broader mood of the plates.

### Evaluation method

- In inspect mode, compare baseline vs candidate at the two raw joins.
- At `blend = 0`, prioritize endpoint truth over center beauty:
  - left join: does the adapter's left edge pick up the dawn valley edge without a
    value jump or landform collision?
  - right join: does the adapter's right edge meet the dusk ridge edge without a
    horizon or ridge-scale snap?
- At `blend = 16`, inspect whether the adapter becomes production-plausible after
  feathering while still being defensible at `blend = 0`.
- Record whether edge crops improved endpoint alignment compared with Candidate A
  expectations and the existing baseline.

### Future insertion check

Strongly supported if it works. Any future inserted scene can produce its own
left / right edge crops, so `A -> Christmas`, `Christmas -> B`, `A -> Snow`, and
`World Cup -> B` can each be generated without touching existing neighbors.

### Accept / reject / inconclusive criteria

- **ACCEPT:** At `blend = 0`, both endpoints are visibly better aligned than the
  baseline in structure and value, even if the adapter center is only adequate.
- **REJECT:** Edge crops do not improve the raw joins, or the adapter center
  becomes so incoherent that it cannot read as a transition world.
- **INCONCLUSIVE:** One endpoint improves but the other worsens, suggesting a
  revised crop width, prompt, or split-left/split-right generation test.

## Candidate C — Ritual mist / light veil bridge

### Hypothesis

H1 + bounded H4: For scene pairs that may never share perfect geography, a
pair-specific adapter can intentionally become a soft ritual transition: mist,
light, and drifting paper/ribbon-like atmosphere carry the viewer between worlds
without pretending the terrain is a precise physical weld.

This candidate tests whether a controlled "world hop" adapter is more repeatable
for future event inserts than a literal geographic bridge.

### Inputs / assets needed

- `public/panos/dawn-valley.jpg` as the left / source scene reference.
- `public/panos/dusk-ridge.jpg` as the right / destination scene reference.
- Optional reference crops may be prepared later only if the Runner chooses this
  candidate and wants endpoint anchoring, but Loop 2 should still run exactly one
  variant.
- Current baseline adapter for comparison only:
  `public/panos/seams/dawn-valley__dusk-ridge.jpg`.

### Generation method

- Tool + model: Higgsfield `nano_banana_2`, `21:9`, `2k`.
- Use both full plates as `medias` with role `image`.
- Prompt for a low-detail atmospheric veil that reduces structural collision risk
  while still preserving dawn-to-dusk color continuity.
- Do not add literal seasonal content yet. The point is to test the ritual
  transition mechanism, not Christmas / Snow / World Cup assets.
- Suggested output path for Loop 2:
  `public/panos/adapters/dawn-valley__dusk-ridge/exp001-ritual-veil-v1.jpg`.

### Exact prompt strategy

```text
Create a standalone 21:9 panoramic transition adapter between a dawn valley scene
and a dusk ridge scene. The adapter should feel like a gentle ritual passage
between adjacent worlds: soft mountain mist, luminous air, distant layered
silhouettes, subtle drifting paper-or-ribbon-like atmosphere, and a gradual shift
from pale dawn light on the left to warm dusk light on the right.

Keep the image cinematic, calm, painterly, and low-detail at the edges so it can
join two neighboring scene plates. The adapter should not pretend to be a precise
geographic extension of either plate; it should be a believable atmospheric
threshold that still respects the color, horizon height, and distant mountain
language of both references.

Avoid hard vertical seams, abrupt value changes, sharp foreground objects,
people, buildings, signs, text, logos, holiday-specific objects, sports objects,
or anything that turns the adapter into a separate poster.

Generate only the adapter image, not a combined panorama and not a permanent
outpaint of either source plate.
```

### Expected success

- Best chance of hiding unavoidable geography mismatch without relying only on
  CSS feathering.
- May create a repeatable transition language for event scenes whose geography
  cannot naturally match both neighbors.
- Should improve world-feel if the adapter reads as an intentional threshold
  rather than an accidental blur.

### Likely failure mode

- The image may become too foggy or generic, losing scene specificity.
- Paper / ribbon atmosphere may become decorative noise or create foreground
  clutter near the joins.
- It may pass at `blend = 16` but fail honesty at `blend = 0` if the raw edges
  still have hard color or horizon breaks.

### Evaluation method

- In inspect mode, evaluate both raw joins and the overall threshold read.
- At `blend = 0`, check whether the low-detail veil actually gives compatible
  edge values and horizon placement, or merely makes mismatch harder to name.
- At `blend = 16`, check whether the transition feels intentional and reusable,
  not like a smeared cover-up.
- Record whether the ritual language supports pluggability better than literal
  geography for this boundary.

### Future insertion check

Potentially strongest for Christmas / Snow / World Cup insertion because the
method can use scene-specific ritual cover while still leaving both neighbors
untouched. It must remain subtle enough that future seasonal variants do not feel
like unrelated posters inserted between plates.

### Accept / reject / inconclusive criteria

- **ACCEPT:** At `blend = 0`, raw joins are not worse than baseline, and at
  `blend = 16` the adapter reads as an intentional world transition that could be
  repeated for event inserts.
- **REJECT:** The adapter only works by becoming generic fog, creates visible edge
  breaks, or introduces decorative clutter that hurts the pano world.
- **INCONCLUSIVE:** It improves emotional continuity but weakens geographic
  continuity, requiring a later hybrid test with edge crops plus ritual veil.

## Loop 2 recommendation

Run **Candidate B — Edge-anchored bridge from boundary crops** first.

Reason: it most directly tests the currently hardest unknown: whether generation
can improve the real raw endpoint joins at `blend = 0`. Candidate A is simpler,
but similar to the existing baseline method. Candidate C is promising for event
inserts, but it should not be used to avoid the structural question before the
edge-anchored method has been tested.

Loop 2 must run only one variant and stop. It should not compare all three in one
turn.

## Result (filled in after running)

- Output asset path:
  `public/panos/adapters/dawn-valley__dusk-ridge/exp001-<variant>.jpg`
- Verdict: pending Loop 2
- Evidence (what `blend = 0` actually showed): pending Loop 2
- Next hypothesis / what to change: pending Loop 2
