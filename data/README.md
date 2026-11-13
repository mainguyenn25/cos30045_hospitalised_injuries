# Chart data

Every CSV here is a KNIME CSV Writer output. Keep the file names and column names; the charts read them exactly.

Every branch starts the same way: Excel Reader (sheet `raw`) → Row Filter (`Cause of injury` = `Traffic`) → Missing Value (`Died_cases` = 0).

| File | Chart | KNIME after the common start | Columns |
|---|---|---|---|
| `by_year.csv` | hero numbers, trend | GroupBy `Calendar year`; Sum of the 4 measures | Calendar year, Count of cases, Died_cases, Hospitalisations, Bed days |
| `age_sex.csv` | pyramid, deaths dot plot | GroupBy `Age group`+`Sex` → Pivot (group `Age group`, pivot `Sex`, Sum) → drop intersex columns → drop `Missing` age row | Age group, Female+Count of cases, Female+Died_cases, Female+Bed days, Male+… |
| `road_user.csv` | bubble chart | GroupBy `Road user`; Sum of the 4 measures → Math Formula `Died %` | Road user, Count of cases, Died_cases, Hospitalisations, Bed days, Died % |
| `year_road_user.csv` | index lines | GroupBy `Calendar year`+`Road user`; Sum of Hospitalisations (no Pivot) | Calendar year, Road user, Hospitalisations |
| `year_age.csv` | age change bars | GroupBy `Calendar year`+`Age group`; Sum of Hospitalisations (no Pivot) | Calendar year, Age group, Hospitalisations |
| `remoteness.csv` | remoteness bars | GroupBy `ABS remoteness area`; Sum of the 4 measures → Math Formula `Days per case` → Math Formula `Died %` | ABS remoteness area, Count of cases, Died_cases, Hospitalisations, Bed days, Days per case, Died % |
| `road_user_counterparty.csv` | "What they hit" (not built yet) | GroupBy `Road user`+`Counterparty` → Row Filter (car driver, motorcyclist, pedal cyclist, pedestrian) → Rule Engine (10 counterparties → 5 `What they hit` groups) → GroupBy → Joiner with per-road-user totals → Math Formula `Cases %`, `Deaths %` | Road user, What they hit, Count of cases, Died_cases, Sum(Count of cases), Sum(Died_cases), Cases %, Deaths % |

The 4 measures are `Count of cases`, `Died_cases`, `Hospitalisations` and `Bed days`. In CSV Writer, write the column header and leave out row IDs.

Checks: Hospitalisations across `by_year.csv` add up to 410,884, and Died_cases to 2,129. In `age_sex.csv`, the 75+ row has Male+Count of cases = 12,967.
