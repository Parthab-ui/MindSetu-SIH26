# SIH26186 ML Feature Schema

This document provides the authoritative mapping for the features used in the LightGBM predictive model. This mapping was verified against the original `Follow up Dryad revised.xls` dataset and the corresponding publication methodology.

## 1. Q29_Total (Post-Traumatic Stress Disorder Checklist - Military Version)
- **Source:** PCL-M (17-item questionnaire).
- **Dataset Column:** `Q29_Total` (represents the total score of the PCL-M assessment).
- **Encoding:** Integer.
- **Valid Range:** `17` to `85` (17 items, each scored 1 to 5).
- **Note:** The previous assumption that this was bounded 0-36 (like the GHQ-12) was incorrect and dangerous. The dataset confirms values range from 17 to 73 in the sample.

## 2. Combat Exposure Scale
- **Source:** 13-item combat exposure scale (based on Hoge et al.).
- **Dataset Columns:**
  - `Q12_weapon`: Discharging weapon in direct combat.
  - `Q13_feltdie`: Feeling that you were in great danger of being killed.
- **Encoding:** Binary Integer.
- **Valid Range:** `0` (No), `1` (Yes).

## 3. SF-36 Role-Physical (RP) Scale
- **Source:** MOS 36-item Short-Form Health Survey (Question 2a-2d).
- **Dataset Columns:**
  - `Q23a_cutdowntime`: Cut down the amount of time you spent on work or other activities.
  - `Q23b_Accomplished_less`: Accomplished less than you would like.
  - `Q23c_limited_work`: Were limited in the kind of work or other activities.
  - `Q23d_difficulty_performing`: Had difficulty performing the work or other activities.
- **Encoding:** Binary Integer.
- **Valid Range:** `0` (No), `1` (Yes).

---
**CRITICAL:** The frontend and backend validation layers MUST strictly enforce these bounds to prevent invalid predictions.
