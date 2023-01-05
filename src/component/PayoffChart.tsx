import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { PLCalc } from 'src/utils/PLCalc';
import { OptData, OptHeader, OptLeg, WhatIf } from 'src/entity/OptData';
import { std, mean, range } from 'mathjs';
import { Button } from 'primereact/button';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
interface Props {
    data
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

    constructor(props) {
        super(props);
        this.state = {
            price: 50,
            IV: 50,
            days: 0,
            finalPrice:0,
            finalIV:0,
            finalDays:0
        };
    }

    chartData = () => {
        let optdata: OptData = new OptData();

        // assigning header
        let optheader = new OptHeader();
        optheader.avgiv = this.props.data.avgiv;
        optheader.symbol = this.props.data.selectedsymbol;
        optheader.symbolPrice = this.props.data.spotPrice;
        optheader.dealDate = new Date().toLocaleString();
        optheader.payoffdate = this.props.data.selectedExpiryDate;
        optheader.futuresPrice = this.props.data.futPrice;
        optdata.optheader = optheader;

        let whatif = new WhatIf();
        whatif.price =this.state.finalPrice;// (this.state.price - 50) / 2.5
        whatif.IV = this.state.finalIV;//(this.state.IV - 50) / 2.5;
        whatif.days =this.state.finalDays;// this.state.days / 5;
        optdata.whatif = whatif;

        // assinging option legs
        let optlegs = new Array<OptLeg>();
        for (let opt of this.props.data.strategyEntityList) {
            let optleg = new OptLeg();
            optleg.entryPrice = opt.Option_Price;
            optleg.pcflag = (opt.Buy_Call || opt.Sell_Call) ? 'C' : 'P';
            optleg.expdt = this.props.data.selectedExpiryDate;
            optleg.iv = optleg.pcflag == 'C' ? opt.Call_IV : opt.Put_IV;
            optleg.qty = (optleg.pcflag == 'C' ? opt.Call_Lot : opt.Put_Lot) * this.props.data.lotSize;
            optleg.strikePrice = opt.Strike_Price;
            optleg.tradeType = (opt.Buy_Call || opt.Buy_Put) ? 'B' : 'S';
            optlegs.push(optleg);
        }

        optdata.optlegs = optlegs;

        let result = PLCalc.ComputePayoffData(optdata);


        return result;
    };


    render() {

        let result = this.chartData();

        let arr1 = [];
        let arr2 = [];

        let xAxisData = result[0] as Array<number>;
        let len = xAxisData.length;
        let mean = PLCalc.calcMean(xAxisData);
        let sigma = xAxisData.length > 0 ? std(...xAxisData) : 0;
        let point1 = Math.round(mean - +sigma);
        let point2 = mean - 2 * +sigma;
        console.log(point2)
        for (let i = 0; i < len; i++) {
            let item1 = [];
            let item2 = [];
            item1.push(result[0][i], result[1][i]);
            arr1.push(item1);

            item2.push(result[0][i], result[2][i]);
            arr2.push(item2);
        }

        let options = {
            chart: {
                type: 'spline'
            },
            title: {
                text: this.props.data.selectedsymbol
            },
            yAxis: {
                title: {
                    text: 'Profit/Loss'
                }, plotLines: [{
                    color: '#383838',
                    width: 2,
                    value: 0,
                    zIndex: 2
                }]
            },
            xAxis: {
                max: xAxisData[len - 1],
                min: xAxisData[0],
                gridLineWidth: 1,
                plotLines: [{
                    color: '#B0B0B0',
                    width: 2,
                    value: mean,
                    dashStyle: 'dash',
                    label: {
                        text: mean,
                        y: 100
                    }
                },
                    // {
                    //     width: 1,
                    //     value: point1,
                    //     label: {
                    //         text:point1,
                    //         y:100
                    //     }
                    // },
                    // {
                    //     width: 1,
                    //     value: point2
                    // }
                ]
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'middle'
            },
            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    pointStart: xAxisData[0],
                }
            },
            series: [
                {
                    name: 'On Target',
                    data: arr1,
                    dashStyle: 'dash'
                },
                {
                    name: 'On Expiry',
                    data: arr2,
                    color: 'Green'
                }

            ]
        };


        return <div key={this.props.data.selectedsymbol}>
            <div>
                <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { hight: '100%', width: '100%' } }} />
            </div>
            <div>
                <div >Price ({(this.state.price - 50) / 2.5}%)</div>
                <div > <Slider value={this.state.price} step={2.5} onChange={(e) => this.setState({ price: e })}  onAfterChange={(e)=>{this.setState({finalPrice:(+e - 50) / 2.5})}}/></div>
            </div>
            <br></br>
            <div >
                <div >IV ({(this.state.IV - 50) / 2.5}%)</div>
                <div > <Slider value={this.state.IV} onChange={(e) => this.setState({ IV: e })} step={2.5} onAfterChange={(e)=>{this.setState({finalIV:(+e - 50) / 2.5})}}/></div>
            </div>
            <br></br>
            <div >
                <div >Days ({this.state.days / 5})</div>
                <div > <Slider value={this.state.days} onChange={(e) => this.setState({ days: e })} step={5}  onAfterChange={(e)=>{this.setState({finalIV:(+e) / 5})}} /></div>
            </div>
            <br></br>
            <div>
                <Button label="Reset" className="p-button-secondary smallButton" style={{ width: '60px', right: '0px' }} onClick={() => {
                    this.setState({
                        price: 50,
                        IV: 50,
                        days: 0,
                        finalPrice:0,
                        finalIV:0,
                        finalDays:0
                    })
                }} />
            </div>

        </div>
    }
}