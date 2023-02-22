import React from 'react';
import Highcharts, { color } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartMore from 'highcharts/highcharts-more'
import { PLCalc } from 'src/utils/PLCalc';
import { OptData, OptHeader, OptLeg, WhatIf } from 'src/entity/OptData';
import { Button } from 'primereact/button';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { LegEntity } from 'src/entity/LegEntity';
import * as math from 'mathjs';
HighchartMore(Highcharts)
interface Props {
    data;
    selectedsymbol:string;
    expiryDate:string;
    callback: any;
    fairPrice:number;
    callbackShow,
    chainShowed:boolean
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
            finalDays: 0
        };

        this.whatif.IV=0;
        this.whatif.days=0;
        this.whatif.price=0;
    }

    render() {   
        if (this.props.data == null) return null;

        let arr1 = [];
        let arr2 = [];

        let xAxisData = this.props.data[0] as Array<number>;
        let len = xAxisData.length;

        let sd = this.props.data[3]["sd"];

        let fairPrice:number = this.props.fairPrice;
        let mean = len == 0 ? 0 : math.mean(xAxisData);
        let leftSigma1 = Math.round(mean - +sd);
        let leftSigma2 = Math.round(mean - 2 * +sd);
        let rightSigma1 = Math.round(mean + +sd);
        let rightSigma2 = Math.round(mean + 2 * sd);

        for (let i = 0; i < len; i++) {
            let item1 = [];
            let item2 = [];
            item1.push(this.props.data[0][i], this.props.data[1][i]);
            arr1.push(item1);

            item2.push(this.props.data[0][i], this.props.data[2][i]);
            arr2.push(item2);
        }


        let options = {
            chart: {
                zoomType: 'xy',
                height: 400,       
            },

             title: { 
                text: this.props.selectedsymbol,
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
                        text:'+2σ',
                        // x: 100,
                        y: -18,
                        align: 'right',
        
                        style: {
                            color: '#606060'
                        }
                    }
                }],
                plotLines: [{
                    color: '#231F20',
                    fillOpacity: 0.2,
                     lineWidth: 3,
                     dashStyle: 'shortdot',
                    zIndex: 3,
                     value: fairPrice,
                     label: {
                         text: fairPrice?.toString(),
                         rotation: 0,
                         x: -30,
                         y: -18,
                         style: {
                             fontSize: '11.5px',
                             color: '#606060'
                         }
                     },
                  }],
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
                 color:'rgb(0,0,255)',
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
                negativeColor:  'rgb(255,127,127)',
                color:'rgb(50,205,50)',
                data: arr2,
                connectNulls: true,
                lineWidth: 1.5,
                marker: {
                    enabled: false
                }
            },
        ]
            
        };


        return <div key={'payoffChart_' + this.props.selectedsymbol+ this.props.expiryDate}>
               <div style={{ display:this.props.chainShowed?'none':'flex'}} className='alignedLeft' >Option Chain<img src='/show_left.svg' onClick={this.props.callbackShow}></img></div>    
            <div>
                <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { hight: '100%', width: '100%' } }} />
            </div>
            <div className='flex' style={{width:'100%'}}>
                <div style={{width:'30%', marginRight:'5px'}}>
                <div style={{textAlign:'center'}} >Price ({(this.state.price - 50) / 2.5}%)</div>
                <div > <Slider value={this.state.price} step={2.5} onChange={(e) => {this.whatif.price=(+e - 50) / 2.5; this.props.callback(this.whatif); this.setState({ price: e })}} onAfterChange={(e) => { this.setState({ finalPrice: (+e - 50) / 2.5 }) }} /></div>
            </div>
            <br></br>
            <div style={{width:'30%', marginRight:'5px'}}>
                <div style={{textAlign:'center'}}>IV ({(this.state.IV - 50) / 2.5}%)</div>
                <div > <Slider value={this.state.IV} onChange={(e) => {this.whatif.IV=(+e - 50) / 2.5; this.props.callback(this.whatif);this.setState({ IV: e })}} step={2.5} onAfterChange={(e) => { this.setState({ finalIV: (+e - 50) / 2.5 }) }} /></div>
            </div>
            <br></br>
            <div style={{width:'30%',marginLeft:'2px', marginRight:'5px'}}>
                <div style={{textAlign:'center'}}>Days ({this.state.days / 5})</div>
                <div> <Slider value={this.state.days} onChange={(e) => {this.whatif.days=(+e)/5;this.props.callback(this.whatif);this.setState({ days: e })}} step={5} onAfterChange={(e) => { this.setState({ finalIV: (+e) / 5 }) }} /></div>
            </div>     
           
       
            <div style={{width:'10%', marginLeft:'5px'}}>
                <Button label="Reset" className="p-button-secondary smallButton" style={{ width: '60px', right: '0px' }} onClick={() => {
                    this.setState({
                        price: 50,
                        IV: 50,
                        days: 0,
                        finalPrice: 0,
                        finalIV: 0,
                        finalDays: 0
                    },()=> { this.whatif.IV=0;
                        this.whatif.days=0;
                        this.whatif.price=0;
                        this.props.callback(this.whatif)});
                }} />
            </div>
 </div>
        </div>
    }
}