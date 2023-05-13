import React from "react";
import { LegEntity } from "src/entity/LegEntity";
import { max, mean, min } from 'mathjs';
import { PLCalc } from "src/utils/PLCalc";
import axios from "axios";
import { ProfitLoss } from "src/entity/ProfitLoss";
import { Column, DataTable } from "primereact";
import { WhatIf } from "src/entity/OptData";
import { LOV } from "../entity/LOV";
import { color } from "highcharts";
interface Props {
    passedData
}

interface State {
    isBusy: boolean,
    margin: number,
    selectedsymbol
}

export class Qty {
    strikePrice: number;
    netCEQty: number;
    netPEQty: number;
}

export class PLComputeCompoenent extends React.Component<Props, State> {
    passedData
    qtyList: Qty[] = [];
    margin: Number;
    whatif: WhatIf = new WhatIf();
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
        this.passedData=JSON.parse(JSON.stringify(this.props.passedData));

        if (this.passedData == null || this.passedData.legEntityList.length == 0) return null;
        
        this.qtyList = this.totalQty();
        this.marginRequired();
        let data = [];
        //let item: ProfitLoss = new ProfitLoss();
        let item=new LOV();
        
        item['label']="Max Profit"
        item['value'] = this.maxProfit();
           
        data.push(item);
        let item2=new LOV(); 
        item2['label']="Max Loss"
        item2['value'] = this.maxLoss();
        data.push(item2);
     
        let item3=new LOV();     
        item3['label']="Breakeven (Expiry)"
        item3['value'] = this.breakevenExpiry()
        data.push(item3);

        let item4=new LOV();     
        item4['label']="Breakeven (T+0)"
        item4['value'] = this.breakevenT();
        data.push(item4);

        let item5=new LOV();     
        item5['value'] = this.netDebt();
        if(parseFloat(item5['value'])>0){
             item5['label']="Net Debit"
        } else {
            item5['label']="Net Credit"
        }
        data.push(item5);

        let item6=new LOV();     
        item6['label']="Margin Rquired"
        item6['value'] = this.state.margin > 0 ? "₹ " + this.state.margin : null;
        data.push(item6);

        let item7=new LOV();     
        item7['label']="Funds Rquired"
        item7['value'] = this.state.margin > 0 ? "₹ " + this.fundRequired() : null;
        data.push(item7);

        let item8=new LOV();     
        item8['label']="Current Projected P/L"
        item8['value'] = this.totalPL();
        data.push(item8);

        // item.maxLoss = this.maxLoss();
        // item.breakevenExpiry = this.breakevenExpiry();
        // item.breakevenT0 = this.breakevenT();
        // item.netDebit = this.netDebt();
        // item.marginRquired = this.state.margin > 0 ? "₹ " + this.state.margin : null;
        // item.fundsRequired = this.state.margin > 0 ? "₹ " + this.fundRequired() : null;

        // item.projectedPL = this.totalPL();
     
        return (
            <div className="p-card" id="computePLList" key={'computePL_' + this.props.passedData.selectedsymbol} >
                <DataTable value={data} responsiveLayout="scroll" >
                    <Column field="label" align="left"></Column>
                    <Column field="value" align="right"></Column>
                    {/* <Column field="breakevenExpiry" header='Breakeven (Expiry)' align="center"></Column>
                    <Column field="breakevenT0" header='Breakeven (T+0)' align="center"></Column>
                    <Column field="netDebit" header='Net Debit' align="center" ></Column>
                    <Column field="marginRquired" header='Margin Rquired' align="center"></Column>
                    <Column field="fundsRequired" header='Funds Rquired' align="center"></Column>
                    <Column field="projectedPL" header='Current Projected P/L' align="center"></Column> */}
                </DataTable>
            </div>
        )
    }


    netDebtTemplate = (rowData: ProfitLoss) => {
        // if(Number.parseFloat(rowData.netDebit.replace("₹",''))<0)

    }

    maxProfit = () => {
         if (this.state == null || this.qtyList == null) return null;

         let netCE=0;  
         let netPE=0     
         this.qtyList.forEach(p => netCE += p.netCEQty);
         this.qtyList.forEach(p => netPE += p.netPEQty);
 
         if(netCE>0 || netPE>0)     
             return "Undefined";
        

        let chartData = this.passedData.chartData;

        if (chartData != null) {
            let max = Math.max(...chartData[2]);

            return "₹ " + max.toFixed(2);
        } else {
            return null;
        }

    }

    maxLoss = () => {
        if (this.state == null || this.qtyList == null) return null;

        let netCE=0;  
        let netPE=0     
        this.qtyList.forEach(p => netCE += p.netCEQty);
        this.qtyList.forEach(p => netPE += p.netPEQty);

        if(netCE<0 || netPE<0)     
            return "Undefined";
      
        let chartData = this.passedData.chartData;

        if (chartData != null) {
            let min = Math.min(...chartData[2]);

            return "₹ " + min.toFixed(2);
        } else {
            return null;
        }
    }

    RR = () => {
        if (this.maxLoss() != '-Undefined-' && this.maxProfit() != '-Undefined-' && this.maxLoss() != null && this.maxProfit() != null) {
            return +this.maxProfit() / +this.maxLoss();
        }
        return null;
    }

    breakevenExpiry = () => {

        if (this.passedData == null || this.passedData.chartData == null
            || this.passedData.legEntityList == null || this.passedData.legEntityList.length == 0) return null;

        let dataX = this.passedData.chartData[0];
        let dataY = this.passedData.chartData[2];

        if (dataY == null || dataY.length == 0) return null;

        let closestY = PLCalc.findClosest(dataY, 0);
        let closestIndex = dataY.indexOf(closestY);
        let closestX = dataX[closestIndex];

        if (dataY.length > 0) {
            let minY = min(...dataY);
             let minYIndex = dataY.indexOf(minY);
            let step: number = 50;

            if (minYIndex - step > 0 && minYIndex + step < dataX.length && dataY[minYIndex - step] > minY && dataY[minYIndex + step] > minY) {
                dataY.splice(closestIndex, 1);
                let closestYSecond = PLCalc.findClosest(dataY, 0);
                let closestIndexSecond = dataY.indexOf(closestYSecond);
                let closestXSecond = dataX[closestIndexSecond];

                if (closestX > closestXSecond)
                    return "₹ " + closestXSecond.toFixed(2) + " / ₹ " + closestX.toFixed(2);
                else
                    return "₹ " + closestX.toFixed(2) + " / ₹ " + closestXSecond.toFixed(2);
            }
            let maxY = max(...dataY);
            let maxYIndex = dataY.indexOf(maxY);
            if (maxYIndex - step > 0 && maxYIndex + step < dataX.length && dataY[maxYIndex - step] < maxY && dataY[maxYIndex + step] < maxY) {
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

        return "₹ " + closestX.toFixed(2);

    }

    breakevenT = () => {

        if (this.passedData == null || this.passedData.chartData == null
            || this.passedData.legEntityList == null || this.passedData.legEntityList.length == 0) return null;

        let dataX = this.passedData.chartData[0];
        let dataY = this.passedData.chartData[1];

        let closestY = PLCalc.findClosest(dataY, 0);
        let closestIndex = dataY.indexOf(closestY);
        let closestX = dataX[closestIndex];
        let step: number = 200;
        if (dataY.length > 0) {
            // console.log(dataY)
            let minY = min(...dataY);
            let minYIndex = dataY.indexOf(minY);
            if (minYIndex - step > 0 && minYIndex + step < dataX.length && dataY[minYIndex - step] > minY && dataY[minYIndex + step] > minY) {
                dataY.splice(closestIndex, 1);

                let closestYSecond = PLCalc.findClosest(dataY, 0);
                let closestIndexSecond = dataY.indexOf(closestYSecond);
                let closestXSecond = dataX[closestIndexSecond];

                if (closestX > closestXSecond)
                    return "₹ " + closestXSecond.toFixed(2) + " / ₹ " + closestX.toFixed(2);
                else
                    return "₹ " + closestX.toFixed(2) + " / ₹ " + closestXSecond.toFixed(2);
            }

            let maxY = max(...dataY);
            let maxYIndex = dataY.indexOf(maxY);
            if (maxYIndex - step > 0 && maxYIndex + step < dataX.length && dataY[maxYIndex - step] < maxY && dataY[maxYIndex + step] < maxY) {
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

        if (closestX)
            return "₹ " + closestX.toFixed(2);

        return null;
    }

    netDebt = () => {
        let data = this.props.passedData;
        let legList = data.legEntityList;
        if (legList == null || legList.length == 0) return null;

        let shortLotList = legList.filter(p => p.Buy_Sell == 'S');
        let totalShort = 0
        shortLotList.forEach(element => {
            totalShort += element.Position_Lot * element.Entry_Price;
        });

        let longLotList = legList.filter(p => p.Buy_Sell == 'B');
        let totalLong = 0
        longLotList.forEach(element => {
            totalLong += element.Position_Lot * element.Entry_Price;
        });


        let totalShortPremium = data.lotSize * totalShort;
        let totalLongPremium = data.lotSize * totalLong;

        if (totalShortPremium - totalLongPremium == 0)
            return null;

        return "₹ " + (totalLongPremium - totalShortPremium).toFixed(2);
    }

    totalPL2 = (): string => {
        let data = this.props.passedData;
        let legList = data.legEntityList.filter(p => p.exited != true);
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

        return "₹ " + (curPL * this.props.passedData?.lotSize).toFixed(2);
    }

    totalPL = (): string => {
        if (this.passedData && this.passedData.chartData) {
            //     let t0Data = this.passedData.chartData[0];
            //     let t1Data=this.passedData.chartData[1]
            //     let closest = PLCalc.findClosest(t0Data, this.passedData.fairPrice);
            //  //   console.log(closest);
            //     let inx = t0Data.indexOf(closest);
            //      console.log(t1Data)
            //   console.log(inx);
            // let val=t1Data[inx];
            //     console.log(val)
            //  let pl = val.toFixed(2);
            let total = 0;
            let legList = this.passedData.legEntityList;
            legList.forEach(element => {
                // console.log(element);
                total += element.Current_PL;
            });
            return "₹ " + total.toFixed(2);
        }

        return null;
    }

    marginRequired = async () => {
        if (this.passedData == null) return null;
        let posList = [];
        this.passedData.legEntityList.forEach(element => {
            let pos = {
                "prd": "M",
                "exch": "NFO",
                "symname": this.passedData.selectedsymbol,
                "instname": 'OPTIDX',
                "exd": this.passedData.selectedExpiryDate.substring(0, 2) + "-" + this.passedData.selectedExpiryDate.substring(2, 5) + "-20" + this.passedData.selectedExpiryDate.substring(5),
                "netqty": (element.Buy_Sell == 'S' ? -element.Position_Lot * this.passedData.lotSize : (element.Position_Lot * this.passedData.lotSize)).toString(),
                "lotSize": this.passedData.lotSize,
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
            if (dataReturned == 0) {
                return 0;
            }

            let margin: number = +Number.parseFloat(dataReturned.expo_trade) + Number.parseFloat(dataReturned.span_trade);

            if (margin != null && this.state.margin !== margin) {
                this.setState({ margin: margin })
            }

            return margin.toFixed(2);
        }

        )

        return 0

    }

    fundRequired = () => {
        return (this.state.margin?.valueOf() + +this.allBuyLegs()).toFixed(2)
    };

    allBuyLegs = () => {
        let total = 0;
        this.passedData.legEntityList.filter(p => p.Buy_Sell == 'B').forEach(p => {
            total += +p.Option_Price;
        });

        return total;
    }
}