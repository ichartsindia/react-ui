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
    callback: any;
}

interface State {
    price;
    IV;
    days;
    finalPrice;
    finalIV;
    finalDays;
}

export class PayoffChart extends React.Component<Props, State> {
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

    // chartData = () => {
       
    //     if (this.props.data==null || this.props.data.legEntityList == null || (this.props.data && this.props.data.legEntityList!=null && this.props.data.legEntityList==0)) return null;

    //     let optdata: OptData = new OptData();
    //     // console.log(this.props.data)

    //     // assigning header
    //     let optheader = new OptHeader();
    //     optheader.avgiv = this.props.data.avgiv;
    //     optheader.symbol = this.props.data.selectedsymbol;
    //     optheader.symbolPrice = this.props.data.spotPrice;
    //     optheader.dealDate = new Date().toLocaleString();
    //     optheader.payoffdate = this.props.data.selectedExpiryDate;
    //     optheader.futuresPrice = this.props.data.futPrice;
    //     optdata.optheader = optheader;

    //     let whatif = new WhatIf();
    //     whatif.price = this.state.finalPrice;
    //     whatif.IV = this.state.finalIV;
    //     whatif.days = this.state.finalDays;
    //     optdata.whatif = whatif;

    //     // assinging option legs
    //     let optlegs = new Array<OptLeg>();
    //     for (let opt of this.props.data.legEntityList) {
    //         let optleg: OptLeg = new OptLeg();
    //         optleg.entryPrice = Number.parseFloat((opt.Option_Price).toString().replace(',', ''));
    //         optleg.pcflag = opt.CE_PE == 'CE' ? 'C' : 'P';
    //         optleg.expdt = this.props.data.selectedExpiryDate;
    //         optleg.iv = opt.IV;
    //         optleg.qty = opt.Position_Lot * this.props.data.lotSize;
    //         optleg.strikePrice = opt.Strike_Price;
    //         optleg.tradeType = opt.Buy_Sell == 'Buy' ? 'B' : 'S';
    //         optleg.futuresPrice = this.props.data.futPrice;
    //         optlegs.push(optleg);
    //     }

    //     optdata.optlegs = optlegs;

    //     let result = PLCalc.ComputePayoffData(optdata);
    //     return result;
    // };


    render() {

    
        if (this.props.data == null) return null;

        let arr1 = [];
        let arr2 = [];

        let xAxisData = this.props.data[0] as Array<number>;
        let len = xAxisData.length;

        // let mean = PLCalc.calcMean(xAxisData);
        // let sigma = xAxisData.length > 0 ? std(...xAxisData) : 0;

        // let point2 = mean - 2 * +sigma;

        let sd = this.props.data[3]["sd"];

        let fairPrice = this.props.data.fairPrice;
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
                height: window.outerHeight - 320,       
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

                plotLines: [{
                    color: '#231F20',
                    fillOpacity: 0.2,
                    lineWidth: 1.5,
                    dashStyle: 'shortdot',
                    value: fairPrice,
                    label: {
                        text: fairPrice,
                        rotation: 0,
                        x: -30,
                        y: -5,
                        style: {
                            fontSize: '11.5px',
                            color: '#606060'
                        }
                    },
                    zIndex: 1000
                }],
            
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
            // yAxis: {
            //     title: {
            //         text: 'Profit/Loss'
            //     }, plotLines: [{
            //         color: 'green',
            //         width: 1,
            //         value: 0,
            //         zIndex: 2
            //     }]
            // },




            // xAxis: {
            //     gridLineWidth: 1,
            //     plotBands: [{
            //         from: leftSigma2,
            //         to: leftSigma1,
            //         color: 'rgba(197, 210, 200,0.1)',
            //         width: 1,
            //     },
            //     {
            //         from: leftSigma1,
            //         to: rightSigma1,
            //         color: 'rgba(135, 138, 135, 0.1)',
            //         width: 1,
            //     }, {
            //         from: leftSigma1,
            //         to: rightSigma2,
            //         color: 'rgba(197, 210, 200,0.1)',
            //         width: 1,
            //     }],

            //     plotLines: [{
            //         color: '#B0B0B0',
            //         width: 2,
            //         value: fairPrice,
            //         dashStyle: 'dash',
            //         label: {
            //             text: fairPrice,
            //             rotation: 0,
            //             textAlign: 'center',
            //             verticalAlign: 'top',
            //             y: -10
            //         }
            //     },

            //     {
            //         width: 0,
            //         value: leftSigma1,
            //         label: {
            //             text: '-1σ',
            //             rotation: 0,
            //             textAlign: 'center',
            //             verticalAlign: 'top',
            //             y: -10
            //         }
            //     },
            //     {
            //         width: 0,
            //         value: leftSigma2,
            //         label: {
            //             text: '-2σ',
            //             rotation: 0,
            //             textAlign: 'center',
            //             verticalAlign: 'top',
            //             y: -10
            //         }
            //     },
            //     {
            //         width: 0,
            //         value: rightSigma1,
            //         label: {
            //             text: '+1σ',
            //             rotation: 0,
            //             textAlign: 'center',
            //             verticalAlign: 'top',
            //             y: -10
            //         }
            //     },
            //     {
            //         width: 0,
            //         value: rightSigma2,
            //         label: {
            //             text: '+2σ',
            //             rotation: 0,
            //             textAlign: 'center',
            //             verticalAlign: 'top',
            //             y: -10
            //         }
            //     },
            //         // {
            //         //     width: 1,
            //         //     value: mean,
            //         //     label: {
            //         //         rotation:0,
            //         //         textAlign:'center',
            //         //         verticalAlign: 'top',
            //         //         y:-10
            //         //    }
            //         // }
            //     ]
            // },

            // plotOptions: {
            //     series: {
            //         fillOpacity: 0.1,
            //         pointStart: xAxisData[0],
            //         animation: false,
            //         states: { hover: { enabled: false } }, 
            //     }
            // },
            // series: [
            //    {
            //         type: 'line',
            //         name: 'On Target',
            //         width: 1.5,
            //         data: arr1,
            //         dashStyle: 'shortdot',
            //         color:'rgb(0,0,255)',
            //     },
            //     {
            //         type: 'area',
            //         name: 'On Expiry',
            //         data: arr2,
            //         zones:
            //             [{
            //                 value: -0.01,
            //                 color: 'rgba(255,127,127)'
            //             }, {
            //                 color: 'rgba(50,205,50)'
            //             }],
            //     },
            // ]
        };


        return <div key={'payoffChart_' + this.props.selectedsymbol}>
            <div>
                <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { hight: '100%', width: '100%' } }} />
            </div>
            <div>
                <div >Price ({(this.state.price - 50) / 2.5}%)</div>
                <div > <Slider value={this.state.price} step={2.5} onChange={(e) => {this.whatif.price=(+e - 50) / 2.5; this.props.callback(this.whatif); this.setState({ price: e })}} onAfterChange={(e) => { this.setState({ finalPrice: (+e - 50) / 2.5 }) }} /></div>
            </div>
            <br></br>
            <div >
                <div >IV ({(this.state.IV - 50) / 2.5}%)</div>
                <div > <Slider value={this.state.IV} onChange={(e) => {this.whatif.IV=(+e - 50) / 2.5; this.props.callback(this.whatif);this.setState({ IV: e })}} step={2.5} onAfterChange={(e) => { this.setState({ finalIV: (+e - 50) / 2.5 }) }} /></div>
            </div>
            <br></br>
            <div >
                <div >Days ({this.state.days / 5})</div>
                <div > <Slider value={this.state.days} onChange={(e) => {this.whatif.days=(+e)/5;this.props.callback(this.whatif);this.setState({ days: e })}} step={5} onAfterChange={(e) => { this.setState({ finalIV: (+e) / 5 }) }} /></div>
            </div>
            <br></br>
            <div>
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
    }
}