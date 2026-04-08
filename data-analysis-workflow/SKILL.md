---
name: data-analysis-workflow
description: Gather, clean, analyze, and visualize data from the web or uploaded files. Use when user wants to scrape data, analyze datasets, create charts, find trends, compare metrics, build dashboards, or generate data-driven reports. Triggers include "analyze data", "scrape and analyze", "create dashboard", "find trends", "compare metrics", "data visualization", "statistical analysis", "correlation analysis", "build chart", "data report".
---

# Data Analysis Workflow

Gather data from the web or uploaded files, clean and analyze it, then deliver results as interactive charts, spreadsheets, or deployed dashboards.

## Sub-Skills

- `rebyteai/data-scraper` — Scrape websites and extract structured data using Apify actors. 1000+ pre-built scrapers for Amazon, LinkedIn, YouTube, TikTok, Google, and general web pages. 5-minute timeout per run.
- `rebyteai/internet-search` — Quick web search for finding data sources, current statistics, benchmarks, and context.
- `rebyteai/deep-research` — Comprehensive multi-source research when the analysis requires verified facts from 10+ sources. Produces structured reports with citations.
- `rebyteai/echarts` — Interactive charts via pyecharts: bar, line, pie, scatter, heatmap, candlestick, radar, treemap. Output as self-contained HTML.
- `rebyteai/spreadsheet-builder` — Create shareable online spreadsheets with formulas, formatting, and live URLs.
- `rebyteai/rebyte-app-builder` — Deploy interactive dashboards and analysis results as web apps on rebyte.pro.

## Workflow

### Step 1: Understand the Analysis

Parse what the user wants. Identify:
- **Data source** — Web scraping, uploaded file, or public APIs/databases?
- **Analysis type** — Comparison, trend, distribution, correlation, ranking, forecasting?
- **Metrics** — What specific numbers or dimensions matter?
- **Output** — Charts, spreadsheet, dashboard, or written report?

If the user uploads a file, the data source is the file. If they ask to "research" or "compare" something, you'll need to gather data first.

### Step 2: Gather Data

Choose the right tool based on the data source:

**From the web (structured scraping):**
Use `data-scraper` when the user wants data from specific websites:
- Product listings (Amazon, eBay) → use appropriate Apify actor
- Job postings (LinkedIn, Indeed) → use job scraping actor
- Social media (YouTube, TikTok) → use platform-specific actor
- General websites → use web scraper actor with CSS selectors

Always save scraper output to a file (never print to stdout — too large).

**From the web (research/stats):**
Use `internet-search` for quick lookups — current market data, published statistics, benchmarks.
Use `deep-research` when the analysis needs verified facts from multiple sources (e.g., market size, industry trends, competitive landscapes).

**From uploaded files:**
Read the file directly. Supported: CSV, XLSX, JSON, TSV, text files.
- Use pandas for loading and initial inspection
- Check for missing values, data types, encoding issues
- Preview first rows to understand structure

**Combining sources:**
Many analyses need both scraped data and context. Example: scrape Amazon laptop prices (data-scraper), then look up expert review scores (internet-search) to cross-reference.

### Step 3: Clean & Explore

Before analysis, clean the data:

1. **Inspect** — Shape, columns, types, sample rows
2. **Clean** — Handle missing values, fix types (dates, numbers), remove duplicates
3. **Standardize** — Consistent naming, units, date formats
4. **Derive** — Calculate new columns needed for analysis (ratios, growth rates, categories)

For large datasets, compute summary statistics first:
- Numeric: count, mean, median, std, min, max, percentiles
- Categorical: unique values, frequency distribution
- Temporal: date range, gaps, seasonality indicators

### Step 4: Analyze

Choose analysis methods based on what the user wants:

| Goal | Method |
|------|--------|
| Compare items | Ranking, side-by-side tables, normalized scores |
| Find trends | Time series, moving averages, growth rates, YoY change |
| Show distribution | Histograms, percentiles, box plots, frequency tables |
| Find correlation | Scatter plots, correlation matrix, regression |
| Identify outliers | IQR method, z-scores, visual inspection |
| Forecast | Linear regression, moving average projection |
| Segment/cluster | Group by categories, percentile buckets, cross-tabulation |
| Measure performance | KPIs, benchmarks, index comparisons |

For statistical analysis, use Python (pandas, numpy, scipy) inside the sandbox. Calculate:
- Descriptive statistics (mean, median, std, IQR)
- Correlation coefficients
- Growth rates (CAGR, MoM, YoY)
- Significance tests when comparing groups

### Step 5: Visualize

Use `echarts` to create interactive charts. Match chart type to analysis:

| Analysis | Chart Type |
|----------|------------|
| Comparison (few items) | Horizontal bar chart |
| Comparison (many items) | Sorted bar chart with top-N highlight |
| Trend over time | Line chart with markers at key events |
| Distribution | Histogram or box plot |
| Composition | Pie chart (≤6 slices) or stacked bar |
| Correlation | Scatter plot with trend line |
| Ranking | Horizontal bar chart, sorted descending |
| Geographic | Map (if location data) |
| Multi-metric dashboard | Grid of small charts |

Always include:
- Clear title describing the insight (not just "Chart 1")
- Axis labels with units
- Tooltips with exact values
- Legend for multi-series
- Source attribution if data was scraped

### Step 6: Deliver

Choose delivery format based on complexity:

**Simple analysis (1-2 charts, one dataset):**
- Create charts as HTML files via `echarts`
- Create a spreadsheet with raw data + analysis via `spreadsheet-builder`
- Write a text summary of key findings

**Comprehensive analysis (multiple charts, insights):**
- Deploy an interactive dashboard with `rebyte-app-builder`
- Include charts, data tables, and narrative on one page
- Share the live URL

**Data-heavy output (raw data for further use):**
- Create a structured spreadsheet via `spreadsheet-builder`
- Include raw data sheet + summary/analysis sheet
- Add formulas for recalculation

After delivering:
1. Summarize the top 3-5 key findings
2. Note data limitations (sample size, date range, source reliability)
3. Suggest follow-up analyses if relevant

## Decision Points

- **"data-scraper or internet-search?"** — Use `data-scraper` when you need structured data from specific websites (product listings, job postings, profiles). Use `internet-search` when you need published facts, statistics, or to find data sources. Use `deep-research` when you need a comprehensive report with verified multi-source findings.

- **"echarts or spreadsheet-builder?"** — Use `echarts` for visual storytelling (interactive charts as HTML). Use `spreadsheet-builder` for data you want the user to explore, filter, or modify. Most analyses benefit from both.

- **"Single charts or dashboard?"** — If the analysis has one clear story (e.g., price comparison), use individual charts. If it has multiple dimensions (e.g., full market analysis with pricing, ratings, trends, and segmentation), deploy a dashboard with `rebyte-app-builder`.

- **"How much data to scrape?"** — Match the analysis need. For ranking/comparison: 20-50 items is usually enough. For statistical analysis: aim for 100+ data points. For trend analysis: at least 12 time periods. Always respect the 5-minute scraper timeout.

- **"Uploaded file: analyze or just process?"** — If the user says "analyze," provide insights, stats, and visualizations. If they say "clean up" or "restructure," focus on data transformation without adding analysis. Ask if unclear.
