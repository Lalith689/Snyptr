# Ablation Study Summary

## Dataset

- Classes: 7
- Class names: acute_angle_trigger, breath_control, early_recoil, frontsight_dip, overtight_grip, stance_position, to and fro motion
- Train samples: 201
- Validation samples: 68
- Test samples: 68

## Variant Ranking (by Macro F1)

| Variant | Test Acc | Macro P | Macro R | Macro F1 | Time (s) |
|---|---:|---:|---:|---:|---:|
| no_augmentation | 0.2941 | 0.4056 | 0.2964 | 0.2665 | 68.5 |
| baseline | 0.2206 | 0.2349 | 0.2179 | 0.2043 | 41.1 |
| no_dropout | 0.1912 | 0.2931 | 0.1893 | 0.1719 | 67.5 |
| shallow_cnn | 0.1471 | 0.0488 | 0.1429 | 0.0725 | 48.0 |
| sgd_optimizer | 0.1471 | 0.0381 | 0.1429 | 0.0585 | 67.1 |

## Delta vs Baseline (Macro F1)

| Variant | Delta F1 |
|---|---:|
| no_augmentation | +0.0622 |
| baseline | +0.0000 |
| no_dropout | -0.0325 |
| shallow_cnn | -0.1318 |
| sgd_optimizer | -0.1459 |
