# BAMEE203 – Thermodynamics and Thermal Systems (Assignment II – Set A)

**Student Name:** NILA S  
**Registration Number:** 25BME1038  
**Course:** BAMEE203 – Thermodynamics and Thermal Systems  
**Assignment:** Assignment II (Set A)  

---

## Overview

This repository contains a client-side educational web application built for **BAMEE203 Assignment II (Set A)**. It provides step-by-step interactive derivations, textbook-grade KaTeX mathematical formulations, dynamic property evaluations, tabular summaries, and interactive thermodynamic diagrams for:

1. **Question 1 – Air-Standard Ideal Diesel Cycle**:
   - Analysis of compression ratio ($r = 20$) and parametric effects for $r \in \{20, 19, 18, 17, 16, 15\}$.
   - Complete state point evaluations ($P, T, v$).
   - Thermal efficiency ($\eta_{\text{th}}$) verified against both energy balance ($w_{\text{net}}/q_{\text{in}}$) and closed-form formula.
   - Mean Effective Pressure ($\text{MEP}$).
   - $P\text{--}v$ diagram with isentropic curved processes and parametric comparison plots.
   - Multi-language source code implementations in **Python**, **MATLAB**, **C**, and **C++**.

2. **Question 2 – Simple Ideal Rankine Cycle**:
   - Analysis of a steam power plant operating between $3\text{ MPa}$ ($3000\text{ kPa}$) and $50\text{ kPa}$ with turbine inlet at $300^\circ\text{C}$ and $\dot{m} = 35\text{ kg/s}$.
   - Parametric study when upper pressure limit is increased to $5\text{ MPa}$ and $6\text{ MPa}$.
   - Complete state property lookups ($P, T, h, s, v, x$).
   - Thermal efficiency ($\eta_{\text{th}}$) and net power output ($P_{\text{net}}$ in MW and kW).
   - $T\text{--}s$ diagram plotted against the IAPWS-IF97 saturation dome with multi-pressure reference overlays.
   - Multi-language source code reference.

---

## Tech Stack

- **Framework:** React 18 + Vite (Plain JavaScript, no TypeScript)
- **Math Typesetting:** KaTeX (`katex`) with fallback handling and textbook symbol conventions
- **Plotting & Graphs:** Recharts (responsive scatter and line charts for $P\text{--}v$, $T\text{--}s$, and parametric trends)
- **Styling:** Pure CSS (`src/App.css`) with clean single-column engineering layout (max-width 880px, `#1f4e79` accent, tabular numerals)
- **Testing:** Vitest for pure calculation validation (15/15 unit tests passing)
- **Steam Properties Engine:** IAPWS-IF97 browser formulation (`iapws-if97`)

---

## Steam Property Engine & Thermodynamic Bounds

### Source Formulation
The steam property module (`src/calc/steam.js`) uses the **IAPWS Industrial Formulation 1997 (IAPWS-IF97)** for water and steam properties:
- **Saturated states (Region 4):** Evaluated via saturation pressure relations `solvePx(P, x)` to obtain $T_{\text{sat}}$, $h_f$, $h_g$, $h_{fg}$, $s_f$, $s_g$, $s_{fg}$, $v_f$, and $v_g$.
- **Superheated steam (Region 2):** Evaluated via fundamental Gibbs free energy equation of state `solvePT(P, T)`.
- **Turbine expansion exit (Region 4 / Region 2):** Evaluated via isentropic solver `solvePS(P, s)` and verified with two-phase dryness fraction relations $x = (s - s_f)/s_{fg}$.

### Benchmark Verification
Tested against standard thermodynamic steam tables to within **$< 0.1\%$ error**:
- At $50\text{ kPa}$ ($0.05\text{ MPa}$):
  - $T_{\text{sat}} = 81.32^\circ\text{C}$ (Standard: $\approx 81.3^\circ\text{C}$)
  - $h_f = 340.48\text{ kJ/kg}$ (Standard: $\approx 340.5\text{ kJ/kg}$)
  - $h_{fg} = 2304.73\text{ kJ/kg}$ (Standard: $\approx 2304.7\text{ kJ/kg}$)
  - $s_f = 1.0910\text{ kJ/kg}\cdot\text{K}$ (Standard: $\approx 1.091\text{ kJ/kg}\cdot\text{K}$)
  - $v_f = 0.00103\text{ m}^3/\text{kg}$ (Standard: $\approx 0.00103\text{ m}^3/\text{kg}$)
- At $3\text{ MPa}$ and $300^\circ\text{C}$:
  - $h = 2994.35\text{ kJ/kg}$ (Standard: $\approx 2994\text{ kJ/kg}$)
  - $s = 6.5412\text{ kJ/kg}\cdot\text{K}$ (Standard: $\approx 6.541\text{ kJ/kg}\cdot\text{K}$)

### Physical Validity Limits
- Pressure range: $0.000612\text{ MPa}$ ($0.612\text{ kPa}$, triple point) up to $100\text{ MPa}$.
- Temperature range: $0.01^\circ\text{C}$ to $800^\circ\text{C}$.
- For subcritical Rankine cycles, the upper pressure must remain below the critical pressure $P_{\text{cr}} = 22.064\text{ MPa}$.
- If any input falls outside these valid ranges, or if $T_3 < T_{\text{sat}}(P_{\text{boiler}})$, the application halts downstream evaluation and renders an informative inline message without crashing or displaying `NaN`.

---

## Instructions to Run

### Prerequisites
- Node.js (version 18 or newer; recommended LTS v20+)
- npm (version 9 or newer)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173/` (or the URL displayed in the terminal).

### 3. Run Unit Tests
```bash
npm test
```
Executes the Vitest test suite covering:
- Diesel state calculations, closed-form efficiency equality, and parameter variations.
- Rankine cycle state points, pump work units ($1\text{ kPa}\times\text{m}^3/\text{kg} = 1\text{ kJ/kg}$), and mass flow rate independence.
- IAPWS-IF97 steam table benchmarks within $<0.1\%$ tolerance.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized static bundle in the `dist/` directory ready for deployment to GitHub Pages, Netlify, or Vercel.

---

## Project Structure

```text
Thermodynamics/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── components/
│   │   ├── Math.jsx              # KaTeX math typesetting wrapper
│   │   ├── StepBlock.jsx         # 5-part textbook step layout
│   │   ├── StateTable.jsx        # Engineering tabular state summary
│   │   ├── NumberInput.jsx       # Labelled input with quick buttons & error messages
│   │   └── charts/
│   │       ├── PvDiagram.jsx            # Diesel cycle P-v diagram
│   │       ├── DieselParamChart.jsx     # eta_th & MEP vs r charts
│   │       ├── RankineTsDiagram.jsx     # Rankine cycle T-s diagram with dome
│   │       └── RankineParamChart.jsx    # eta_th & Power vs P_boiler charts
│   └── calc/
│       ├── diesel.js             # Pure Diesel calculations & P-v generator
│       ├── rankine.js            # Pure Rankine calculations & comparisons
│       ├── steam.js              # IAPWS-IF97 steam property engine
│       ├── format.js             # Number formatting & rounding helpers
│       ├── codeTemplates.js      # Python, MATLAB, C, C++ scripts
│       ├── diesel.test.js        # Vitest suite for Question 1
│       ├── rankine.test.js       # Vitest suite for Question 2
│       └── steam.test.js         # Vitest suite for Steam benchmarks
```

---

## Assignment Answers Summary

### Question 1 – Ideal Air-Standard Diesel Cycle (at $r = 20$)
- **Thermal Efficiency ($\eta_{\text{th}}$):** $62.22\%$ (or $62.15\%$ depending on $\gamma = c_p/c_v \approx 1.3997$)
- **Mean Effective Pressure ($\text{MEP}$):** $1136.55\text{ kPa}$
- **Effect of varying $r$ ($20 \to 15$):**
  - $\eta_{\text{th}}$ drops monotonically from $62.22\%$ to $57.94\%$.
  - $\text{MEP}$ decreases from $1136.55\text{ kPa}$ to $954.34\text{ kPa}$.
  - Cutoff ratio $r_c$ increases from $2.575$ to $3.036$ due to lower $T_2$.

### Question 2 – Simple Ideal Rankine Cycle (at $3\text{ MPa}$, $50\text{ kPa}$, $300^\circ\text{C}$, $\dot{m} = 35\text{ kg/s}$)
- **Turbine Work ($w_t$):** $721.95\text{ kJ/kg}$
- **Pump Work ($w_p$):** $3.04\text{ kJ/kg}$
- **Net Specific Work ($w_{\text{net}}$):** $718.91\text{ kJ/kg}$
- **Thermal Efficiency ($\eta_{\text{th}}$):** $27.12\%$
- **Net Power Output ($P_{\text{net}}$):** $25.16\text{ MW}$ ($25,162\text{ kW}$)
- **Effect of varying boiler pressure ($3\text{ MPa} \to 5\text{ MPa} \to 6\text{ MPa}$):**
  - $\eta_{\text{th}}$ increases: $27.12\% \to 29.66\% \to 30.48\%$.
  - $P_{\text{net}}$ increases: $25.16\text{ MW} \to 26.78\text{ MW} \to 27.09\text{ MW}$.
  - Steam exhaust dryness fraction $x_4$ decreases: $83.82\% \to 78.74\% \to 76.58\%$ (wetter steam, explaining the engineering requirement of reheat in practical steam cycles).
