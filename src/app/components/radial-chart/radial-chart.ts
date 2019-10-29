import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';

import 'chartjs-plugin-datalabels';
import 'chartjs-plugin-doughnutlabel';

@Component({
  selector: 'radial-chart',
  templateUrl: 'radial-chart.html',
  styles: [`
    :host {
      display: block;
      height: 100%;
      position: relative;
    }
    :host .chart-container {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: stretch;
      min-height: 200px;
    }
  `]
})
export class RadialChartComponent implements OnInit {
  @ViewChild('doughnutCanvas', { static: true }) doughnutCanvas: ElementRef;

  @Input() color: string;
  @Input() colors: string[] = [
    '#0084CA',
    '#e0e0e0'
  ];
  @Input() height: number = 280;
  @Input() label: string | string[] = 'Progress';
  @Input() value: string | number;

  private doughnutChart: Chart;

  get labels() {
    let labels = [
      {
        text: `${this.value}%`,
        font: {
          size: '50',
          units: 'rem'
        }
      }
    ];
    if (typeof this.label === 'string') {
      if (this.label.length > 30) {
        const words: string[] = this.label.split(' ');
        const splitLabels: string[] = [''];
        let lineLength = 0;
        let on2ndLine = false;
        words.forEach(w => {
          lineLength += w.length;
          if (on2ndLine) {
            splitLabels[1] += ` ${w}`;
          } else {
            if (lineLength < this.label.length / 2) {
              if (words.indexOf(w) === 0) {
                splitLabels[0] += w;
              } else {
                splitLabels[0] += ` ${w}`;
              }
            } else {
              splitLabels[1] = `${w}`;
              on2ndLine = true;
            }
          }
        });
        const splitLabelObjs = splitLabels.map(
          (l: string) => {
            return {
              text: l,
              font: {
                size: '25',
                units: 'rem'
              }
            };
          });
        labels = [...labels, ...splitLabelObjs];
      } else {
        labels.push({
          text: this.label,
          font: {
            size: '25',
            units: 'rem'
          }
        });
      }
    } else {
      const splitLabelObjs = this.label.map(
        (l: string) => {
          return {
            text: l,
            font: {
              size: '25',
              units: 'rem'
            }
          };
        });
      labels = [...labels, ...splitLabelObjs];
    }

    return labels;
  }

  constructor() { }

  ngOnInit() {
    this.doughnutChart = new Chart(this.doughnutCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            backgroundColor: this.colors,
            data: [
              +this.value,
              100 - +this.value
            ],
            hoverBackgroundColor: this.colors,
            label: '%'
          }
        ],
        labels: [
          this.label,
          'Other'
        ]
      },
      options: {
        animation: {
          animateRotate: true,
          animateScale: true
        },
        cutoutPercentage: 75,
        elements: {
          arc: {
            borderWidth: 0
          }
        },
        legend: {
          display: false
        },
        // maintainAspectRatio: false,
        plugins: {
          datalabels: {
            opacity: 0
          },
          doughnutlabel: {
            labels: this.labels
          }
        },
        responsive: true,
      }
      //     labels: {
      //       boxWidth: 20,
      //       fontFamily: 'Roboto, Helvetica, sans-serif',
      //       usePointStyle: true
      //     }
      //   }
      // }
    });
  }
}
