import { Button, Column, DataTable, Dropdown, InputNumber, InputText, TabPanel, TabView } from "primereact";
import React from "react";
import { LegEntity } from "../entity/LegEntity";

import { Utility } from "../utils/Utility";
import bs from 'black-scholes';
import { Greeks } from "../entity/Greeks";


interface Props {
  passedData,
  callback,
  callbackExpiryChange
}

interface State {
  exit: number
  reminder: number ;
  entryPrice: { [key: string]: string; } 
}

export class LegComponent extends React.Component<Props, State> {
   P = 0.2316419;
	 B1 = 0.319381530;
	 B2 = -0.356563782;
	 B3 = 1.781477937;
	 B4 = -1.821255978;
	 B5 = 1.330274429;

  greeks;
  fairPrice
  previouslegEntityList;
 expiryList

  constructor(props) {
    super(props);

    this.state = {
      exit: null,
      reminder: null,
      entryPrice :{}
    }
  this.expiryList=this.props.passedData
  }

 

  componentDidUpdate(prevProps, prevState) {
    if(this.props.passedData.expiryDateList!=null){
      this.expiryList=this.props.passedData.expiryDateList.slice(0, 4).map(p=>p.expiry_dates);
    }
    this.previouslegEntityList = prevProps.passedData.legEntityList
  }

  render() {
  if(this.props.passedData==null) return null;
    this.greeks = this.generateGreeks();
    let clone = JSON.parse(JSON.stringify(this.props.passedData.fairPrice));
    this.fairPrice = clone;
    return (
      <TabView width>
        <TabPanel header="Legs">
          <div id="selectedLegList" key={'Legs_' + this.props.passedData.selectedsymbol}>
            <DataTable className='legList'  value={this.props.passedData.legEntityList} responsiveLayout="scroll">
              <Column body={this.buttonTemplate}></Column>
              {/* <Column body={this.maxLoss} align="center" header="Max Loss"></Column> */}
              <Column body={this.plusTemplate} align="center" ></Column>
              <Column body={this.lotTemplate} header="Lots" align="center"></Column>
              <Column body={this.minusTemplate} align="center" ></Column>
              <Column body={this.expiryTemplate} header='Expiry' align="center"></Column>
              <Column body={this.strikeTemplate} header='Strike' align="center"></Column>
              <Column body={this.entryPriceTemplate} header='Entry Price' align="center"></Column>
              <Column body={this.currentPriceTemplate} header='Current Price' align="center"></Column>
              {/* <Column field="Option_Price" header='Current Price' align="center"></Column> */}
              <Column body={this.legPLTemplate} align="center" header="Current P/L"></Column>
              <Column body={this.ivTemplate} header='IV' align="center"></Column>
              <Column body={this.deleteTemplate} header="Action"></Column>
            </DataTable>
          </div>
        </TabPanel>
        <TabPanel header="Greeks">
          <div key={'greeks_' + this.props.passedData.selectedsymbol}>
            <DataTable value={this.greeks} responsiveLayout="scroll" >
              <Column field='lots' align="center" header='Lots'></Column>
              <Column field='strikePrice' align="center" header='Strike'></Column>
              <Column field="CE_PE" header='Type' align="center"></Column>
              <Column field='expiry' align="center" header='Expiry'></Column>
              <Column field='iv' align="center" header='IV'></Column>
              <Column field='delta' align="center" header='Delta'></Column>
              <Column field='gamma' align="center" header="Gamma"></Column>
              <Column field='theta' align="center" header="Theta"></Column>
              <Column field='vega' align="center" header="Vega"></Column>
            </DataTable>
          </div>
        </TabPanel>
      </TabView>
    )
  }

 //#region templates
  legPLTemplate = (rowData: LegEntity) => {
    if (this.props.passedData.chartData == null) return null;

//     let clone = JSON.parse(JSON.stringify(this.props.passedData));
// console.log(clone)
//     // let optionPrice = parseFloat(rowData.Option_Price);
//     let key = rowData.CE_PE + this.props.passedData.selectedExpiryDate + rowData.Strike_Price;
//     let optionPrice = parseFloat(this.state.entryPrice[key]);
// console.log(this.state.entryPrice)
//     let records = clone.records;
//     console.log(rowData)
//     if(records==null) return null;

//     //#region non-exited
//     let chainCEList = records.filter(rec => rec.Strike_Price == rowData.Strike_Price && rowData.CE_PE == 'CE' && rowData.exited==null);
// console.log(chainCEList)
//     //this is CALL
//     if (chainCEList != null && chainCEList.length > 0) {
//       let chainCE = chainCEList[0];
//       //SELL
//       if (chainCE.Sell_Call != null && chainCE.Sell_Call == true) {
//         rowData.Current_PL = (optionPrice - parseFloat(chainCE.Call_LTP)) * this.props.passedData.lotSize * rowData.Position_Lot
//    //     return "₹ " + (rowData.Current_PL).toFixed(2);
//       }
//       //BUY
//       if (chainCE.Buy_Call != null && chainCE.Buy_Call == true) {
//         rowData.Current_PL = (parseFloat(chainCE.Call_LTP) - optionPrice) * this.props.passedData.lotSize * rowData.Position_Lot
//     //    return "₹ " + (rowData.Current_PL).toFixed(2);
//       }

     
//     }

//     let chainPEList = records.filter(rec => rec.Strike_Price == rowData.Strike_Price && rowData.CE_PE == 'PE' && rowData.exited==null);

//     if (chainPEList != null && chainPEList.length > 0) {
//       let chainPE = chainPEList[0];
//       //SELL
//       if (chainPE.Sell_Put != null && chainPE.Sell_Put == true) {
//         rowData.Current_PL = (optionPrice - parseFloat(chainPE.Put_LTP)) * this.props.passedData.lotSize * rowData.Position_Lot;
//     //    return "₹ " + (rowData.Current_PL).toFixed(2);
//       }
//       //BUY
//       if (chainPE.Buy_Put != null && chainPE.Buy_Put == true) {
//         rowData.Current_PL = (parseFloat(chainPE.Put_LTP) - optionPrice) * this.props.passedData.lotSize * rowData.Position_Lot
       
//       }}
// //#endregion

// //#region exited

let optionPrice = (rowData.exited==true? rowData.Exit_Price: rowData.Entry_Price);

  //SELL
  if(rowData.CE_PE=='PE'){
    if(rowData.Buy_Sell=='S')
    rowData.Current_PL = (optionPrice - parseFloat(rowData.Option_Price)) * this.props.passedData.lotSize * rowData.Position_Lot
  //BUY
  if(rowData.Buy_Sell=='B')
    rowData.Current_PL =  (parseFloat(rowData.Option_Price) - optionPrice)* this.props.passedData.lotSize * rowData.Position_Lot
  }
  
  //SELL
  if(rowData.CE_PE=='CE'){
    if(rowData.Buy_Sell=='B')
    rowData.Current_PL = (optionPrice - parseFloat(rowData.Option_Price)) * this.props.passedData.lotSize * rowData.Position_Lot
  //BUY
  if(rowData.Buy_Sell=='S')
    rowData.Current_PL =  (parseFloat(rowData.Option_Price) - optionPrice)* this.props.passedData.lotSize * rowData.Position_Lot
  }
  //  this.props.callback(this.props.passedData.legEntityList);
    //#endregion
      if (rowData.Current_PL > 0)
        return <div style={{ color: 'green' }}>{"₹ " + (rowData.Current_PL).toFixed(2)}</div>
      else if (rowData.Current_PL < 0)
        return <div style={{ color: 'red' }}>{"₹ " + (rowData.Current_PL).toFixed(2)}</div>
      else {
        return "₹ 0.00";
      }
     
    // return null;
  }

  strikeTemplate = (rowData: LegEntity) => {
    if (rowData.CE_PE=='FU') {
      return 'Futures';//rowData.Strike_Price;
    } else {
      return rowData.Strike_Price;
    }
  }

  ivTemplate = (rowData: LegEntity) => {
    if(rowData.CE_PE=='FU')
      return null;

    return <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'space-evenly', marginBottom: '2px' }}>
      <div>{rowData.IV}</div>
      <div style={{ visibility:rowData.exited?'hidden':'visible',marginRight: '5px' }}><InputNumber disabled={(!this.props.passedData.whatif?.allowLegAdjustment) || rowData.exited==true} className='smallText' max={20} min={-20} style={{ width: '65px', height: '24px', fontSize: 'smaller' }} value={rowData.iv_adjustment}
        onChange={(e) => {
          rowData.iv_adjustment = e.value;
          this.props.callback(this.props.passedData.legEntityList);
        }} showButtons suffix="%" /></div>
    </div>
  }

  expiryTemplate = (rowData: LegEntity) => {
    if (rowData.exited == null) {
      if (rowData.CE_PE == 'FU') {
        return rowData.Expiry;
      }
      else {
        return <div className='leglot-dropdown'>
          <Dropdown id="expiryDropdown" value={rowData.Expiry} onChange={(e) => {
            rowData.Expiry = e.value;
            // this.props.callback();
            this.props.callbackExpiryChange(rowData, this.props.passedData.legEntityList);
          }} options={this.expiryList} />
        </div>
      }

      // return 
    } else {
      return null
    }
  }

  lotTemplate = (rowData: LegEntity) => {
    if (rowData.Buy_Sell == 'S') {
      return "-" + rowData.Position_Lot + "x" + this.props.passedData.lotSize + rowData.CE_PE;
    } else {
      return "+" + rowData.Position_Lot + "x" + this.props.passedData.lotSize + rowData.CE_PE;
    }
  }

  buttonTemplate = (rowData: LegEntity) => {
    if (rowData.Buy_Sell == 'B') {
      return <div style={{width:'20px'}}>
        <button className='selected-button-buy' onClick={(e)=>{
          rowData.Buy_Sell='S';
          this.props.callback(this.props.passedData.legEntityList);
        }}>B</button>
      </div>
    }
    if (rowData.Buy_Sell == 'S') {
      return <div>
        <button className='selected-button-sell' onClick={(e)=>{
            rowData.Buy_Sell='B';
            this.props.callback(this.props.passedData.legEntityList);
        }}>S</button>
      </div>

    }

    return null;
  }

  plusTemplate = (rowData: LegEntity) => {
    if(rowData.exited==true){
      return null;
    }
    return <i className="pi pi-plus" style={{ color: 'slateblue', fontSize: 'smaller', width:'10px', cursor: 'pointer', marginRight: '-5px' }} 
    onClick={(e) => {
        rowData.Entry_Price=this.newPrice(rowData,'plus');
        rowData.Position_Lot = +rowData.Position_Lot + 1;
        if (rowData.Position_Lot > 0)
          this.props.callback(this.props.passedData.legEntityList);
      }
    }></i>
  }

  newPrice = (rowData, direction) => {
    let clone = JSON.parse(JSON.stringify(this.previouslegEntityList));
    let legs = clone.filter((leg) => leg.CE_PE == rowData.CE_PE && leg.Strike_Price - rowData.Strike_Price == 0);
    let previousLeg;
    if (legs.length > 0) {
      previousLeg = legs[0];

      let previousPrice = previousLeg.Entry_Price;

      let previousTotalAmount = parseFloat(previousPrice) * parseFloat(previousLeg.Position_Lot);
      let totalAmout;
      let totalLeg; 
      if(direction=='plus'){
        totalAmout= +previousTotalAmount + +rowData.Option_Price;
        totalLeg = +previousLeg.Position_Lot + 1;
      } else {
        totalAmout = +previousTotalAmount - +rowData.Option_Price;
        totalLeg= +previousLeg.Position_Lot - 1;
      }

      return parseFloat((totalAmout / totalLeg).toFixed(2));
    } 

    return null;
  }

  minusTemplate = (rowData: LegEntity) => {
    if(rowData.exited==true){
      return null;
    }

    if (rowData.Position_Lot == 1)
      return null;
    return <i className="pi pi-minus" style={{ color: 'slateblue', fontSize: 'smaller', cursor: 'pointer' }} onClick={(e) => {
      rowData.Entry_Price=this.newPrice(rowData,'minus');
      rowData.Position_Lot = +rowData.Position_Lot - 1;
      if (rowData.Position_Lot > 0)
        this.props.callback(this.props.passedData.legEntityList);
    }
    }></i>
  }

  currentPriceTemplate = (rowData: LegEntity) => {
    if(rowData.exited==true){
      if(rowData.Exit_Price==null){
        rowData.Exit_Price=parseFloat(parseFloat(rowData.Option_Price).toFixed(2));
      }

      return (
        <InputText value={parseFloat(rowData.Exit_Price.toFixed(2))} style={{ textAlign: 'right', fontSize: 'small', height: '22px', width: '80px'}}
          onChange={(event) => {
            rowData.Exit_Price = parseFloat(event.target.value);
             this.props.callback(this.props.passedData.legEntityList);
          }} ></InputText>
      )
    } else {
      return rowData.Option_Price;
    }
 }

  entryPriceTemplate = (rowData: LegEntity) => {
    let key = rowData.CE_PE + this.props.passedData.selectedExpiryDate + rowData.Strike_Price;
    if(rowData.Entry_Price==null){
      rowData.Entry_Price=parseFloat(rowData.Option_Price);
       this.props.callback(this.props.passedData.legEntityList);
    }
    return (
      <div className='leglot-dropdown'>
        <InputNumber disabled={rowData.exited} minFractionDigits={2} maxFractionDigits={2}
        value={parseFloat(rowData.Entry_Price.toString()).toFixed(2)} 
        style={{ textAlign: 'right', fontSize: 'small', height: '22px', width: '80px', }}
        onChange={(event) => {
           rowData.Entry_Price = Number(event.value);//==null? "": parseFloat(event.value);
          this.state.entryPrice[key] = event.value;
          console.log(this.props.passedData.legEntityList);
          this.props.callback(this.props.passedData.legEntityList);
        }} ></InputNumber>
      </div>
      
    )
  }

  deleteTemplate = (rowData: LegEntity) => {
    let lotList = [];

    for (let i = 0; i < rowData.Position_Lot; i++) {
      lotList.push(i + 1);
    }
    rowData.Position_Lot = Number.parseInt(rowData.Position_Lot.toString());
    return <div className='flex'>
      <div className='leglot-dropdown' style={{ display: rowData.exited == true ? 'none' : 'block' }}>
        <Dropdown id="legLotDropdown" value={rowData.Position_Lot} onChange={(e) => {
          let exitVal = e.value;
          let selectedVal = e.value;
          let reminder = rowData.Position_Lot - e.value;
          this.setState({
            exit: exitVal,
            reminder: reminder
          });
          rowData.Position_Lot = selectedVal;
          //  this.props.callback(this.props.passedData.legEntityList); 
        }} options={lotList} />
      </div>
      <div style={{ display: rowData.exited == true ? 'block' : 'none', width: '61px', marginLeft: '4px', marginTop: '2px' }}>
        <label>{rowData.Position_Lot}</label>
      </div>
      <div>
        <img src={rowData.exited ? './re_open.svg' : './exit.svg'} style={{ verticalAlign: 'center', marginTop: '4px', cursor: 'pointer' }} title={rowData.exited ? 'Re-open the exited leg' : 'Exit'}
          onClick={() => {
            if (!rowData.exited) {
              if (this.state.exit != null) {
                let leg = new LegEntity();
                leg.Buy_Sell = rowData.Buy_Sell;
                leg.CE_PE = rowData.CE_PE;
                leg.IV = rowData.IV;
                leg.Option_Price = rowData.Option_Price;
                leg.Strike_Price = rowData.Strike_Price;
                leg.Entry_Price=rowData.Entry_Price;
                leg.Exit_Price=rowData.Entry_Price;
                leg.Position_Lot = this.state.exit == null ? rowData.Position_Lot : this.state.exit;
                leg.exited = true;
                rowData.Position_Lot = this.state.reminder;

                this.props.passedData.legEntityList.push(leg);
              } else {
                rowData.exited = true;
              }
            } else {

              let previousLeg = this.props.passedData.legEntityList.filter(p => p.Option_Price == rowData.Option_Price && p.Strike_Price == rowData.Strike_Price && p.exited != true);

              if (previousLeg.length == 0) {
                rowData.exited = false;
              } else {
                previousLeg[0].Position_Lot = previousLeg[0].Position_Lot + rowData.Position_Lot;
                let partialLegIndex = this.props.passedData.legEntityList.indexOf(p => p.Strike_Price == rowData.Option_Price && p.Option_Price == rowData.Option_Price && p.exited == true);
                this.props.passedData.legEntityList.splice(partialLegIndex, 1);
              }

            }
            this.setState({
              exit: null,
              reminder: null
            });
            let list = this.props.passedData.legEntityList;
            this.props.callback(list);
          }}></img>
      </div>
      <div>
        <Button icon="pi pi-trash" className='p-button-text' style={{ height: '20px' }}
          onClick={() => {
            console.log(this.props.passedData.legEntityList)
            let list = this.props.passedData.legEntityList;
            const index = list.indexOf(rowData, 0);
            if (index > -1) {
              list.splice(index, 1);
            }
            let key = rowData.CE_PE + this.props.passedData.selectedExpiryDate + rowData.Strike_Price;
            // this.entryPrice[key] = null;
            let newList = list.filter(p => !(p.Strike_Price == rowData.Strike_Price && p.CE_PE == rowData.CE_PE && p.Expiry== rowData.Expiry));
            this.props.callback(newList);
            // this.setState({ legEntityList: list });
            // this.convertLegToOptionChain();
          }}></Button>
      </div>
    </div>
  }
  //#endregion

  d1;
  sd1;
  nd1;
  d2;
  nd2;

  generateGreeks = () => {

    let greeksList = [];

    let T = Utility.yearElapse(this.props.passedData.selectedExpiryDate);

    let legs = this.props.passedData.legEntityList.filter(p => p.exited != true);

    let S =this.props.passedData.fairPrice;
    for (let leg of legs) {
      let K=leg.Strike_Price;
      let iv=leg.IV/100; 
      this.d1=this.calcD1(S,K,0,T,iv);
      this.d2=this.calcD2(S,K,0,T,iv);
      this.sd1=this.standardNormalDistribution(this.d1);
      this.nd1=bs.stdNormCDF(this.d1);
      this.nd2=bs.stdNormCDF(this.d2);
     // let iv = PLCalc.getImpliedVolatility(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, leg.Option_Price, leg.CE_PE);
 
      let greeks = new Greeks();
      greeks.lots = leg.Position_Lot;
      greeks.iv = leg.IV; //this.roundTo(iv);
      greeks.expiry = this.props.passedData.selectedExpiryDate;
      greeks.strikePrice = leg.Strike_Price;
      greeks.CE_PE = leg.CE_PE;
      let delta = this.roundTo(this.nd1);

      greeks.delta = leg.CE_PE == 'CE' ? delta : this.roundTo(Number(delta) - 1);

      greeks.gamma = this.callLegGamma(S, K, 0, T, iv);

      greeks.theta = this.callLegTheta(S, K, 0, T, iv, leg.CE_PE);

      greeks.vega = this.callLegVega(S, K, 0, T, iv);

      greeksList.push(greeks);
    }

    return greeksList;
  }

  calcIV = (S, K, r, T, v) => {
    let totalIV = 0;
    var iv = require("implied-volatility");
 
    let legs = this.props.passedData.legEntityList.filter(p => p.exited != true);
    for (let leg of legs) {
      let sigma=  iv.getImpliedVolatility(S, K, T, 0, leg.Option_Price, leg.CE_PE); 
      totalIV += sigma;
    }

    return (100 * totalIV).toFixed(4);
  }

 

  callLegGamma = (S, K, r, T, v) => {
   
    let gamma = this.sd1 / (S * v * Math.sqrt(T));

    return this.roundTo(gamma);
  }

  callLegTheta = (S, K, r, T, v, type) => {
     
    let theta = -(S * this.sd1 * v) / (2 * Math.sqrt(T))/365;

    if (type == 'CE'){
      theta = theta - r * K * this.nd2;
    }
    else{
      theta = theta + r * K * bs.stdNormCDF(-this.d2);
    }
      

    return this.roundTo(theta);
  }

  callLegVega = (S, K, r, T, v) => {
    let vega = S * Math.sqrt(T) * this.sd1;
    return this.roundTo(vega/100);
  }

  calcD1 = (S, K, r, T, v) => {
    let d1 = (Math.log(S / K) + (r + Math.pow(v, 2) / 2.0) * T) / (v * Math.sqrt(T));
  
    return d1;
  }

  calcD2 = (S, K, r, T, v) => {
    let d2 = this.d1 - v * Math.sqrt(T);

    return d2;
  }

  roundTo = (num: number) => {
    if (Math.abs(num) > 1) {
      return num.toFixed(2);
    }

    if (Math.abs(num) < 1 && Math.abs(num) >= 0.1) {
      return num.toFixed(2)
    }

    return num.toFixed(4);
  }

  cumulativeDistribution(x,  sdx) {

		let t = 1 / (1 + this.P * Math.abs(x));
		let t1 = this.B1 * Math.pow(t, 1);
		let t2 = this.B2 * Math.pow(t, 2);
		let t3 = this.B3 * Math.pow(t, 3);
		let t4 = this.B4 * Math.pow(t, 4);
		let t5 = this.B5 * Math.pow(t, 5);
		let b = +t1 + +t2 + +t3 + +t4 + +t5;
		let cd = 1 - sdx * b;

		return x < 0 ? 1 - cd : cd;
	}

  standardNormalDistribution(x) {
		let top = Math.exp(-0.5 * Math.pow(x, 2));
		let bottom = Math.sqrt(2 * Math.PI);

		return top / bottom;
  }
}