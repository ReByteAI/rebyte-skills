---
name: echarts
description: Create interactive charts and data visualizations using pyecharts (Python) and Apache ECharts. Use when user needs charts, graphs, or data visualizations rendered as HTML. Triggers include "create chart", "make a graph", "visualize data", "bar chart", "line chart", "pie chart", "scatter plot", "heatmap", "data visualization", "plot this data", "chart this". Do NOT use for static images or matplotlib-style charts.
---

# ECharts Skill

## Technology Stack

- **pyecharts**: Python wrapper for Apache ECharts
- **Apache ECharts**: JavaScript charting library
- **Output**: Self-contained HTML with embedded JS

## Chart Types Reference

### Bar Charts
```python
from pyecharts.charts import Bar
from pyecharts import options as opts

chart = Bar()
chart.add_xaxis(labels)
chart.add_yaxis("Series Name", values)
chart.set_global_opts(
    title_opts=opts.TitleOpts(title="Chart Title"),
    tooltip_opts=opts.TooltipOpts(trigger="axis"),
    xaxis_opts=opts.AxisOpts(axislabel_opts=opts.LabelOpts(rotate=45)),
)
```

### Line Charts
```python
from pyecharts.charts import Line

chart = Line()
chart.add_xaxis(dates)
chart.add_yaxis("Actual", values, is_smooth=True)
chart.add_yaxis("7-Day MA", moving_avg_7, is_smooth=True, linestyle_opts=opts.LineStyleOpts(type_="dashed"))
```

### Pie Charts
```python
from pyecharts.charts import Pie

chart = Pie()
chart.add("", list(zip(labels, values)))
chart.set_global_opts(legend_opts=opts.LegendOpts(orient="vertical", pos_left="left"))
```

### Heatmaps
```python
from pyecharts.charts import HeatMap

chart = HeatMap()
chart.add_xaxis(x_labels)
chart.add_yaxis("", y_labels, value=[[x, y, val], ...])
chart.set_global_opts(
    visualmap_opts=opts.VisualMapOpts(min_=0, max_=max_val),
)
```

### Scatter Plots (for anomalies)
```python
from pyecharts.charts import Scatter

chart = Scatter()
chart.add_xaxis(dates)
chart.add_yaxis("Cost", costs, symbol_size=10)
# Add anomaly markers with different color/size
```

## Critical: Browser Compatibility

**Always convert to lists for JavaScript:**
```python
# CORRECT
chart.add_xaxis(df['column'].tolist())
chart.add_yaxis("Label", df['values'].tolist())

# WRONG - causes rendering issues
chart.add_xaxis(df['column'].values)  # numpy array
chart.add_xaxis(df['column'])  # pandas Series
```

## Theme Options

Available themes in pyecharts:
- `macarons` (default) - Colorful, professional
- `shine` - Bright colors
- `roma` - Muted, elegant
- `vintage` - Retro feel
- `dark` - Dark background
- `light` - Light, minimal

Usage:
```python
from pyecharts.globals import ThemeType
chart = Bar(init_opts=opts.InitOpts(theme=ThemeType.MACARONS))
```

## HTML Report Structure

```python
def generate_html_report(self, output_path: str, top_n: int = 10) -> str:
    # Create all charts
    charts = [
        self.create_cost_by_service_chart(top_n),
        self.create_cost_by_account_chart(),
        # ... more charts
    ]

    # Combine into page
    page = Page(layout=Page.SimplePageLayout)
    for chart in charts:
        page.add(chart)

    # Render to file
    page.render(output_path)
    return output_path
```

## Formatting Numbers

```python
# Currency formatting in tooltips
tooltip_opts=opts.TooltipOpts(
    trigger="axis",
    formatter="{b}: ${c:,.2f}"
)

# Axis label formatting
yaxis_opts=opts.AxisOpts(
    axislabel_opts=opts.LabelOpts(formatter="${value:,.0f}")
)
```

## Common Issues & Solutions

### Empty Charts
1. Check browser console for JS errors
2. Verify `.tolist()` on all data
3. Hard refresh (Ctrl+Shift+R)
4. Check data exists in HTML source

### Chart Too Small
```python
init_opts=opts.InitOpts(width="100%", height="400px")
```

### Labels Overlapping
```python
xaxis_opts=opts.AxisOpts(
    axislabel_opts=opts.LabelOpts(rotate=45, interval=0)
)
```

### Legend Too Long
```python
legend_opts=opts.LegendOpts(
    type_="scroll",
    orient="horizontal",
    pos_bottom="0%"
)
```

## Design Guidelines

Create ECharts visualizations with these requirements:

### 1. Responsive Layout
Use 100% width and height (not fixed px):
```python
init_opts=opts.InitOpts(width="100%", height="400px")
```

### 2. Modern Color Palette
Use a professional scheme:
```python
colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']
```

### 3. Clean Styling
- White/transparent background
- Subtle grid lines (opacity 0.1)
- Proper padding:
```python
grid_opts=opts.GridOpts(pos_left="60px", pos_right="40px", pos_top="60px", pos_bottom="40px")
```

### 4. Typography
- Title: 16-18px, bold, dark color
- Axis labels: 12px
```python
title_opts=opts.TitleOpts(
    title="Chart Title",
    title_textstyle_opts=opts.TextStyleOpts(font_size=18, font_weight="bold", color="#333")
)
```

### 5. Interactions
Enable tooltip with shadow and add toolbox:
```python
tooltip_opts=opts.TooltipOpts(trigger="axis", axis_pointer_type="shadow")
toolbox_opts=opts.ToolboxOpts(
    feature=opts.ToolBoxFeatureOpts(
        save_as_image=opts.ToolBoxFeatureSaveAsImageOpts(title="Save as Image"),
        data_zoom=opts.ToolBoxFeatureDataZoomOpts(zoom_title="Zoom", back_title="Reset Zoom"),
        restore=opts.ToolBoxFeatureRestoreOpts(title="Restore"),
    )
)
```

### 6. Animation
Smooth entrance animation (enabled by default in pyecharts)

### Raw HTML Structure (for non-pyecharts)
```html
<div id="chart" style="width:100%;height:100%;min-height:400px;"></div>
<script>
var chart = echarts.init(document.getElementById('chart'));
chart.setOption({
  color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
  grid: { left: 60, right: 40, top: 60, bottom: 40 },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  toolbox: { feature: { saveAsImage: { title: 'Save as Image' }, dataZoom: { title: { zoom: 'Zoom', back: 'Reset Zoom' } }, restore: { title: 'Restore' } } },
  // ... chart-specific options
});
window.addEventListener('resize', () => chart.resize());
</script>
```

### Quick Reference Checklist
- [ ] Responsive (100% width/height, min-height 400px)
- [ ] Modern colors (#5470c6, #91cc75, #fac858, #ee6666, #73c0de)
- [ ] Proper grid padding and subtle grid lines
- [ ] Tooltip, toolbox, and resize handler included

## Delivering Output

After generating chart HTML files, upload them to the Artifact Store so the user can access them.

## Testing Visualizations

```bash
# Test chart creation
uv run pytest tests/test_visualizer.py -v

# Regenerate example report
uv run pytest tests/test_examples.py -v -s

# View in browser
open examples/example_report.html
```
