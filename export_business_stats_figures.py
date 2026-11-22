"""Generate classical Business Statistics figures for the report pack."""
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent
CSV = ROOT / "data" / "cleaned" / "cleaned_air_quality.csv"
FIG = ROOT / "figures"
FIG.mkdir(exist_ok=True)

df = pd.read_csv(CSV)
co = df["CO(GT)"].dropna().astype(float)

q1, q3 = co.quantile(0.25), co.quantile(0.75)
iqr = q3 - q1
lower, upper = q1 - 1.5 * iqr, q3 + 1.5 * iqr

# 1) Histogram + normal overlay
fig, ax = plt.subplots(figsize=(9, 5))
counts, bins, _ = ax.hist(co, bins=30, color="#7dd3fc", edgecolor="white", label="Histogram")
mu, sigma = co.mean(), co.std(ddof=1)
xs = np.linspace(co.min(), co.max(), 200)
bin_width = bins[1] - bins[0]
pdf = (1 / (sigma * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((xs - mu) / sigma) ** 2)
ax.plot(xs, pdf * len(co) * bin_width, color="#0284c7", lw=2.5, label="Normal(μ,σ) overlay")
ax.set_title("CO(GT) distribution vs classical normal (bell) curve")
ax.set_xlabel("CO(GT) mg/m³")
ax.set_ylabel("Count")
ax.legend()
fig.tight_layout()
fig.savefig(FIG / "11_co_histogram_normal_overlay.png", dpi=160)
plt.close(fig)

# 2) Boxplot with outliers
fig, ax = plt.subplots(figsize=(8, 4.5))
ax.boxplot(co, orientation="horizontal", widths=0.55, patch_artist=True,
           boxprops=dict(facecolor="#e0f2fe"), flierprops=dict(marker="o", markersize=3, alpha=0.45))
ax.axvline(lower, color="#0369a1", ls="--", label=f"Lower fence {lower:.2f}")
ax.axvline(upper, color="#be123c", ls="--", label=f"Upper fence {upper:.2f}")
ax.set_title("CO(GT) boxplot with IQR fences (left/right outliers)")
ax.set_xlabel("CO(GT) mg/m³")
ax.legend(loc="upper right")
fig.tight_layout()
fig.savefig(FIG / "12_co_boxplot_iqr_outliers.png", dpi=160)
plt.close(fig)

print(f"Wrote figures to {FIG}")
print(f"IQR={iqr:.3f} lower={lower:.3f} upper={upper:.3f} "
      f"left={(co < lower).sum()} right={(co > upper).sum()}")
