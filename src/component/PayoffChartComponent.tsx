import React from 'react';
import Highcharts, { color } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartMore from 'highcharts/highcharts-more'
import { Button } from 'primereact/button';
import * as math from 'mathjs';
import { Utility } from '../utils/Utility';
import { Calendar, Checkbox, Dropdown, InputNumber, InputText } from 'primereact';
import { WhatIf } from '../entity/OptData';

import * as fs from 'fs';

HighchartMore(Highcharts)
interface Props {
    passedStateData,
    callback,
    callbackShow
}

interface State {
    price;
    IV;
    days;
    finalPrice;
    finalIV;
    finalDays;
}

export class PayoffChartComponent extends React.Component<Props, State> {
    whatif: WhatIf = new WhatIf();

    constructor(props) {
        super(props);
        this.state = {
            price: 50,
            IV: 50,
            days: 0,
            finalPrice: 0,
            finalIV: 0,
            finalDays: 0,
            // fairPrice: this.props.fairPrice
        };

        // this.whatif.IV = 0;
        this.whatif.days = this.props.passedStateData.latestRefreshDate;
        this.whatif.IV=0;
        this.whatif.price = 0;
        this.whatif.allowLegAdjustment=false;
    }

    render() {
        if (this.props.passedStateData.chartData == null) return null;
        // let fileName=new Date().toISOString();
        // fs.writeFileSync(fileName, this.props.data);
        
       
        this.whatif.days=this.props.passedStateData.latestRefreshDate;
        let arr1 = [];
        let arr2 = [];

        let xAxisData = this.props.passedStateData.chartData[0] as Array<number>;
        let len = xAxisData.length;

        let sd = this.props.passedStateData.chartData[3]["sd"];
        let fairPrice: number = this.props.passedStateData.fairPrice;
        let mean = len == 0 ? 0 : math.mean(xAxisData);
        let leftSigma1 = Math.round(mean - +sd);
        let leftSigma2 = Math.round(mean - 2 * +sd);
        let rightSigma1 = Math.round(mean + +sd);
        let rightSigma2 = Math.round(mean + 2 * sd);

        for (let i = 0; i < len; i++) {
            let item1 = [];
            let item2 = [];
            item1.push(this.props.passedStateData.chartData[0][i], this.props.passedStateData.chartData[1][i]);
            arr1.push(item1);

            item2.push(this.props.passedStateData.chartData[0][i], this.props.passedStateData.chartData[2][i]);
            arr2.push(item2);
        }

        let options = {
            chart: {
                zoomType: 'xy',
                height: 400,
            },

            title: {
                text: this.props.passedStateData.selectedsymbol,
                margin: 30,
                align: 'center',
                x: 50,
                style: {
                    color: 'black',
                    fontSize: '14px',
                }
            },

            credits: {
                text: 'iCharts.in',
                href: '/',
                position: {
                    verticalAlign: 'top',
                    y: 25

                },
                style: {
                    fontSize: '13px'
                }
            },

            xAxis: {
                gridLineWidth: 1,
                title: {
                    text: 'Price',
                    style: {
                        fontWeight: 'Bold',
                        color: 'Black'
                    },

                },
                labels: {
                    style: {
                        color: 'black'
                    }
                },

                plotBands: [{
                    color: 'rgba(197, 210, 200,0.1)',
                    from: leftSigma1, // Start of the plot band
                    to: rightSigma1, // End of the plot band
                    label: {
                        text: '-σ',
                        y: -18,
                        align: 'left',
                        style: {
                            color: '#606060'
                        }
                    }
                }
                    , {

                    color: 'rgba(197, 210, 200,0.1)',
                    fillOpacity: 0.2,
                    from: leftSigma1, // Start of the plot band
                    to: rightSigma1, // End of the plot band
                    label: {
                        text: '+σ',
                        y: -18,
                        align: 'right',
                        style: {
                            color: '#606060'
                        }
                    }
                },
                {

                    color: 'rgba(197, 210, 200,0.1)',
                    from: leftSigma2, // Start of the plot band
                    to: rightSigma2, // End of the plot band

                    label: {
                        text: '-2σ',
                        // x: 100,
                        y: -18,
                        align: 'left',
                        // rotation: -45,
                        style: {
                            color: '#606060'
                        }
                    }
                },
                {

                    color: 'rgba(197, 210, 200,0.1)',
                    from: leftSigma2, // Start of the plot band
                    to: rightSigma2, // End of the plot band
                    label: {
                        text: '+2σ',
                        // x: 100,
                        y: -18,
                        align: 'right',

                        style: {
                            color: '#606060'
                        }
                    }
                }],
                plotLines: [
                //     {
                //     color: '#231F20',
                //     fillOpacity: 0.2,
                //     lineWidth: 3,
                //     dashStyle: 'shortdot',
                //     zIndex: 3,
                //     value: fairPrice,
                //     label: {
                //         text: fairPrice?.toString(),
                //         rotation: 0,
                //         x: -30,
                //         y: -18,
                //         style: {
                //             fontSize: '11.5px',
                //             color: '#606060'
                //         }
                //     },
                // }, 
                {
                    color: 'red',
                    fillOpacity: 0.2,
                    lineWidth: 3,
                    dashStyle: 'shortdot',
                    zIndex: 3,
                    value: fairPrice * (1 + this.whatif.price / 100),
                    label: {
                        text: (fairPrice * (1 + this.whatif.price / 100)).toFixed(2),
                        rotation: 0,
                        x: -20,
                        y: 0,
                        style: {
                            fontSize: '11.5px',
                            color: '#606060'
                        }
                    }
                }
            ],
                crosshair: {
                    label: {
                        enabled: true,

                        padding: 8
                    }
                }
            },

            yAxis: [

                {
                    gridLineColor: 'rgba(50,205,50,0.15)',
                    startOnTick: false,
                    lineWidth: 1,

                    title: {
                        text: 'P/L',
                        style: {
                            fontWeight: 'Bold',
                            color: 'Black'
                        },
                    },
                    labels: {

                        style: {
                            color: 'black'
                        },

                    },
                    crosshair: {
                        label: {
                            enabled: true,
                        },
                        dashStyle: 'longdash',
                        color: 'gray',
                    },

                    plotLines: [{
                        value: 0,
                        width: 2,
                        color: '#aaa',

                    }],


                },
                { // Secondary yAxis

                    gridLineColor: 'rgba(50,205,50,0.15)',

                    lineWidth: 1,
                    startOnTick: false,
                    endOnTick: false,
                    title: {
                        text: '',
                        style: {
                            fontWeight: 'Bold'
                        },
                    },
                    label: {
                        enabled: true,
                    },

                    opposite: true,
                }


            ],

            legend: {
                align: 'right',
                verticalAlign: 'top',

            },
            tooltip: {
                split: true,
                padding: 3,
                // valueDecimals: tooltip_decimal,
                crosshair: {
                    width: 1,
                    color: 'gray',
                },
            },
            series: [{
                showInLegend: false,
                type: 'line',
                name: 'T+0',
                data: arr1,
                color: 'rgb(0,0,255)',
                fillOpacity: 0.1,
                connectNulls: true,
                lineWidth: 1.5,
                dashStyle: 'shortdot',
                marker: {
                    enabled: false
                }
            }, {
                type: 'area',
                name: 'Expiry',
                fillOpacity: 0.1,
                showInLegend: false,
                negativeColor: 'rgb(255,127,127)',
                color: 'rgb(50,205,50)',
                data: arr2,
                connectNulls: true,
                lineWidth: 1.5,
                marker: {
                    enabled: false
                }
            },
            ]

        };

        let totalDays = 14;
        let dayStep = 1;
        if (this.props.passedStateData.expiryDate) {
            totalDays = Math.ceil((Utility.timeFromString(this.props.passedStateData.expiryDate) - (new Date()).getTime()) / (1000 * 60 * 60 * 24));
            dayStep = Math.floor(100 / totalDays);
        }

        return <div key={'payoffChart_' + this.props.passedStateData.selectedsymbol + this.props.passedStateData.expiryDate}>
            <div style={{ display: this.props.passedStateData.chainShowed ? 'none' : 'flex' }} className='alignedLeft' >Option Chain<img src='./show_left.svg' onClick={this.props.callbackShow}></img></div>
            <div>
                <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { hight: '100%', width: '100%' } }} />
            </div>
            <div style={{ display:'flex', justifyContent:'flex-start', width: '100%' }}>
                <div className="leglot-dropdown" >
                    <InputNumber value={this.whatif.price} onValueChange={(e) => {
                        this.whatif.price = e.value;
                        this.setState({ price: e.value },
                            () => this.props.callback(this.whatif))
                    }
                    } showButtons style={{ height: '24px', width: '140px', fontSize: 'small' }}
                        buttonLayout="horizontal" step={1} prefix='Price (%) ' max={20} min={-20}
                        decrementButtonClassName="p-button-danger" incrementButtonClassName="p-button-success" incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" />
                </div>
                <div style={{marginLeft:'5px'}}>
                    <Calendar style={{ height: '28px', width: '170px', fontSize: 'small' }} value={this.whatif.days} onChange={(e) => {
                        this.whatif.days = e.value;
                        this.setState({ days: e.value },
                            () => this.props.callback(this.whatif))
                    }
                    } showTime hourFormat="12" minDate={new Date()} />
                </div>
                <div className="leglot-dropdown" style={{marginLeft:'5px'}}>
                    <InputNumber value={this.whatif.IV} disabled={this.whatif.allowLegAdjustment} onValueChange={(e) => {
                        this.whatif.IV = e.value;
                        this.setState({ IV: e.value },
                            () => this.props.callback(this.whatif))
                    }
                    } showButtons style={{ height: '24px', width: '120px', fontSize: 'small' }}
                        buttonLayout="horizontal" step={1} prefix='IV (%) ' max={20} min={-20}
                        decrementButtonClassName="p-button-danger" incrementButtonClassName="p-button-success" 
                        incrementButtonIcon="pi pi-plus" decrementButtonIcon="pi pi-minus" />
                </div>
                <div style={{marginLeft:'5px',textAlign:'center'}}>
                    <Checkbox style={{marginLeft:'5px'}} inputId="allowId" checked={this.whatif.allowLegAdjustment} onChange={(e)=>{
                        this.whatif.allowLegAdjustment= e.checked;
                        this.whatif.IV=0;
                        this.props.callback(this.whatif);
                    }} />
                    <label htmlFor="allowId">Allow  Leg IV Adjustments</label>
                </div>
                <div style={{ width: '10%', marginLeft: '5px' }}>
                    <Button label="Reset" className="p-button-primary smallButton" style={{ height: '28px', width: '60px', marginTop: '-1px' }} onClick={() => {
                        this.setState({
                            price: 50,
                            IV: 50,
                            days: 0,
                            finalPrice: 0,
                            finalIV: 0,
                            finalDays: 0
                        }, () => {
                            this.whatif.days = this.props.passedStateData.latestRefreshDate;
                            this.whatif.price = 0;
                            this.whatif.IV=0;
                            this.whatif.allowLegAdjustment=false;
                            this.props.passedStateData.legEntityList.forEach(p=>p.iv_adjustment=null);  
                            this.props.callback(this.whatif,this.props.passedStateData.legEntityList)
                        });
                    }} />
                </div>
            </div>
        </div>
    }
}