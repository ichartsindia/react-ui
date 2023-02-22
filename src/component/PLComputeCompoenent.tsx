import React from "react";
import { LegEntity } from "src/entity/LegEntity";
import { mean, min } from 'mathjs';
import { PLCalc } from "src/utils/PLCalc";
import axios from "axios";
import { ProfitLoss } from "src/entity/ProfitLoss";
import { Column, DataTable } from "primereact";
interface Props {
    passedData
}

interface State {
    isBusy: boolean,
    margin: Number,
    selectedsymbol
}

export class Qty {
    strikePrice: number;
    netCEQty: number;
    netPEQty: number;
}

export class PLComputeCompoenent extends React.Component<Props, State> {
    qtyList: Qty[] = [];
    margin: Number;
    constructor(props) {
        super(props);

        this.state = {
            isBusy: false,
            margin: null,
            selectedsymbol: this.props.passedData.selectedsymbol
        }

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

            if (leg.CE_PE == 'CE' && leg.Buy_Sell == 'B') {
                netCEQty += leg.Position_Lot
            }

            if (leg.CE_PE == 'CE' && leg.Buy_Sell == 'S') {
                netCEQty -= leg.Position_Lot
            }

            if (leg.CE_PE == 'PE' && leg.Buy_Sell == 'B') {
                netPEQty += leg.Position_Lot
            }

            if (leg.CE_PE == 'PE' && leg.Buy_Sell == 'S') {
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

        if (this.props.passedData == null || this.props.passedData.legEntityList.length == 0) return null;

        this.qtyList = this.totalQty();
        this.marginRequired();
        let data: ProfitLoss[] = [];
        let item: ProfitLoss = new ProfitLoss();
        item.maxProfit = this.maxProfit();
        item.maxLoss = this.maxLoss();
        item.breakevenExpiry = this.breakevenExpiry();
        item.breakevenT0 = this.breakevenT();
        item.netDebit = this.netDebt();
        item.marginRquired = this.state.margin>0?"₹ " + this.state.margin:null;
        item.fundsRequired = this.state.margin>0?"₹ " + this.fundRequired():null;
       
        item.projectedPL = this.totalPL();
        data.push(item);

        return (
            <div className="p-card" id="computePLList" key={'computePL_' + this.props.passedData.selectedsymbol}>
                <DataTable value={data} responsiveLayout="scroll" >
                    <Column field="maxProfit" header='Max Profit' align="center"></Column>
                    <Column field="maxLoss" header='Max Loss' align="center"></Column>
                    <Column field="breakevenExpiry" header='Breakeven (Expiry)' align="center"></Column>
                    <Column field="breakevenT0" header='Breakeven (T+0)' align="center"></Column>
                    <Column field="netDebit" header='Net Debit' align="center" ></Column>
                    <Column field="marginRquired" header='Margin Rquired' align="center"></Column>
                    <Column field="fundsRequired" header='Funds Rquired' align="center"></Column>
                    <Column field="projectedPL" header='Current Projected P/L' align="center"></Column>
                </DataTable>
            </div>
               )
            }
 

            // <div key={'strategyCalculation_' + this.state.selectedsymbol}>
            //     <div className='flex flex-space-between'>
            //         <div>Max Profit</div>
            //         <div>{this.maxProfit()}</div>
            //     </div>
            //     <div className='flex flex-space-between'>
            //         <div>Max Loss</div>
            //         <div style={{ color: "red" }}>{this.maxLoss()}</div>
            //     </div>
            //     <div className='flex flex-space-between'>
            //         <div>Max Reward/Risk Ratio</div>
            //         <div>{this.RR()}</div>
            //     </div>
            //     <div className='flex flex-space-between'>
            //         <div>Breakevens (Expiry)</div>
            //         <div>{this.breakevenExpiry()}</div>
            //     </div>
            //     <div className='flex flex-space-between'>
            //         <div>Breakevens (T+0)</div>
            //         <div>{this.breakevenT()}</div>
            //     </div>
            //     <div className='flex flex-space-between'>
            //         <div>Net Debit</div>
            //         <div style={{ color: this.netDebt() != null && Number.parseFloat(this.netDebt().replace("₹", "")) < 0 ? 'red' : 'black' }}>{this.netDebt()}</div>
            //     </div>
            //     <div className='flex flex-space-between'>
            //         <div>Margin Required</div>
            //         <div>{this.state.margin == null ? null : "₹ " + this.state.margin.toFixed(2)}</div>
            //     </div>
            //     <div className='flex flex-space-between'>
            //         <div>Funds Required</div>
            //         <div>{this.state.margin == null ? null : "₹ " + (this.state.margin.valueOf() + +this.allBuyLegs()).toFixed(2)}</div>
            //     </div>
            //     <div className='flex flex-space-between'>
            //         <div>Current Projected P/L</div>
            //         <div style={{ color: this.totalPL() != null && Number.parseFloat(this.totalPL().replace("₹", "")) < 0 ? 'red' : 'black' }}>{this.totalPL()}</div>
            //     </div>
            // </div>
      
     
    netDebtTemplate = (rowData: ProfitLoss) => {
        // if(Number.parseFloat(rowData.netDebit.replace("₹",''))<0)

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
            return "Undefined";

        if (this.qtyList.filter(p => p.netPEQty < 0 && p.netCEQty >= 0).length > 0)
            return "Undefined";

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

        let dataX = this.props.passedData.chartData[0];
        let dataY = this.props.passedData.chartData[2];

        if (dataY == null || dataY.length == 0) return null;

        let closestY = PLCalc.findClosest(dataY, 0);
        let closestIndex = dataY.indexOf(closestY);
        let closestX = dataX[closestIndex];
        if (dataY.length > 0) {
            let minY = min(...dataY);
            let minYIndex = dataY.indexOf(minY);
            // console.log("minY", minY);
            // console.log("dataY[minYIndex - 50]",dataY[minYIndex - 10]);
            // console.log("dataY[minYIndex + 50]",dataY[minYIndex + 50]);
            let step:number=200;

            if (minYIndex - step > 0 && minYIndex + step < dataX.length && dataY[minYIndex - step] > minY && dataY[minYIndex +step] > minY) {
                dataY.splice(closestIndex, 1);
                let closestYSecond = PLCalc.findClosest(dataY, 0);
                let closestIndexSecond = dataY.indexOf(closestYSecond);
                let closestXSecond = dataX[closestIndexSecond];

                if (closestX > closestXSecond)
                    return "₹ " + closestXSecond.toFixed(2) + " / ₹ " + closestX.toFixed(2);
                else
                    return "₹ " + closestX.toFixed(2) + " / ₹ " + closestXSecond.toFixed(2);
            }
        }

        return "₹ " + closestX;

    }

    breakevenT = () => {

        if (this.props.passedData == null || this.props.passedData.chartData == null
            || this.props.passedData.legEntityList == null || this.props.passedData.legEntityList.length == 0) return null;

        let dataX = this.props.passedData.chartData[0];
        let dataY = this.props.passedData.chartData[1];

        let closestY = PLCalc.findClosest(dataY, 0);
        let closestIndex = dataY.indexOf(closestY);
        let closestX = dataX[closestIndex];

        if (dataY.length > 0) {
            let minY = min(...dataY);
            let minYIndex = dataY.indexOf(minY);
            if (minYIndex - 50 > 0 && minYIndex + 50 < dataX.length && dataY[minYIndex - 50] > minY && dataY[minYIndex + 50] > minY) {
                dataY.splice(closestIndex, 1);

                let closestYSecond = PLCalc.findClosest(dataY, 0);
                let closestIndexSecond = dataY.indexOf(closestYSecond);
                let closestXSecond = dataX[closestIndexSecond];

                if (closestX > closestXSecond)
                    return "₹ " + closestXSecond.toFixed(2) + " / ₹ " + closestX.toFixed(2);
                else
                    return "₹ " + closestX.toFixed(2) + " / ₹ " + closestXSecond.toFixed(2);
            }
        }


        return "₹ " + closestX;
    }

    netDebt = () => {
        let data = this.props.passedData;
        let legList = data.legEntityList;
        if (legList == null || legList.length == 0) return null;

        let shortLotList = legList.filter(p => p.Buy_Sell == 'S');
        let totalShort = 0
        shortLotList.forEach(element => {
            totalShort += element.Position_Lot * element.Option_Price;
        });

        let longLotList = legList.filter(p => p.Buy_Sell == 'B');
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
        legList.filter(p => p.Buy_Sell == 'B' && p.CE_PE == 'CE').forEach(p => {
            if (isNaN(p.Option_Price) == false) {
                let optionPrice = Number.parseFloat(p.Option_Price.toString().replace(",", ""));
                if (p.Strike_Price > data.fairPrice) {
                    curPL += (-optionPrice) * p.Position_Lot;
                } else {
                    curPL += ((data.fairPrice - p.Strike_Price) * data.lotSize - optionPrice) * p.Position_Lot;
                }
            }
        });

        legList.filter(p => p.Buy_Sell == 'S' && p.CE_PE == 'CE').forEach(p => {
            if (isNaN(p.Option_Price) == false) {
                let optionPrice = Number.parseFloat(p.Option_Price.toString().replace(",", ""));
                if (p.Strike_Price > data.fairPrice) {
                    curPL += optionPrice * p.Position_Lot;
                } else {
                    curPL += (optionPrice + p.Strike_Price - data.fairPrice) * data.lotSize * p.Position_Lot;
                }
            }
        });

        legList.filter(p => p.Buy_Sell == 'B' && p.CE_PE == 'PE').forEach(p => {
            if (isNaN(p.Option_Price) == false) {
                let optionPrice = Number.parseFloat(p.Option_Price.toString().replace(",", ""));
                if (p.Strike_Price > data.fairPrice)
                    curPL += (p.Strike_Price - +p.Option_Price - data.fairPrice) * data.lotSize * p.Position_Lot;
                else
                    curPL += -optionPrice * p.Position_Lot;
            }
        });

        legList.filter(p => p.Buy_Sell == 'S' && p.CE_PE == 'PE').forEach(p => {
            if (isNaN(p.Option_Price) == false) {
                let optionPrice = Number.parseFloat(p.Option_Price.toString().replace(",", ""));
                if (p.Strike_Price <= data.fairPrice) {
                    curPL += optionPrice * p.Position_Lot
                } else {
                    curPL += ((data.fairPrice - p.Strike_Price) * data.lotSize + optionPrice) * p.Position_Lot;
                }
            }

        });

        if (curPL == 0)
            return null;

        return "₹ " + curPL.toFixed(2);
    }

    marginRequired = async () => {
        if (this.props.passedData == null) return null;
        let posList = [];
        this.props.passedData.legEntityList.forEach(element => {
            let pos = {
                "prd": "M",
                "exch": "NFO",
                "symname": this.props.passedData.selectedsymbol,
                "instname": 'OPTIDX',
                "exd": this.props.passedData.selectedExpiryDate.substring(0, 2) + "-" + this.props.passedData.selectedExpiryDate.substring(2, 5) + "-20" + this.props.passedData.selectedExpiryDate.substring(5),
                "netqty": (element.Buy_Sell == 'S' ? -element.Position_Lot * this.props.passedData.lotSize : (element.Position_Lot * this.props.passedData.lotSize)).toString(),
                "lotSize": this.props.passedData.lotSize,
                "optt": element.CE_PE,
                "strprc": element.Strike_Price
            }

            posList.push(pos);
        });

        let formData = new FormData();

        formData.append("margindata", JSON.stringify({ "pos": posList, "actid": 'DUMMY' }));
        const headers = {
            "Content-Type": "multipart/form-data"
        };

        let url = "https://www.icharts.in/opt/api/getMarginData_Api.php";

        axios.post(url, formData, {
            headers: headers
        }).then(response => {
            let dataReturned = response.data;
            if (dataReturned == 0){
                return 0;
            }
                
            let margin: Number = +Number.parseFloat(dataReturned.expo_trade) + Number.parseFloat(dataReturned.span_trade);

            if (margin != null && this.state.margin !== margin) {
                this.setState({ margin: margin })
            }

            return margin;
        }

        )

        return 0

    }

    fundRequired = () => {
        return (this.state.margin?.valueOf() + +this.allBuyLegs()).toFixed(2)
    };

    allBuyLegs = () => {
        let total = 0;
        this.props.passedData.legEntityList.filter(p => p.Buy_Sell == 'B').forEach(p => {
            total += +p.Option_Price;
        });

        return total;
    }
}