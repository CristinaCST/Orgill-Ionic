import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import Chart from 'chart.js';
import { ChartHelper } from '../../helpers/chart';
import { CalendarService } from '../../services/dashboard/calendar';

@Component({
  selector: 'dashboard-chart',
  templateUrl: 'dashboard-chart.html'
})
export class DashboardChartComponent implements OnChanges {
  @ViewChild('CanvasContainer') private readonly canvasContainer: ElementRef;
  @Input() public data: any;
  @Input() public title: string;
  @Input() public isLoading: boolean;
  @Input() private readonly index?: number;

  public chart: Chart;
  public growth: number;
  public selectedTotalRecords: number;
  public isSearchStatistics: boolean = false;

  constructor(private readonly calendarService: CalendarService) {}

  public ngOnChanges({ data }: any): void {
    if (!data.currentValue) {
      return;
    }

    const { selectedTotal, comparedTotal } = data.currentValue;
    this.isSearchStatistics = isNaN(this.index);
    this.growth = this.calculateGrowth(selectedTotal.totalRecords, comparedTotal.totalRecords);
    this.selectedTotalRecords = selectedTotal.totalRecords;
    this.initChart(selectedTotal.noOfDailyRecords, comparedTotal.noOfDailyRecords);
  }

  private initChart(selectedTotal: number[], comparedTotal: number[]): void {
    const ctx: any = this.canvasContainer.nativeElement.getContext('2d');

    if (this.isSearchStatistics) {
      this.createNewTypeOfLineChart();
    }

    const selectedTotalOptions: any = this.calendarService.getArrayOfDates(
      this.calendarService.getCurrentState().selectedStartDate,
      this.calendarService.getCurrentState().selectedEndDate
    );
    const comparedTotalOptions: any = this.calendarService.getArrayOfDates(
      this.calendarService.getCurrentState().compareStartDate,
      this.calendarService.getCurrentState().compareEndDate
    );

    if (selectedTotal.length === 1) {
      selectedTotal.push(...selectedTotal);
      comparedTotal.push(...comparedTotal);
      selectedTotalOptions.push(...selectedTotalOptions);
      comparedTotalOptions.push(...comparedTotalOptions);
    }

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: this.isSearchStatistics ? 'LineWithLine' : 'line',

      data: this.isSearchStatistics
        ? {
            labels: ChartHelper.formatDates('MMM dd', selectedTotalOptions),
            datasets: [ChartHelper.getFirstDataSet(ctx, selectedTotal, 90), ChartHelper.getSecondDataSet(comparedTotal)]
          }
        : {
            labels: selectedTotal,
            datasets: [
              ChartHelper.getFirstDataSet(ctx, selectedTotal, 120),
              ChartHelper.getSecondDataSet(comparedTotal)
            ]
          },

      options: this.isSearchStatistics
        ? ChartHelper.getSecondChartOptions(selectedTotalOptions, comparedTotalOptions)
        : ChartHelper.getFirstChartOptions(selectedTotalOptions, comparedTotalOptions, this.index)
    });
  }

  private createNewTypeOfLineChart(): void {
    // We extend the line type of chart
    Chart.defaults.LineWithLine = Chart.defaults.line;
    Chart.controllers.LineWithLine = Chart.controllers.line.extend({
      draw: function (ease: any): void {
        Chart.controllers.line.prototype.draw.call(this, ease);

        // Checks if the tooltip is active
        if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
          const activePoint: any = this.chart.tooltip._active[0];
          const ctx: any = this.chart.ctx;
          const x: any = activePoint.tooltipPosition().x;
          const topY: any = this.chart.legend.bottom;
          const bottomY: any = this.chart.chartArea.bottom;

          // draw line
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, topY);
          ctx.lineTo(x, bottomY);
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#E0797E15';
          ctx.stroke();
          ctx.restore();
        }
      }
    });
  }

  private calculateGrowth(selectedTotalRecords: number, comparedTotalRecords: number): number {
    if (!selectedTotalRecords) {
      if (!comparedTotalRecords) {
        return 0;
      }
      return 100;
    }
    return Math.round(((comparedTotalRecords - selectedTotalRecords) / selectedTotalRecords) * 100);
  }
}
