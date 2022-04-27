import moment from 'moment';

export class ChartHelper {
  // Formats arrays of dates
  public static formatDates(format: string, dateArray: Date[]): any {
    const resultedArray: any = [];
    dateArray.forEach(date => {
      resultedArray.push(moment(date).format(format));
    });
    return resultedArray;
  }

  public static getHSLColorArray(num: number): string[] {
    const colorStrings: string[] = [];
    for (let index: number = 0; index < num; index++) {
      colorStrings.push(`hsl(${Math.floor(index / 3) * 10}, ${100 - (index % 3) * 15}%, 30%)`);
    }
    return colorStrings;
  }

  // We create a gradient inside the chart context
  private static createColorGradient(ctx: any, height: number): object {
    const gradientStroke: any = ctx.createLinearGradient(0, 0, 0, height); // 120 si  90
    gradientStroke.addColorStop(0, '#ffcfd3');
    gradientStroke.addColorStop(0.3, '#ffd9dc');
    gradientStroke.addColorStop(0.6, '#ffe3e5');
    gradientStroke.addColorStop(1, '#ffffff');
    return gradientStroke;
  }

  // Returns the red line design and data
  public static getFirstDataSet(ctx: any, dataset: number[], height: number = 100): object {
    const gradientStroke: any = ChartHelper.createColorGradient(ctx, height);
    return {
      data: dataset,
      borderColor: '#9a0000',
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: '#9a0000',
      borderWidth: 1,
      fill: true,
      backgroundColor: gradientStroke
    };
  }

  // Returns the dotted line design and data
  public static getSecondDataSet(dataset: number[]): object {
    return {
      data: dataset,
      borderColor: '#727272',
      borderDash: [3, 3],
      pointRadius: 0,
      pointHoverRadius: 4,
      pointHoverBackgroundColor: '#727272',
      borderWidth: 1,
      fill: false
    };
  }

  // Returns the set-up for the first chart
  public static getFirstChartOptions(labelData0: any, labelData1: any, index: number): object {
    // A function to create a custom template
    function processTooltipModel(model: any): void {
      const tooltip: any = document.querySelectorAll('#tooltips')[index] as HTMLElement;

      // If there is no point selected we hide the tooltip
      if (!model.body) {
        tooltip.style.display = 'none';
        return;
      }

      // We set the tooltip position
      if (model.xAlign === 'right') {
        tooltip.style.left = model.caretX - 100 + 'px';
      } else {
        tooltip.style.left = model.caretX + 'px';
      }
      tooltip.style.top = model.caretY + 'px';
      tooltip.style.display = 'block';

      // We set the tooltip labels and values
      tooltip.querySelector('#label-data0').textContent = moment(labelData0[model.dataPoints[0].index]).format(
        'MMM dd, yyyy'
      );
      tooltip.querySelector('#value-data0 .value').textContent = model.dataPoints[0].value;
      tooltip.querySelector('#label-data1').textContent = moment(labelData1[model.dataPoints[1].index]).format(
        'MMM dd, yyyy'
      );
      tooltip.querySelector('#value-data1 .value').textContent = model.dataPoints[1].value;
    }

    return {
      // Needed because we maintain the height while changing the width
      maintainAspectRatio: false,

      // We set the hover to select the nearest point
      hover: {
        mode: 'index',
        intersect: false,
        animationDuration: 0
      },

      // We disable the chartJS chart and create a custom one
      tooltips: {
        enabled: false,
        custom: processTooltipModel,
        intersect: false,
        mode: 'index'
      },

      // Used to hide labels and grids
      scales: {
        yAxes: [
          {
            ticks: {
              display: false,
              beginAtZero: true
            },
            gridLines: {
              display: false
            }
          }
        ],
        xAxes: [
          {
            ticks: {
              display: false
            },
            gridLines: {
              display: false
            }
          }
        ]
      },
      legend: {
        display: false
      },

      // Used so that the canvas will take it's render size from its parent
      responsive: true,
      display: true
    };
  }

  // Returns the set-up for the second chart
  public static getSecondChartOptions(labelData0: any, labelData1: any): object {
    // A function to create a custom template
    function processTooltipModel(model: any): void {
      const tooltip: any = document.getElementById('tooltip');

      // If there is no point selected we hide the tooltip
      if (!model.body) {
        tooltip.style.display = 'none';
        return;
      }

      // We set the tooltip position
      if (model.xAlign === 'right') {
        tooltip.style.left = model.caretX - 100 + 'px';
      } else {
        tooltip.style.left = model.caretX + 'px';
      }
      tooltip.style.top = model.caretY + 'px';
      tooltip.style.display = 'block';

      // We set the tooltip labels and values
      tooltip.querySelector('#label-data0').textContent = moment(labelData0[model.dataPoints[0].index]).format(
        'MMM dd, yyyy'
      );
      tooltip.querySelector('#value-data0 .value').textContent = model.dataPoints[0].value;
      tooltip.querySelector('#label-data1').textContent = moment(labelData1[model.dataPoints[1].index]).format(
        'MMM dd, yyyy'
      );
      tooltip.querySelector('#value-data1 .value').textContent = model.dataPoints[1].value;
    }

    return {
      // Needed because we maintain the height while changing the width
      maintainAspectRatio: false,

      // We set the hover to select the nearest point
      hover: {
        mode: 'index',
        intersect: false,
        animationDuration: 0
      },

      // We disable the chartJS chart and create a custom one
      tooltips: {
        enabled: false,
        custom: processTooltipModel,
        intersect: false,
        mode: 'index'
      },

      scales: {
        yAxes: [
          {
            // Sets the design for Y Axis labels
            ticks: {
              padding: 5,
              beginAtZero: true,
              stepSize: 150
            },

            // We set the grid lines design
            gridLines: {
              borderDash: [3, 3],
              drawBorder: false,
              zeroLineBorderDash: [3, 3],
              zeroLineColor: '#e8e8e8',
              z: 2
            }
          }
        ],
        xAxes: [
          {
            // Sets the design for X Axis labels
            ticks: { autoSkip: true, autoSkipPadding: 20, maxRotation: 0 },

            // We hide the X Axis grid lines
            gridLines: {
              display: false
            }
          }
        ]
      },
      legend: {
        display: false
      },

      // Used so that the canvas will take it's render size from its parent
      responsive: true,
      display: true
    };
  }
}
