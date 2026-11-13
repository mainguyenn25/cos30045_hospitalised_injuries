# cos30045_hospitalised_injuries

**After the Crash**: a data visualisation website about hospitalised injuries from road crashes in Australia, 2011–2021 (COS30045 Data Visualisation).

## Launch the website

The charts load CSV files, which browsers block when a page is opened straight from disk (`file://`). Run a small local web server instead.

1. Open a terminal in this repo's root folder (the one containing `website/`).
2. Start the server (Python 3 comes with macOS and most Linux systems; on Windows use `py` instead of `python3`):

   ```bash
   python3 -m http.server 8000 --directory website
   ```

3. Open <http://localhost:8000> in your browser.
4. Press `Ctrl+C` in the terminal to stop the server.

**"Address already in use" or a different site shows up?** Something else is using port 8000. Pick another number in both places, e.g. `python3 -m http.server 8080 --directory website` and <http://localhost:8080>.

**Using VS Code instead?** Install the *Live Server* extension, open `website/index.html`, and click **Go Live** in the status bar.

**Workbook links on the Data Download page:** these point to `../source-data/`, outside `website/`. To test them locally, serve the repo root instead (`python3 -m http.server 8000`) and open <http://localhost:8000/website/>.

**Seeing old charts or styles after a change?** Hard-reload with `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows).

## Pages

| Page | File | Charts | Data |
|---|---|---|---|
| Home | `index.html` | Headline numbers | `by_year.csv` |
| Trends | `trends.html` | Yearly trend, road users indexed to 2011, change by age | `by_year`, `year_road_user`, `year_age` |
| Who | `who.html` | Age and sex pyramid, share of cases vs deaths by age | `age_sex` |
| How & where | `how-where.html` | Road users bubble chart, what they hit, remoteness | `road_user`, `road_user_counterparty`, `remoteness` |
| Data Download | `download.html` | Download links for every CSV and source workbook | all |

## Folder layout

```
website/            the site (open this with the server)
  index.html, trends.html, who.html, how-where.html, download.html
  css/style.css     all styling
  js/main.js        finds each chart on the page and loads its CSV
  js/common.js      shared helpers (formatting, tooltip, sizing)
  js/charts/        one file per chart
  js/lib/           D3 v7 (bundled, no internet needed)
  data/             the 7 CSVs from KNIME; see data/README.md for how each is built
  images/           hero photo (Unsplash, free licence)
source-data/        original BITRE workbooks (.xlsx)
eda/                exploratory analysis from Stand Up 1 (open eda/index.html)
```

## Updating the data

Each CSV in `website/data/` is a KNIME CSV Writer output. Replace a file with a new export and keep the same file name and column names, since the charts read them exactly. Reload the page and the charts update; no code changes are needed. `website/data/README.md` lists the KNIME steps and the totals to check against.

## Source

Bureau of Infrastructure and Transport Research Economics (BITRE), *Hospitalised injuries from road crashes*, 2011–2021 (September 2023 release). Only cases coded as traffic crashes are included.
