import { Component, Input, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: `bar-chart`,
  templateUrl: `bar-chart.html`,
  styleUrls: [`bar-chart.scss`]
})
export class BarChartComponent {
  @ViewChild(`barChart`, { static: false }) barChartElem;

  @Input() color?: string = `#3692cc`;
  @Input() label?: string;
  @Input() labelColor?: any = `blue`;
  @Input() name: string;
  @Input() range;
  @Input() size?: string = `small`;
  @Input() subLabel?: boolean = false;
  @Input() tinyHeader?: string;
  @Input() unit?: string = `student`;
  @Input() value: number;

  // public newConfig: any;
  // public newData: any;
  // public newOptions: any;

  // ngOnInit() {
  //   this.barChartElem.fill = this.color;
  //   this.setupNewChart();
  //   this.newConfig = {
  //     deepWatchData: false,
  //     disabled: true
  //   };
  //   if (this.label) {
  //     const labelArray = split(this.label);
  //     if (labelArray[0] === `1`) {
  //       // remove 's' from label if the value is 1
  //       this.label = trimEnd(this.label, `s`);
  //     }
  //   }
  // }

  // public setupNewChart() {
  //   const chartMargin = 0;
  //   const chartHeight = this.size === `large` ? 50 : 25;
  //   const newOptions: any = {
  //     chart: {
  //       barColor: [this.color],
  //       color: [this.color],
  //       duration: 500,
  //       growOnHover: false,
  //       height: chartHeight,
  //       margin: {
  //         bottom: chartMargin,
  //         left: chartMargin,
  //         right: chartMargin,
  //         top: chartMargin
  //       },
  //       showControls: false,
  //       showLegend: false,
  //       showValues: true,
  //       showXAxis: true,
  //       showYAxis: true,
  //       tooltip: {
  //         enabled: false
  //       },
  //       type: 'multiBarHorizontalChart',
  //       valueFormat: d3.format(',.0f'),
  //       x(d) {
  //         return d.name;
  //       },
  //       y(d) {
  //         return d.value;
  //       }
  //     }
  //   };
  //   if (this.range) {
  //     newOptions.yDomain = this.range;
  //   }
  //   // if (this.showLegend) {
  //   //   newOptions.chart.labelsOutside = true;
  //   //   newOptions.chart.labelThreshold = 0.05;
  //   //   newOptions.chart.labelType = `percent`;
  //   //   newOptions.chart.legendPosition = `right`;
  //   //   newOptions.chart.showLabels = true;
  //   //   newOptions.chart.legend.height = chartHeight;
  //   // } else {
  //   //   newOptions.chart.title = this.series.values[0] + `%`;
  //   //   newOptions.chart.width = chartHeight;
  //   // }
  //   this.newOptions = newOptions;
  //   this.newData = [
  //     {
  //       key: this.name,
  //       values: [
  //         {
  //           name: this.name,
  //           value: this.value
  //         }
  //       ]
  //     }
  //   ];
  //   // const newData = [];
  //   // for (let i = 0; i < this.series.values.length; i++) {
  //   //   newData.push({
  //   //     name: this.series.names[i],
  //   //     value: this.series.values[i]
  //   //   });
  //   // }
  //   // this.newData = newData;
  // }
}
