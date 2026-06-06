import PropTypes from "prop-types";

/**
 * MoodTrendChart component.
 * Renders the 7-Day Mood Trend card container and its inner custom responsive SVG line chart.
 * 
 * @param {object} props The component props.
 * @param {array} props.lastSevenDays Data points for the last 7 calendar days.
 * @param {object} props.moodEmojis Mapping of numeric mood scores (1-5) to emojis.
 * @returns {React.ReactElement} The visual chart card block.
 */
export default function MoodTrendChart({ lastSevenDays, moodEmojis }) {
  // Chart geometry variables
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  // Days are spaced along the width
  const points = lastSevenDays.map((day, idx) => {
    const x = paddingLeft + (idx * (graphWidth / 6));
    // Mood values range 1-5. Value 5 maps to top (y=paddingTop), Value 1 maps to bottom (y=paddingTop+graphHeight)
    let y = null;
    if (day.value !== null) {
      y = paddingTop + graphHeight - ((day.value - 1) * (graphHeight / 4));
    }
    return { ...day, x, y };
  });

  // Generate SVG path coordinate line
  const activePoints = points.filter(p => p.y !== null);
  let linePath = "";
  let areaPath = "";

  if (activePoints.length > 0) {
    linePath = `M ${activePoints[0].x} ${activePoints[0].y}`;
    for (let i = 1; i < activePoints.length; i++) {
      linePath += ` L ${activePoints[i].x} ${activePoints[i].y}`;
    }

    // To fill the area chart
    const startX = activePoints[0].x;
    const endX = activePoints[activePoints.length - 1].x;
    const baselineY = paddingTop + graphHeight;
    areaPath = `${linePath} L ${endX} ${baselineY} L ${startX} ${baselineY} Z`;
  }

  // Y Axis levels
  const yLevels = [5, 4, 3, 2, 1].map(val => {
    const y = paddingTop + graphHeight - ((val - 1) * (graphHeight / 4));
    return { val, y, label: moodEmojis[val] || val };
  });

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <h3>7-Day Mood Trend</h3>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" />
            <span>Mood Rating (1-5)</span>
          </div>
        </div>
      </div>
      
      <div className="chart-wrapper">
        <svg className="svg-chart" viewBox={`0 0 ${width} ${height}`} aria-label="7-day mood history trend line chart">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-mint)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-mint)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yLevels.map(lvl => (
            <g key={lvl.val}>
              <line
                className="chart-grid-line"
                x1={paddingLeft}
                y1={lvl.y}
                x2={width - paddingRight}
                y2={lvl.y}
              />
              <text
                className="chart-label-y"
                x={paddingLeft - 8}
                y={lvl.y + 3}
              >
                {lvl.label}
              </text>
            </g>
          ))}

          {/* Baseline Axis */}
          <line
            className="chart-axis-line"
            x1={paddingLeft}
            y1={paddingTop + graphHeight}
            x2={width - paddingRight}
            y2={paddingTop + graphHeight}
          />

          {/* Area fill */}
          {areaPath && <path className="chart-area" d={areaPath} />}

          {/* Trend line */}
          {linePath && <path className="chart-line" d={linePath} />}

          {/* Data points */}
          {points.map((pt, idx) => (
            <g key={idx}>
              {pt.y !== null && (
                <>
                  <circle
                    className="chart-point"
                    cx={pt.x}
                    cy={pt.y}
                    r="5"
                    aria-label={`${pt.label} mood was ${pt.value}`}
                  />
                  {/* Tooltip trigger or label above */}
                  <text
                    x={pt.x}
                    y={pt.y - 12}
                    fontSize="8"
                    fill="var(--color-mint)"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {pt.emoji}
                  </text>
                </>
              )}
              {/* X Axis Labels */}
              <text
                className="chart-label-x"
                x={pt.x}
                y={height - 8}
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

MoodTrendChart.propTypes = {
  lastSevenDays: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    dateStr: PropTypes.string.isRequired,
    value: PropTypes.number,
    emoji: PropTypes.string,
    trigger: PropTypes.string
  })).isRequired,
  moodEmojis: PropTypes.object.isRequired
};
