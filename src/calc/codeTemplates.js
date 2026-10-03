/**
 * Multi-language reference implementations (Python, MATLAB, C, C++)
 * for BAMEE203 Assignment II questions.
 */

export const DIESEL_CODE_TEMPLATES = {
  python: `# ========================================================
# BAMEE203 – Assignment II (Set A) – Question 1: Diesel Cycle
# Student: 25BME1038 – NILA S
# Language: Python 3 with NumPy & Matplotlib
# ========================================================

import numpy as np
import matplotlib.pyplot as plt

# Given input parameters
P1 = 95.0        # kPa
T1_C = 20.0      # °C
T1 = T1_C + 273.15  # K
T3 = 2500.0      # K
cp = 1.005       # kJ/kg·K
cv = 0.718       # kJ/kg·K
R = 0.287        # kJ/kg·K
gamma = cp / cv  # Specific heat ratio

compression_ratios = [20, 19, 18, 17, 16, 15]

results = []
print(f"{'r':<4} {'T2 (K)':<10} {'P2 (kPa)':<12} {'r_c':<8} {'q_in (kJ/kg)':<14} {'w_net (kJ/kg)':<14} {'eta_th (%)':<12} {'MEP (kPa)':<10}")
print("-" * 88)

for r in compression_ratios:
    # State 1 (BDC)
    v1 = (R * T1) / P1
    # State 2 (TDC)
    v2 = v1 / r
    T2 = T1 * (r ** (gamma - 1))
    P2 = P1 * (r ** gamma)
    # State 3 (Constant pressure heat addition)
    P3 = P2
    rc = T3 / T2
    v3 = (R * T3) / P3
    # State 4 (Isentropic expansion to BDC)
    v4 = v1
    T4 = T3 * ((rc / r) ** (gamma - 1))
    P4 = P3 * ((v3 / v4) ** gamma)

    # Energetics
    q_in = cp * (T3 - T2)
    q_out = cv * (T4 - T1)
    w_net = q_in - q_out
    eta_th = (w_net / q_in) * 100
    mep = w_net / (v1 - v2)

    results.append((r, T2, P2, rc, q_in, w_net, eta_th, mep))
    print(f"{r:<4} {T2:<10.2f} {P2:<12.1f} {rc:<8.3f} {q_in:<14.2f} {w_net:<14.2f} {eta_th:<12.2f} {mep:<10.2f}")

# Plotting graphs
r_vals = [res[0] for res in results]
eta_vals = [res[6] for res in results]
mep_vals = [res[7] for res in results]

fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))
ax1.plot(r_vals, eta_vals, 'o-b', linewidth=2)
ax1.set_xlabel('Compression Ratio (r)')
ax1.set_ylabel('Thermal Efficiency, $\\\\eta_{th}$ (%)')
ax1.set_title('$\\\\eta_{th}$ vs Compression Ratio')
ax1.grid(True)

ax2.plot(r_vals, mep_vals, 's-g', linewidth=2)
ax2.set_xlabel('Compression Ratio (r)')
ax2.set_ylabel('Mean Effective Pressure, MEP (kPa)')
ax2.set_title('MEP vs Compression Ratio')
ax2.grid(True)

plt.tight_layout()
plt.show()
`,

  matlab: `% ========================================================
% BAMEE203 – Assignment II (Set A) – Question 1: Diesel Cycle
% Student: 25BME1038 – NILA S
% Language: MATLAB
% ========================================================

clear; clc; close all;

% Given inputs
P1 = 95;            % kPa
T1 = 20 + 273.15;   % K
T3 = 2500;          % K
cp = 1.005;         % kJ/kg.K
cv = 0.718;         % kJ/kg.K
R = 0.287;          % kJ/kg.K
gamma = cp / cv;

r = [20, 19, 18, 17, 16, 15];
N = length(r);

T2 = zeros(1, N); P2 = zeros(1, N); rc = zeros(1, N);
w_net = zeros(1, N); eta_th = zeros(1, N); mep = zeros(1, N);

fprintf('%-4s %-10s %-12s %-8s %-12s %-12s\\n', 'r', 'T2(K)', 'P2(kPa)', 'rc', 'eta_th(%)', 'MEP(kPa)');
fprintf('------------------------------------------------------------\\n');

for i = 1:N
    v1 = (R * T1) / P1;
    v2 = v1 / r(i);
    T2(i) = T1 * (r(i)^(gamma - 1));
    P2(i) = P1 * (r(i)^gamma);
    rc(i) = T3 / T2(i);
    v3 = (R * T3) / P2(i);
    v4 = v1;
    T4 = T3 * ((rc(i) / r(i))^(gamma - 1));

    q_in = cp * (T3 - T2(i));
    q_out = cv * (T4 - T1);
    w_net(i) = q_in - q_out;
    eta_th(i) = (w_net(i) / q_in) * 100;
    mep(i) = w_net(i) / (v1 - v2);

    fprintf('%-4d %-10.2f %-12.1f %-8.3f %-12.2f %-12.2f\\n', r(i), T2(i), P2(i), rc(i), eta_th(i), mep(i));
end

figure;
subplot(1,2,1);
plot(r, eta_th, '-ob', 'LineWidth', 1.5);
xlabel('Compression Ratio (r)'); ylabel('Thermal Efficiency \eta_{th} (%)');
title('\eta_{th} vs Compression Ratio'); grid on;

subplot(1,2,2);
plot(r, mep, '-sr', 'LineWidth', 1.5);
xlabel('Compression Ratio (r)'); ylabel('MEP (kPa)');
title('Mean Effective Pressure vs Compression Ratio'); grid on;
`,

  c: `/* ========================================================
   BAMEE203 – Assignment II (Set A) – Question 1: Diesel Cycle
   Student: 25BME1038 – NILA S
   Language: C (Standard C99)
   ======================================================== */

#include <stdio.h>
#include <math.h>

int main() {
    const double P1 = 95.0;            /* kPa */
    const double T1 = 20.0 + 273.15;   /* K */
    const double T3 = 2500.0;          /* K */
    const double cp = 1.005;           /* kJ/kg.K */
    const double cv = 0.718;           /* kJ/kg.K */
    const double R  = 0.287;           /* kJ/kg.K */
    const double gamma = cp / cv;

    const double r_values[] = {20, 19, 18, 17, 16, 15};
    const int count = sizeof(r_values) / sizeof(r_values[0]);

    printf("%-4s %-10s %-12s %-8s %-14s %-12s %-10s\\n",
           "r", "T2 (K)", "P2 (kPa)", "rc", "w_net(kJ/kg)", "eta_th(%)", "MEP (kPa)");
    printf("---------------------------------------------------------------------------\\n");

    for (int i = 0; i < count; i++) {
        double r = r_values[i];
        double v1 = (R * T1) / P1;
        double v2 = v1 / r;
        double T2 = T1 * pow(r, gamma - 1.0);
        double P2 = P1 * pow(r, gamma);
        double rc = T3 / T2;
        double T4 = T3 * pow(rc / r, gamma - 1.0);

        double q_in  = cp * (T3 - T2);
        double q_out = cv * (T4 - T1);
        double w_net = q_in - q_out;
        double eta_th = (w_net / q_in) * 100.0;
        double mep   = w_net / (v1 - v2);

        printf("%-4.0f %-10.2f %-12.1f %-8.3f %-14.2f %-12.2f %-10.2f\\n",
               r, T2, P2, rc, w_net, eta_th, mep);
    }
    return 0;
}
`,

  cpp: `// ========================================================
// BAMEE203 – Assignment II (Set A) – Question 1: Diesel Cycle
// Student: 25BME1038 – NILA S
// Language: C++17
// ========================================================

#include <iostream>
#include <vector>
#include <iomanip>
#include <cmath>

struct DieselState {
    double r;
    double T2, P2, rc;
    double qIn, qOut, wNet;
    double etaTh, mep;
};

int main() {
    const double P1 = 95.0;            // kPa
    const double T1 = 20.0 + 273.15;   // K
    const double T3 = 2500.0;          // K
    const double cp = 1.005;           // kJ/kg.K
    const double cv = 0.718;           // kJ/kg.K
    const double R  = 0.287;           // kJ/kg.K
    const double gamma = cp / cv;

    std::vector<double> ratios = {20, 19, 18, 17, 16, 15};

    std::cout << std::fixed << std::setprecision(2);
    std::cout << std::setw(4) << "r"
              << std::setw(10) << "T2 (K)"
              << std::setw(12) << "P2 (kPa)"
              << std::setw(8)  << "rc"
              << std::setw(14) << "w_net(kJ/kg)"
              << std::setw(12) << "eta_th(%)"
              << std::setw(10) << "MEP(kPa)" << "\\n";
    std::cout << std::string(70, '-') << "\\n";

    for (double r : ratios) {
        double v1 = (R * T1) / P1;
        double v2 = v1 / r;
        double T2 = T1 * std::pow(r, gamma - 1.0);
        double P2 = P1 * std::pow(r, gamma);
        double rc = T3 / T2;
        double T4 = T3 * std::pow(rc / r, gamma - 1.0);

        double qIn  = cp * (T3 - T2);
        double qOut = cv * (T4 - T1);
        double wNet = qIn - qOut;
        double eta  = (wNet / qIn) * 100.0;
        double mep  = wNet / (v1 - v2);

        std::cout << std::setw(4)  << static_cast<int>(r)
                  << std::setw(10) << T2
                  << std::setw(12) << P2
                  << std::setw(8)  << std::setprecision(3) << rc << std::setprecision(2)
                  << std::setw(14) << wNet
                  << std::setw(12) << eta
                  << std::setw(10) << mep << "\\n";
    }
    return 0;
}
`
};

export const RANKINE_CODE_TEMPLATES = {
  python: `# ========================================================
# BAMEE203 – Assignment II (Set A) – Question 2: Rankine Cycle
# Student: 25BME1038 – NILA S
# Language: Python 3 with iapws or pyXSteam
# ========================================================

# Install: pip install pyXSteam matplotlib
from pyXSteam.XSteam import XSteam
import matplotlib.pyplot as plt

steamTable = XSteam(XSteam.UNIT_SYSTEM_MKS) # bar, °C, kJ/kg

# Inputs
P_cond_bar = 0.5     # 50 kPa = 0.5 bar
T3_C = 300.0         # 300 °C
m_dot = 35.0         # kg/s
boiler_pressures_bar = [30.0, 50.0, 60.0] # 3 MPa, 5 MPa, 6 MPa

# State 1 (Condenser outlet, sat. liquid at 0.5 bar)
h1 = steamTable.hL_p(P_cond_bar)
s1 = steamTable.sL_p(P_cond_bar)
v1 = steamTable.vL_p(P_cond_bar) # m3/kg

print(f"{'P_boiler (MPa)':<16} {'w_t (kJ/kg)':<14} {'w_p (kJ/kg)':<14} {'w_net (kJ/kg)':<14} {'eta_th (%)':<12} {'P_net (MW)':<12} {'x4 (%)':<10}")
print("-" * 92)

results = []

for P_b_bar in boiler_pressures_bar:
    P_b_MPa = P_b_bar / 10.0
    # Pump work: wp = v1 * (P_boiler - P_cond) in kJ/kg
    wp = v1 * (P_b_bar - P_cond_bar) * 100.0
    h2 = h1 + wp

    # State 3 (Superheated steam at P_boiler, T3)
    h3 = steamTable.h_pt(P_b_bar, T3_C)
    s3 = steamTable.s_pt(P_b_bar, T3_C)

    # State 4 (Isentropic expansion to P_cond: s4 = s3)
    s4 = s3
    sf = steamTable.sL_p(P_cond_bar)
    sg = steamTable.sV_p(P_cond_bar)
    hf = steamTable.hL_p(P_cond_bar)
    hg = steamTable.hV_p(P_cond_bar)

    x4 = (s4 - sf) / (sg - sf)
    h4 = hf + x4 * (hg - hf)

    # Work & Efficiency
    wt = h3 - h4
    wnet = wt - wp
    qin = h3 - h2
    eta_th = (wnet / qin) * 100.0
    p_net_MW = (m_dot * wnet) / 1000.0

    results.append((P_b_MPa, wt, wp, wnet, eta_th, p_net_MW, x4 * 100.0))
    print(f"{P_b_MPa:<16.1f} {wt:<14.2f} {wp:<14.2f} {wnet:<14.2f} {eta_th:<12.2f} {p_net_MW:<12.2f} {x4*100:<10.1f}")
`
};
