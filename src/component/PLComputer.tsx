import React from "react";
import { LegEntity } from "src/entity/LegEntity";
import { OptionChain } from "src/entity/OptionChain";
import { StockSymbol } from "src/entity/StockSymbol";
import { mean, min } from 'mathjs';
import { PLCalc } from "src/utils/PLCalc";
import axios from "axios";
interface Props {
    passedData
}

interface State {
    isBusy: boolean
}

export class Qty {
    strikePrice: number;
    netCEQty: number;
    netPEQty: number;
}

export class PLComputer extends React.Component<Props, State> {
    qtyList: Qty[] = [];
    constructor(props) {
        super(props);

        this.state = {
           isBusy: false
        }
        console.log(props.passedData)
    }

    totalQty = () => {
        if (this.props.passedData == null) return null;

        let legList: Array<LegEntity> = this.props.passedData.legEntityList;
        if (legList.length == 0) return null;

        let qtyList = [];
        let netCEQty = 0;
        let netPEQty = 0;
        let sortedLegList = legList.sort((a, b) => a.Strike_Price - b.Strike_Price)
        let strikePrice = sortedLegList[0].Strike_Price;
        for (let i = 0; i < sortedLegList.length; i++) {
            let leg = sortedLegList[i];
            if (strikePrice != leg.Strike_Price) {
                let qty = new Qty();
                qty.netCEQty = netCEQty;
                qty.netPEQty = netPEQty;
                qty.strikePrice = strikePrice;
                qtyList.push(qty);
                netCEQty = 0;
                netPEQty = 0;
            }

            if (leg.CE_PE == 'CE' && leg.Buy_Sell == 'Buy') {
                netCEQty += leg.Position_Lot
            }

            if (leg.CE_PE == 'CE' && leg.Buy_Sell == 'Sell') {
                netCEQty -= leg.Position_Lot
            }

            if (leg.CE_PE == 'PE' && leg.Buy_Sell == 'Buy') {
                netPEQty += leg.Position_Lot
            }

            if (leg.CE_PE == 'PE' && leg.Buy_Sell == 'Sell') {
                netPEQty -= leg.Position_Lot
            }
            strikePrice = leg.Strike_Price;

            if (i == sortedLegList.length - 1) {
                let qty = new Qty();
                qty.netCEQty = netCEQty;
                qty.netPEQty = netPEQty;
                qty.strikePrice = strikePrice;
                qtyList.push(qty);
            }
        }

        return qtyList;
    }

    render() {
         
        if(this.props.passedData==null ||this.props.passedData.legEntityList == undefined) return null;

        this.qtyList = this.totalQty();

        return (
            <div key={'strategyCalculation_' + this.props.passedData.selectedsymbol}>
                <div className='flex flex-space-between'>
                    <div>Max Profit</div>
                    <div>{this.maxProfit()}</div>
                </div>
                <div className='flex flex-space-between'>
                    <div>Max Loss</div>
                    <div style={{ color: "red" }}>{this.maxLoss()}</div>
                </div>
                <div className='flex flex-space-between'>
                    <div>Max Reward/Risk Ratio</div>
                    <div>{this.RR()}</div>
                </div>
                <div className='flex flex-space-between'>
                    <div>Breakevens (Expiry)</div>
                    <div>{this.breakevenExpiry()}</div>
                </div>
                <div className='flex flex-space-between'>
                    <div>Breakevens (T+0)</div>
                    <div>{this.breakevenT()}</div>
                </div>
                <div className='flex flex-space-between'>
                    <div>Net Debit</div>
                    <div style={{ color: this.netDebt() != null && Number.parseFloat(this.netDebt().replace("₹", "")) < 0 ? 'red' : 'black' }}>{this.netDebt()}</div>
                </div>
                <div className='flex flex-space-between'>
                    <div>Margin Required</div>
                    <div>{this.marginRequired()}</div>
                </div>
                <div className='flex flex-space-between'>
                    <div>Funds Required</div>
                    <div></div>
                </div>
                <div className='flex flex-space-between'>
                    <div>Current Projected P/L</div>
                    <div style={{ color: this.totalPL() != null && Number.parseFloat(this.totalPL().replace("₹", "")) < 0 ? 'red' : 'black' }}>{this.totalPL()}</div>
                </div>
            </div>
        )
    }

    maxProfit = () => {
        if (this.state == null || this.qtyList == null) return null;

        if (this.qtyList.filter(p => p.netCEQty > 0).length > 0)
            return "- Undefined -";

        if (this.qtyList.filter(p => p.netPEQty > 0 && p.netCEQty <= 0).length > 0)
            return "- Undefined -";

        let chartData = this.props.passedData.chartData;

        if (chartData != null) {
            let max = "₹ " + Math.max(...chartData[2]);

            return max;
        } else {
            return null;
        }

    }

    maxLoss = () => {
        if (this.state == null || this.qtyList == null) return null;

        if (this.qtyList.filter(p => p.netCEQty < 0).length > 0)
            return "- Undefined -";

        if (this.qtyList.filter(p => p.netPEQty < 0 && p.netCEQty >= 0).length > 0)
            return "- Undefined -";

        let chartData = this.props.passedData.chartData;

        if (chartData != null) {
            let min = Math.min(...chartData[2]);

            return "₹ " + min.toFixed(2);
        } else {
            return null;
        }
    }

    RR = () => {
        if (this.maxLoss() != '- Undefined -' && this.maxProfit() != '- Undefined -' && this.maxLoss() != null && this.maxProfit() != null) {
            return +this.maxProfit() / +this.maxLoss();
        }
        return null;
    }

    breakevenExpiry = () => {

        if (this.props.passedData == null || this.props.passedData.chartData == null
            || this.props.passedData.legEntityList == null || this.props.passedData.legEntityList.length == 0) return null;

        // let legList: Array<LegEntity> = this.props.passedData.legEntityList;

        // console.log(legList);
        // if(legList.length==0) return null;

        // let sortedLegList = legList.sort((a, b) => a.Strike_Price - b.Strike_Price)
        // let BEP=0;
        // let len=legList.length;
        // for (let i = 0; i <len ; i++) {
        //     let leg = sortedLegList[i];

        //     if (leg.CE_PE == 'CE') {
        //        BEP+=+leg.Strike_Price + +leg.Option_Price;
        //     }

        //     if (leg.CE_PE == 'PE') {
        //         BEP+=+leg.Strike_Price - +leg.Option_Price;
        //     }
        // }

        // return "₹ " + (BEP/len).toFixed(2);


        let dataX = this.props.passedData.chartData[0];
        let dataY = this.props.passedData.chartData[2];

        if (dataY == null || dataY.length == 0) return null;

        let closestY = PLCalc.findClosest(dataY, 0);
        console.log(closestY);
        let closestIndex = dataY.indexOf(closestY);
        let closestX = dataX[closestIndex];

        let minY = min(...dataY);
        let minYIndex = dataY.indexOf(minY);

        if (dataY[minYIndex - 1] >= minY && dataY[minYIndex + 1] >= minY) {
            dataY.splice(closestIndex, 1);
            let closestYSecond = PLCalc.findClosest(dataY, 0);
            let closestIndexSecond = dataY.indexOf(closestYSecond);
            let closestXSecond = dataX[closestIndexSecond];

            if (closestX > closestXSecond)
                return "₹ " + closestXSecond + "/" + closestX;
            else
                return "₹ " + closestX + "/" + closestXSecond;
        }

        return "₹ " + closestX;

    }

    breakevenT = () => {

        if (this.props.passedData == null || this.props.passedData.chartData == null
            || this.props.passedData.legEntityList == null || this.props.passedData.legEntityList.length == 0) return null;

        let dataX = this.props.passedData.chartData[0];
        let dataY = this.props.passedData.chartData[1];

        let closestY = PLCalc.findClosest(dataY, 0);
        console.log(closestY);
        let closestIndex = dataY.indexOf(closestY);
        let closestX = dataX[closestIndex];


        let minY = min(...dataY);
        let minYIndex = dataY.indexOf(minY);
        console.log(minY);
        console.log(dataY[minYIndex - 1]);
        console.log(dataY[minYIndex + 1])
        if (dataY[minYIndex - 1] >= minY && dataY[minYIndex + 1] >= minY) {
            dataY.splice(closestIndex, 1);

            let closestYSecond = PLCalc.findClosest(dataY, 0);
            let closestIndexSecond = dataY.indexOf(closestYSecond);
            let closestXSecond = dataX[closestIndexSecond];

            if (closestX > closestXSecond)
                return "₹ " + closestXSecond + "/" + closestX;
            else
                return "₹ " + closestX + "/" + closestXSecond;
        }

        return "₹ " + closestX;
    }

    netDebt = () => {
        let data = this.props.passedData;
        let legList = data.legEntityList;
        if (legList == null || legList.length == 0) return null;

        let shortLotList = legList.filter(p => p.Buy_Sell == 'Sell');
        let totalShort = 0
        shortLotList.forEach(element => {
            totalShort += element.Position_Lot * element.Option_Price;
        });

        let longLotList = legList.filter(p => p.Buy_Sell == 'Buy');
        let totalLong = 0
        longLotList.forEach(element => {
            totalLong += element.Position_Lot * element.Option_Price;
        });


        let totalShortPremium = data.lotSize * totalShort;
        let totalLongPremium = data.lotSize * totalLong;

        if (totalShortPremium - totalLongPremium == 0)
            return null;

        return "₹ " + (totalShortPremium - totalLongPremium).toFixed(2);
    }

    totalPL = (): string => {
        let data = this.props.passedData;
        let legList = data.legEntityList;
        if (legList == null || legList.length == 0) return null;

        let curPL = 0;
        legList.filter(p => p.Buy_Sell == 'Buy' && p.CE_PE == 'CE').forEach(p => {
            let optionPrice = Number.parseFloat(p.Option_Price.replace(",", ""));
            if (p.Strike_Price > data.fairPrice) {
                curPL += (-p.Option_Price) * p.Position_Lot;
            } else {
                curPL += ((data.fairPrice - p.Strike_Price) * data.lotSize - p.Option_Price) * p.Position_Lot;
            }

        });

        legList.filter(p => p.Buy_Sell == 'Sell' && p.CE_PE == 'CE').forEach(p => {
            let optionPrice = Number.parseFloat(p.Option_Price.replace(",", ""));
            if (p.Strike_Price > data.fairPrice) {
                curPL += optionPrice * p.Position_Lot;
            } else {
                curPL += (optionPrice + p.Strike_Price - data.fairPrice) * data.lotSize * p.Position_Lot;
            }
        });

        legList.filter(p => p.Buy_Sell == 'Buy' && p.CE_PE == 'PE').forEach(p => {
            let optionPrice = Number.parseFloat(p.Option_Price.replace(",", ""));
            if (p.Strike_Price > data.fairPrice)
                curPL += (p.Strike_Price - +p.Option_Price - data.fairPrice) * data.lotSize * p.Position_Lot;
            else
                curPL += -optionPrice * p.Position_Lot;
        });

        legList.filter(p => p.Buy_Sell == 'Sell' && p.CE_PE == 'PE').forEach(p => {
            let optionPrice = Number.parseFloat(p.Option_Price.replace(",", ""));
            if (p.Strike_Price <= data.fairPrice) {
                curPL += optionPrice * p.Position_Lot
            } else {
                curPL += ((data.fairPrice - p.Strike_Price) * data.lotSize + optionPrice) * p.Position_Lot;
            }
        });

        if (curPL == 0)
            return null;

        return "₹ " + curPL.toFixed(2);
    }

    marginRequired = () => {
       
        if (this.props.passedData == null || this.props.passedData.selectedExpiryDate == null 
            || this.props.passedData.legEntityList == null || this.props.passedData.legEntityList == undefined 
            || this.props.passedData.legEntityList.length == 0 || this.props.passedData.selectedExpiryDate == null)
            return null;

        console.log(this.props.passedData.selectedExpiryDate);
        // console.log(passedData.selectedExpiryDate.substring(0, 2) + "-" + passedData.selectedExpiryDate.substring(2, 5) + "-20" + passedData.selectedExpiryDate.substring(5))
        console.log(this.props.passedData.legEntityList);
        let posList = [];
        this.props.passedData.legEntityList.forEach(element => {
            let pos = {
                "prd": "M",
                "exch": "NFO",
                "symname": this.props.passedData.selectedsymbol,
                "instname": 'OPTSTK',
                "exd": this.props.passedData.selectedExpiryDate.substring(0, 2) + "-" + this.props.passedData.selectedExpiryDate.substring(2, 5) + "-20" + this.props.passedData.selectedExpiryDate.substring(5),
                "netqty": element.Buy_Sell == 'Buy' ? element.Position_Lot : -element.Position_Lot,
                "lotSize": this.props.passedData.lotSize,
                "optt": element.CE_PE,
                "strprc": element.Strike_Price
            }

            posList.push(pos);
        });

        console.log(posList);
        let margindata = { "pos": posList, "actid": 'DUMMY' };
        let url = "https://www.icharts.in/opt/api/getMarginData_Api.php";
        // this.setState({ isBusy: true })
        axios.post(url, margindata, { withCredentials: false })
            .then(response => {
                let data = response.data;
                console.log(data);
            }).catch(err => {

            });

        return 0;
    }
}