# DR-LfD — Content Source of Truth (numbers + narrative for the web)

All figures extracted from `~/yzchen_ws/LfD-TAMP-TRO-response`. Put **DR-LfD as the last, bolded row** in every table.

## One-line pitch
Decompose demonstrations into atomic, contact-defined skills; let a TAMP solver put them back together for novel long-horizon tasks. Demo data scales with the **number of skill types**, not the length of the sequence.

## Pipeline (5 steps)
1. **Demonstration** (teleop / video).
2. **VLM-assisted contact-aware decomposition** (Qwen-VL-Max) → atomic skills with precondition graph `G_pre` / effect graph `G_eff`; contact changes mark skill boundaries.
3. **Skill repertoire:** (a) object-centric **primitives** = SO(3)-equivariant diffusion (VN-DGCNN) predicting SE(3)+finger trajectory; (b) **visuomotor policies** (any IL algo) + diffusion **keypose predictor** keeping observations in-distribution; (c) **predefined TAMP** transit/transfer.
4. **TAMP reorganization:** skills wrapped as PDDLStream stream functions (`LearnedAttach/Detach/UniKeyPose/BiKeyPose/PostGrasp`); constraints `IsReachable` (reachability maps) and `IsSafePolicy` (Minimum-Distance-Field). Auto-built PDDL schema.
5. **Online perceive–plan–act–verify:** coarse skeleton → local TAMP → execute → contact-triggered verify → replan on failure.

## Why it works (3)
- **Combinatorial → linear** demonstration burden (TAMP owns sequencing).
- **Keyposes** guarantee the policy starts in-distribution.
- **Constraints first-class** → planner inserts regrasp / obstacle-removal that pure IL cannot.

---

## Stat callouts (hero numbers)
- **88–100%** peg-in-hole vs **2–54%** (ACT/DP) — ~7× stronger baseline.
- **70–90%** DexMimicGen with **100 demos** > DP/SDP with **1000 demos**.
- **55–70%** under *unreachable/unsafe*; IL baselines = **0%**.
- **98%** LIBERO Spatial & Object (closed-loop).

---

## T1 — Simulated Peg-in-Hole `tab:sim_ood` (n=50)
| Setup | Method | Succ % | Time (s) |
|---|---|---|---|
| ID | ACT | 44 | 7.52±1.32 |
| ID | DP | 54 | 8.66±1.14 |
| ID | **DR-LfD** | **100** | 10.21±1.84 |
| XY-OOD | ACT | 38 | 7.98±1.29 |
| XY-OOD | DP | 42 | 9.22±0.97 |
| XY-OOD | **DR-LfD** | **100** | 10.75±2.30 |
| XYH-OOD | ACT | 2 | — |
| XYH-OOD | DP | 12 | 9.44±1.02 |
| XYH-OOD | **DR-LfD** | **88** | 12.75±2.46 |

## T2 — Real-world `tab:real_ood` (n=20/setting). Methods: DP, π₀.₅, DR-LfD
| Task | Setup | DP | π₀.₅ | DR-LfD |
|---|---|---|---|---|
| Handoff | ID | 90 | 100 | **100** |
| Handoff | OOD | 30 | 20 | **95** |
| Handoff | Leaky | 60 | 90 | **100** |
| Screwdriver | ID | 55 | 60 | **80** |
| Screwdriver | OOD | 10 | 10 | **80** |
| Screwdriver | Leaky | 0 | **75** | 65 |
| Cup-sleeve | ID | 75 | **85** | 80 |
| Cup-sleeve | OOD | 35 | 25 | **75** |
| Cup-sleeve | Leaky | 35 | 35 | **40** |

*Honest note:* Cup-sleeve **Leaky** is low for all methods — fine-grained insertion × distribution shift × noisy single-view depth drifting the primitive.

## T3 — Constraint handling `tab:sim_long` (n=20, 60s cap; ACT/DP = 0% both)
| Setup | Succ % | Comp. time (s) |
|---|---|---|
| ID | 100 | 7.55 |
| Unreachable | 55 | 12.36 |
| Unsafe | 70 | 27.39 |

## T4 — LIBERO `tab:libero_results` (Succ %)
| Method | Spatial | Object | Long1 | Long5 | Long8 |
|---|---|---|---|---|---|
| DP (10 demos) | 66 | 58 | 20 | 50 | 10 |
| DP (50 demos) | 84 | 78 | 30 | 90 | 70 |
| NOD-TAMP | 84 | 94 | 70 | 70 | 90 |
| DR-LfD (Open-loop GPD) | 34 | 15 | 0 | 0 | 0 |
| DR-LfD (Open-loop M2T2) | 82 | 53 | 0 | 20 | 10 |
| DR-LfD (Open-loop) | 95 | 96 | 80 | 90 | 30 |
| **DR-LfD (Closed-loop)** | **98** | **98** | **80** | **90** | **90** |

## T5 — DexMimicGen `tab:dexmimicgen` (Succ %)
| Method | Two-Arm Threading | Two-Arm Assembly |
|---|---|---|
| DP (100) | 25 | 50 |
| DP (1000) | 45 | 70 |
| SDP (100) | 25 | 45 |
| SDP (1000) | 50 | 60 |
| DR-LfD (Planned Contact) | 0 | 35 |
| **DR-LfD (100 demos)** | **70** | **90** |

## Ablation — training background of sub-skill (during Cup-Sponge-Screwdriver)
- Clean background (a4): **35%** success, **10.35** avg steps completed.
- Cluttered background (a1): **50%** success, **15.30** avg steps.
- Point: DR-LfD localizes subgoal failures → fix the weak sub-skill in isolation.

## Figures to reuse (convert PDF→PNG, `public/paper-figures/`)
- `overall-diagram.pdf`, `tro-teaser.pdf` → **rebuild** clean web pipeline (SVG).
- `vlm-grounding.pdf` → contact-aware decomposition grounding.
- `skillequivNet.pdf`, `primitive_with_pc.pdf` → SO(3)-equivariant primitive net.
- `tro-unsafe-unreachable.pdf` → reachability map + Minimum-Distance-Field.
- Regenerate `plot_wilson_ci.py` → `wilson_real.svg`, `wilson_sim.svg` (larger fonts).
