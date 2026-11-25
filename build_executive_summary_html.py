"""Build printable HTML for the final executive summary."""
from pathlib import Path
import markdown

root = Path(__file__).resolve().parent
md_path = root / "reports" / "AIRWATCH_CO_FINAL_EXECUTIVE_SUMMARY.md"
html_path = root / "reports" / "AIRWATCH_CO_FINAL_EXECUTIVE_SUMMARY.html"

text = md_path.read_text(encoding="utf-8")
body = markdown.markdown(text, extensions=["tables", "fenced_code"])

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>AirWatch CO — Final Executive Summary | Group 3</title>
  <style>
    body {{
      font-family: Georgia, "Times New Roman", serif;
      line-height: 1.65;
      color: #1e293b;
      background: #f8fafc;
      margin: 0;
      padding: 32px 16px;
    }}
    .wrap {{
      max-width: 860px;
      margin: 0 auto;
      background: #fff;
      padding: 48px 44px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(15, 23, 42, 0.04);
    }}
    h1 {{ font-size: 1.75rem; margin: 0 0 0.25rem; color: #0f172a; }}
    h2 {{
      font-size: 1.2rem;
      margin-top: 1.75rem;
      color: #0f172a;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.35rem;
    }}
    h3 {{ font-size: 1.05rem; margin-top: 1.25rem; color: #1e293b; }}
    table {{ border-collapse: collapse; width: 100%; margin: 1rem 0; font-size: 0.92rem; }}
    th, td {{ border: 1px solid #cbd5e1; padding: 0.45rem 0.6rem; text-align: left; vertical-align: top; }}
    th {{ background: #f1f5f9; }}
    code {{
      font-family: Consolas, monospace;
      font-size: 0.88em;
      background: #f1f5f9;
      padding: 0.1rem 0.3rem;
      border-radius: 3px;
    }}
    a {{ color: #0369a1; }}
    blockquote {{
      margin: 1rem 0;
      padding: 0.5rem 1rem;
      border-left: 3px solid #0284c7;
      background: #f0f9ff;
      color: #0f172a;
    }}
    hr {{ border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }}
    @media print {{
      body {{ background: #fff; padding: 0; }}
      .wrap {{ box-shadow: none; border: none; padding: 0; }}
    }}
  </style>
</head>
<body>
  <div class="wrap">
{body}
  </div>
</body>
</html>
"""

html_path.write_text(html, encoding="utf-8")
print(f"Wrote {html_path} ({html_path.stat().st_size} bytes)")
