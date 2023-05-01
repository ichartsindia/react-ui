import { Button, Column, DataTable, Dropdown, InputNumber, InputText, TabPanel, TabView } from "primereact";
import React from "react";
import { LegEntity } from "src/entity/LegEntity";
import { PLCalc } from "src/utils/PLCalc";
import { Utility } from "../utils/Utility";
import bs from 'black-scholes';
import { Greeks } from "src/entity/Greeks";
import { WhatIf } from "src/entity/OptData";
import { LegPL } from "src/entity/LegPL";


interface Props {
  passedData,
  callback
}

interface State {
  exit: number
  reminder: number
}

export class LegComponent extends React.Component<Props, State> {
  greeks;
  fairPrice
  previouslegEntityList;
  constructor(props) {
    super(props);

    this.state = {
      exit: null,
      reminder: null
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.previouslegEntityList = prevProps.passedData.legEntityList;
  }

  render() {
    
    this.greeks = this.generateGreeks();
    let clone = JSON.parse(JSON.stringify(this.props.passedData.fairPrice));
    this.fairPrice =clone ;
    return (
      <TabView>
        <TabPanel header="Legs">
          <div className="p-card" id="selectedLegList" key={'Legs_' + this.props.passedData.selectedsymbol}>
            <DataTable value={this.props.passedData.legEntityList} responsiveLayout="scroll" >
              <Column body={this.buttonTemplate} align="center" ></Column>         
              {/* <Column body={this.maxLoss} align="center" header="Max Loss"></Column> */}
              <Column body={this.plusTemplate} align="center" ></Column>
              <Column body={this.lotTemplate} header="Lots" align="center"></Column>
              <Column body={this.minusTemplate} align="center" ></Column>
              <Column body={this.expiryTemplate} header='Expiry' align="center"></Column>
                <Column body={this.strikeTemplate} header='Strike' align="center"></Column>
              <Column body={this.optionPriceTemplate} header='Entry Price' align="center"></Column>
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

  legPLTemplate = (rowData: LegEntity): string => {
    if (this.props.passedData.chartData == null) return null;

    let clone =JSON.parse(JSON.stringify(this.props.passedData));
    let legPLList = clone.chartData[4] as LegPL[];
    let key = rowData.CE_PE + rowData.Strike_Price.toString();
    let legPL = legPLList.filter(element => element.LegKey == key)[0];
    
    if(legPL==null) return null;

    let closest = PLCalc.findClosest(clone.chartData[0], this.fairPrice);
    //console.log(closest);
    let inx = clone.chartData[0].indexOf(closest);
    let val=legPL.LegData[inx];
    let pl = val.toFixed(2);
    return "₹ " + pl;

  }

  //#region templates
  strikeTemplate = (rowData: LegEntity) => {
    if (rowData.exited) {
      return rowData.Strike_Price;
    } else {
      return rowData.Strike_Price;
    }
  }

  ivTemplate = (rowData: LegEntity) => {

    return <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'space-evenly', marginBottom: '3px' }}>
      <div>{rowData.IV}</div>
      <div style={{ marginRight: '5px' }}><InputNumber disabled={!this.props.passedData.whatif?.allowLegAdjustment} className='smallText' max={20} min={-20} style={{ width: '65px', height: '24px', fontSize: 'smaller' }} value={rowData.iv_adjustment}
        onChange={(e) => {
          rowData.iv_adjustment = e.value;
          this.props.callback(this.props.passedData.legEntityList);
        }} showButtons suffix="%" /></div>
    </div>
  }

  expiryTemplate = (rowData: LegEntity) => {
    if (rowData.exited == null) {
      return this.props.passedData.selectedExpiryDate
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
           return <div style={{width:'15px'}}>
    <button className='selected-button-buy'>B</button>
      </div>
    }
    if (rowData.Buy_Sell == 'S') {
       return  <div style={{width:'15px'}}>
         <button className='selected-button-sell'>S</button>
      </div>
     
    }

    return null;
  }

  plusTemplate = (rowData: LegEntity) => {
    return <i className="pi pi-plus" style={{ color: 'slateblue', fontSize: 'smaller', cursor: 'pointer', marginRight:'-5px' }} onClick={(e) => {
      // rowData.Option_Price = (rowData.Option_Price * rowData.Position_Lot + rowData.Call_LTP) / (rowData.Call_Lot + 1);
      let clone = JSON.parse(JSON.stringify(this.previouslegEntityList));
      let foundPreviousRow = clone.filter(row => row.Strike_Price == rowData.Strike_Price && row.CE_PE == rowData.CE_PE)[0];
      let previousTotalAmount = parseFloat(foundPreviousRow.Option_Price) * parseFloat(foundPreviousRow.Position_Lot) * this.props.passedData.lotSize;
      let totalAmout = previousTotalAmount + parseFloat(rowData.Option_Price) * this.props.passedData.lotSize;
      let totalLeg = foundPreviousRow.Position_Lot + 1;
      rowData.Option_Price = parseFloat((totalAmout / totalLeg / this.props.passedData.lotSize).toFixed(2)).toFixed(2);
      rowData.Position_Lot = +rowData.Position_Lot + 1;
      if (rowData.Position_Lot > 0)
        this.props.callback(this.props.passedData.legEntityList);
    }
    }></i>
  }

  minusTemplate = (rowData: LegEntity) => {
    if (rowData.Position_Lot == 1)
      return null;
    return <i className="pi pi-minus" style={{ color: 'slateblue', fontSize: 'smaller', cursor: 'pointer' }} onClick={(e) => {
      let clone = JSON.parse(JSON.stringify(this.previouslegEntityList));
      let foundPreviousRow = clone.filter(row => row.Strike_Price == rowData.Strike_Price && row.CE_PE == rowData.CE_PE)[0];
      let previousTotalAmount = parseFloat(foundPreviousRow.Option_Price) * parseFloat(foundPreviousRow.Position_Lot) * this.props.passedData.lotSize;
      let totalAmout = previousTotalAmount - parseFloat(rowData.Option_Price) * this.props.passedData.lotSize;
      let totalLeg = foundPreviousRow.Position_Lot - 1;
      rowData.Option_Price = parseFloat((totalAmout / totalLeg / this.props.passedData.lotSize).toFixed(2)).toFixed(2);
      rowData.Position_Lot = +rowData.Position_Lot - 1;
      if (rowData.Position_Lot > 0)
        this.props.callback(this.props.passedData.legEntityList);
    }
    }></i>
  }

  optionPriceTemplate = (rowData: LegEntity) => {
    return (
      <InputText value={parseFloat(rowData.Option_Price).toFixed(2)} style={{ textAlign: 'right', fontSize: 'small', height: '22px', width: '80px' }}
        onChange={(event) => {
          rowData.Option_Price = event.target.value;
          if (rowData.Option_Price)
            this.props.callback(this.props.passedData.legEntityList);
        }} ></InputText>
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
            let list = this.props.passedData.legEntityList;
            console.log(list);
            console.log(rowData);
            const index = list.indexOf(rowData, 0);
            if (index > -1) {
              list.splice(index, 1);
            }

            let newList = list.filter(p => !(p.Strike_Price == rowData.Strike_Price && p.CE_PE == rowData.CE_PE));
            this.props.callback(newList);
            // this.setState({ legEntityList: list });
            // this.convertLegToOptionChain();
          }}></Button>
      </div>
    </div>
  }
  //#endregion

  generateGreeks = () => {

    let greeksList = [];

    let T = Utility.yearElapse(this.props.passedData.selectedExpiryDate);

    let legs = this.props.passedData.legEntityList.filter(p => p.exited != true);

    for (let leg of legs) {

      let iv = PLCalc.getImpliedVolatility(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, leg.Option_Price, leg.CE_PE);
      let greeks = new Greeks();
      greeks.lots = leg.Position_Lot;
      greeks.iv = this.roundTo(iv);
      greeks.expiry = this.props.passedData.selectedExpiryDate;
      greeks.strikePrice = leg.Strike_Price;
      greeks.CE_PE = leg.CE_PE;
      let delta = this.callLegDelta(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, iv);
      greeks.delta = leg.CE_PE == 'CE' ? delta : this.roundTo(Number(delta) - 1);
      greeks.gamma = this.callLegGamma(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, iv)

      greeks.theta = this.callLegTheta(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, iv, leg.CE_PE)
      greeks.vega = this.callLegVega(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, iv)
      greeksList.push(greeks);
    }

    return greeksList;
  }

  // calcIV = (S, K, r, T, v) => {
  //   let totalIV = 0;

  //   let T = Utility.yearElapse(this.props.passedData.selectedExpiryDate);

  //   let legs = this.props.passedData.legEntityList.filter(p => p.exited != true);
  //   for (let leg of legs) {
  //     let iv = PLCalc.getImpliedVolatility(S, K, 0, T, leg.Option_Price, leg.CE_PE);

  //     totalIV += iv;
  //   }

  //   return (100 * totalIV).toFixed(4);
  // }

  callLegDelta = (S, K, r, T, v) => {
    let d1 = this.calcD1(S, K, r, T, v);

    let nd1 = bs.stdNormCDF(d1);
    return this.roundTo(nd1);
  }

  callLegGamma = (S, K, r, T, v) => {
    let d1 = this.calcD1(S, K, r, T, v);

    let nd1der = bs.stdNormCDF(d1);

    let gamma = nd1der / (S * v * Math.sqrt(T));

    return this.roundTo(gamma);
  }

  callLegTheta = (S, K, r, T, v, type) => {

    let d1 = this.calcD1(S, K, r, T, v);
    let d2 = this.calcD2(S, K, r, T, v);
    let nd2 = bs.stdNormCDF(d2);
    let theta = -S * bs.stdNormCDF(d1) * v / 2 * Math.sqrt(T);

    if (type == 'CE')
      theta = theta - r * K * nd2;
    else
      theta = theta + r * K * nd2;

    return this.roundTo(theta);
  }

  callLegVega = (S, K, r, T, v) => {
    let d1 = this.calcD1(S, K, r, T, v);
    let nd1 = bs.stdNormCDF(d1);

    let vega = S * Math.sqrt(T) * nd1 / 100;
    return this.roundTo(vega);
  }

  calcD1 = (S, K, r, T, v) => {
    let d1 = (Math.log(S / K) + (r + Math.pow(v, 2) / 2.0) * T) / (v * Math.sqrt(T));
    return d1;
  }

  calcD2 = (S, K, r, T, v) => {
    let d1 = this.calcD1(S, K, r, T, v);
    let d2 = d1 - v * Math.sqrt(T);

    return d2;
  }

  roundTo = (num: number) => {
    if (Math.abs(num) > 1) {
      return num.toFixed(1);
    }

    if (Math.abs(num) < 1 && Math.abs(num) >= 0.1) {
      return num.toFixed(2)
    }


    return num.toFixed(4);
  }


}