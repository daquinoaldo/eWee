// ----- ----- STATIC CONFIG ----- ----- //
var newChartConfig = () => {
  let chartConfig = {
    type: 'line',
    options: {
      showTooltips: false,
      responsive: true,
      tooltips: {enabled: false},
      hover: {mode: null},
      scales: {
        yAxes: [{
          ticks: {
              beginAtZero:true,
              min: 0,
              max: 50
          }
        }]
      }
    }
  };
  return chartConfig;
}


// ----- ----- GENERATOR ----- ----- //
/*
 * Creates an array with values from 0 to n, not included.
 *   e.g.: nLinear(n) -> [0, ..., n-1]
 */
let nLinear = (n) => { return Array.from(new Array(n), (x,i) => i); }

/*
 * Creates an array with n zeros
 */
let nZeros = (n) => { return Array.from(new Array(n), (x,i) => 0); }

/*
 * Creates the chart, if it doesn't exist, and initializes it with n zeros.
 * @param ctx: the context where to build the graph
 * @param queueSize: the maximum number of elements to store (x-axis' length)
 * @param bounds: an object containing the mimum and maximum expected values
 *   the object has to be in the format: {min: minValue, max: maxValue}
 */
export function createChart(ctx, queueSize, bounds) {
  let chartConfig = newChartConfig();

  // Configuring initial data
  chartConfig.data = {
    labels: nLinear(queueSize),
    datasets: [{
      label: '°C',
      borderColor: '#1565c0',
      data: nZeros(queueSize),
      fill: false,
    }
  ]};
  // Checking if there is a minimum or maximum for the y axis
  if (bounds) {
    if(bounds.min)
      chartConfig.options.scales.yAxes[0].ticks.min = bounds.min;
    if (bounds.max)
      chartConfig.options.scales.yAxes[0].ticks.max = bounds.max;
  }
  // We can now create the chart
  return new Chart(ctx, chartConfig);
}
