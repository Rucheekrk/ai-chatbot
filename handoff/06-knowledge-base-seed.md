# Knowledge Base Seed Documents

Drop these into your vector DB to make the demo scenarios resolve to real RAG hits.

Index each as a separate document, namespaced by `businessId`.

---

## Business: `lawn` — Green Acres Lawn Care

### `pricing.md`
```
## Mowing rates
- Weekly mowing: $45 (lots ≤ ¼ acre)
- Weekly mowing: $65 (¼ – ½ acre)
- Weekly mowing: $85 (> ½ acre)

Includes edging along walks/beds, string-trimming around obstacles, and blowing clippings off paths.

## Seasonal services
- Spring cleanup: $180–$320 depending on yard size
- Fall leaf removal: $150–$280
- Mulch installation: $85/yard installed
```

### `services.md`
```
Standard mowing service includes:
- Mowing at the appropriate height for the grass type (2.5"–3.5" for fescue, 1"–2" for bermuda)
- Edging along walks, driveways, and bed lines
- String-trimming around trees, poles, and fences
- Blowing clippings off all hard surfaces

We handle moderate slopes (up to ~15°). Steeper terrain requires an on-site assessment.
```

### `service-area.md`
```
## Service area
We serve Greenfield, Maple Park, Northside, and Westbrook within 12 miles of our office at 218 Oak St.

A handful of streets just past the Westbrook boundary are evaluated case-by-case based on drive time and crew schedule.
```

### `policies.md`
```
Specialized jobs (mixed grass types, steep terrain, large commercial properties, custom landscaping) are quoted by the owner after a site visit. We schedule those within 1 business day of the request.

Crew arrives in a 30-minute window. Service continues in light rain; heavy rain or thunderstorms reschedule to the next available day.
```

---

## Business: `windows` — Crystal View Window Cleaning

### `pricing.md`
```
## Residential rates
- Standard home (≤20 windows, 1 story): exterior $135, interior + exterior $215
- Two-story add: +$60 per side requiring extension equipment
- Per-window over 20: +$6 each

## Commercial / storefront
- Storefront route pricing: starts at $85/visit on weekly cadence
- Volume discount: 10% at 4+ locations
```

### `commercial.md`
```
Storefront route pricing starts at $85/visit, weekly cadence. Volume discounts at 4+ locations.

For high-rise, atrium, or curved-glass jobs, we quote after a site walk. Custom commercial bids return within 1 business day.
```

### `service-area.md`
```
## Coverage map
- Zip codes 421xx–425xx (primary service area, no travel fee)
- Eastpoint (42610) and Riverdale (42720) included
- Cross-river jobs: $25 flat travel fee
```

### `screens-tracks.md`
```
Screen cleaning is included with interior wash at no extra cost.
Track detail (deep clean of window tracks): optional $25 add-on.
Storm-window service: $8 per window.
```

### `policies.md`
```
Insured and bonded ($2M liability).
Streak guarantee: if any window streaks within 48h on a clear day, we re-clean free.
Travel surcharge: $25 flat for any job south of the river or outside the standard 421–425 ring.
```

---

## Business: `auto` — Bramble's Auto Detailing

### `menu.md`
```
## Detail menu
- Express Detail: $89 (exterior wash, vacuum, interior wipe-down)
- Full Interior + Exterior: $179
- Paint Correction + Ceramic Coat: from $549 (depending on vehicle size + correction level)

Vehicle size surcharges:
- Mid-size SUV / truck: +$20
- Full-size SUV / 3-row: +$40
```

### `addons.md`
```
- Pet hair removal: +$25
- Engine bay degrease: +$40
- Headlight restoration: +$60/pair
- Leather conditioning: +$35
- Odor treatment (ozone): +$75
```

### `service-area.md`
```
## Coverage
Mobile detailing inside the I-285 perimeter at no charge.
Outside-perimeter cities served with $20 flat travel fee:
- Sandy Springs
- Decatur
- Marietta
```

### `policies.md`
```
Mobile service requires water and power access at the location, OR +$15 self-supplied surcharge.
Outside-perimeter visits require water + power access OR the +$15 self-supplied surcharge plus the $20 travel fee.

Paint correction and wet-sanding require an in-person paint assessment first. We schedule the assessment within 1 business day.
```
