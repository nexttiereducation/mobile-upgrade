import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  encapsulation: ViewEncapsulation.None,
  selector: `pie-chart`,
  templateUrl: `pie-chart.html`,
  styleUrls: [`pie-chart.scss`]
})
export class PieChartComponent implements OnInit {
  @ViewChild('pieCanvas', { static: true }) pieCanvas: ElementRef;

  @Input() colors: any[];
  @Input() series: any;
  @Input() showLegend: boolean = false;
  @Input() size: string = `small`;
  @Input() subtitle: boolean = false;
  @Input() title?: string;
  @Input() unit: string = `student`;

  private pieChart: Chart;

  get chart(): ApexChart {
    return {
      height: 250,
      type: `pie`
    };
  }

  get dataLabels(): ApexDataLabels {
    return {
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        opacity: 0.45
      },
      enabled: this.showLegend,
      enabledOnSeries: this.showLegend,
      formatter: (val, opts) => `${Math.round(val)}%`,
      style: {
        fontSize: '14px',
        colors: ['#ffffff']
      }
    };
  }

  get labels() {
    return this.series.names;
  }

  get legend(): ApexLegend {
    return {
      fontSize: '14px',
      show: this.showLegend
    };
  }

  get values() {
    return this.series.values;
  }

  constructor() { }

  ngOnInit(): void {
    // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    // Add 'implements OnInit' to the class.
    this.pieChart = new Chart(this.pieCanvas.nativeElement, {
      type: 'pie',
      data: {
        labels: this.series.names,
        datasets: [
          {
            // label: '# of Votes',
            data: this.series.values,
            backgroundColor: this.colors,
            hoverBackgroundColor: this.colors
          }
        ]
      },
      options: {
        legend: {
          labels: {
            boxWidth: 20,
            fontFamily: 'Roboto, Helvetica, sans-serif',
            usePointStyle: true
          }
        }
      }
    });
  }
}
