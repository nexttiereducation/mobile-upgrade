import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { split, trimEnd } from 'lodash';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: `pie-chart`,
  templateUrl: `pie-chart.html`
})
export class PieChartComponent implements OnInit {
  @Input() public label?: string;
  @Input() public labelColor?: any = `blue`;

  public newConfig: any;
  public newData: any;
  public newOptions: any;
  @ViewChild(`pieChart`) public pieChartElem;
  @Input() public series: any;
  @Input() public showLegend?: boolean = false;
  @Input() public size?: string = `small`;
  @Input() public subLabel?: boolean = false;
  @Input() public tinyHeader?: string;
  @Input() public unit?: string = `student`;

  public ionViewDidLoad() {
    this.pieChartElem.fill = this.series.colors[0];
  }

  ngOnInit() {
    this.setupNewChart();
    this.newConfig = {
      deepWatchData: false,
      disabled: true
    };
    if (this.label) {
      const labelArray = split(this.label);
      if (labelArray[0] === `1`) {
        // remove 's' from label if the value is 1
        this.label = trimEnd(this.label, `s`);
      }
    }
  }

  public setupNewChart() {
    if (!this.series.names) {
      this.series.names = [``, ``];
    }
    if (!this.series.colors) {
      this.series.colors = [`#3692cc`, `#e1e1e1`];
    }
    const chartMargin = 0;
    let chartHeight = this.showLegend ? 90 : 70;
    if (this.size === `large`) {
      chartHeight = 150;
    }
    const newOptions: any = {
      chart: {
        color: this.series.colors,
        donut: true,
        donutRatio: 0.65,
        duration: 500,
        growOnHover: false,
        height: chartHeight,
        legend: {
          updateState: false
        },
        margin: {
          bottom: chartMargin,
          left: chartMargin,
          right: chartMargin,
          top: chartMargin
        },
        showLegend: this.showLegend,
        tooltip: {
          enabled: false
        },
        type: `pieChart`,
        x(d) {
          return d.name;
        },
        y(d) {
          return d.value;
        }
      }
    };
    if (this.showLegend) {
      newOptions.chart.labelsOutside = true;
      newOptions.chart.labelThreshold = 0.05;
      newOptions.chart.labelType = `percent`;
      newOptions.chart.legendPosition = `right`;
      newOptions.chart.showLabels = true;
      newOptions.chart.legend.height = chartHeight;
    } else {
      newOptions.chart.title = this.series.values[0] + `%`;
      newOptions.chart.width = chartHeight;
    }
    this.newOptions = newOptions;
    const newData = [];
    for (let i = 0; i < this.series.values.length; i++) {
      newData.push({
        name: this.series.names[i],
        value: this.series.values[i]
      });
    }
    this.newData = newData;
  }
}
