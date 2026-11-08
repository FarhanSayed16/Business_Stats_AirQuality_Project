import markdown
import os

md_path = "reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.md"
html_path = "reports/AIRWATCH_CO_FINAL_STATISTICS_REPORT.html"

with open(md_path, "r", encoding="utf-8") as f:
    text = f.read()

# Convert markdown to html with table and code extensions
html_body = markdown.markdown(text, extensions=['tables', 'fenced_code', 'codehilite'])

template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AirWatch CO — MCA I Statistics Internal Assessment Report</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
    
    body {{
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.65;
      color: #1e293b;
      background: #f8fafc;
      margin: 0;
      padding: 40px 20px;
    }}
    .container {{
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 60px 50px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }}
    h1 {{
      color: #0f172a;
      font-size: 2.2rem;
      font-weight: 800;
      line-height: 1.25;
      border-bottom: 2px solid #0f766e;
      padding-bottom: 16px;
      margin-top: 0;
    }}
    h2 {{
      color: #0f766e;
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 40px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }}
    h3 {{
      color: #1e293b;
      font-size: 1.2rem;
      font-weight: 600;
      margin-top: 24px;
    }}
    p, li {{
      color: #334155;
      font-size: 0.98rem;
    }}
    code {{
      font-family: 'JetBrains Mono', monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 0.88em;
      color: #0f766e;
    }}
    pre code {{
      display: block;
      padding: 16px;
      overflow-x: auto;
      background: #0f172a;
      color: #f8fafc;
      border-radius: 8px;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      margin: 24px 0;
      font-size: 0.92rem;
    }}
    th, td {{
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
      text-align: left;
    }}
    th {{
      background-color: #f0fdfa;
      color: #0f766e;
      font-weight: 700;
    }}
    tr:nth-child(even) {{
      background-color: #f8fafc;
    }}
    blockquote {{
      border-left: 4px solid #0f766e;
      margin: 20px 0;
      padding: 10px 20px;
      background: #f0fdfa;
      color: #134e4a;
      border-radius: 0 8px 8px 0;
    }}
    .header-badge {{
      display: inline-block;
      background: #ccfbf1;
      color: #0f766e;
      font-weight: 700;
      font-size: 0.8rem;
      padding: 4px 12px;
      border-radius: 9999px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }}
    @media print {{
      body {{ background: #fff; padding: 0; }}
      .container {{ box-shadow: none; border: none; padding: 0; max-width: 100%; }}
      h1 {{ font-size: 1.8rem; }}
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header-badge">Group 3 • Internal Assessment Final Report</div>
    {html_body}
  </div>
</body>
</html>
"""

# If python-markdown is not installed, install it or do simple conversion
try:
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(template)
    print(f"Generated {html_path} ({os.path.getsize(html_path):,} bytes)")
except Exception as e:
    print("Error:", e)
