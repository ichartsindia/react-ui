import { Button, Column, DataTable, Dropdown, InputText, TabPanel, TabView } from "primereact";
import React from "react";
import { LegEntity } from "src/entity/LegEntity";
import { OptionChain } from "src/entity/OptionChain";
import { StockSymbol } from "src/entity/StockSymbol";
import { PLCalc } from "src/utils/PLCalc";
import { i, mean, round, std, erf } from 'mathjs';
import { DateUtility } from "src/utils/DateUtility";
import bs from 'black-scholes';
import { Greeks } from "src/entity/Greeks";


interface Props {
  passedData,
  callback
}

interface State {

}

export class LegComponent extends React.Component<Props, State> {
  greeks;
  constructor(props) {
    super(props);

    this.state = {

    }
  }

  render() {
    this.greeks = this.generateGreeks();
    let expiry = this.props.passedData.selectedExpiryDate;

    return (
      <TabView>
        <TabPanel header="Legs">
          <div className="p-card" id="selectedLegList" key={'Legs_' + this.props.passedData.selectedsymbol}>
            <DataTable value={this.props.passedData.legEntityList} responsiveLayout="scroll" >
              <Column body={this.buttonTemplate} align="center" ></Column>
              <Column body={this.plusTemplate} align="center" style={{ width: '2%' }}></Column>
              <Column body={this.lotTemplate} header="Lots" align="center"></Column>
              <Column body={this.minusTemplate} align="center" style={{ width: '2%' }}></Column>
              <Column body={expiry} header='Expiry' align="center"></Column>
              <Column field="Strike_Price" header='Strike' align="center"></Column>
              <Column field="CE_PE" header='Type' align="center"></Column>
              <Column body={this.optionPriceTemplate} header='Entry Price' align="center"></Column>
              <Column field="IV" header='IV' align="center"></Column>
              <Column body={this.deleteTemplate} header="Action"></Column>
            </DataTable>
          </div>
        </TabPanel>
        <TabPanel header="Greeks">
          <div key={'greeks_' + this.props.passedData.selectedsymbol}>
            <DataTable value={this.greeks} responsiveLayout="scroll" >
              <Column field='lots' align="center" header='Lots'></Column>
              <Column field='strikePrice' align="center" header='Strike'></Column>
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
  lotTemplate = (rowData: LegEntity) => {
    if (rowData.Buy_Sell == 'S') {
      return "-" + rowData.Position_Lot + "x" + this.props.passedData.lotSize;
    } else {
      return "+" + rowData.Position_Lot + "x" + this.props.passedData.lotSize;
    }
  }

  buttonTemplate = (rowData: LegEntity) => {
    if (rowData.Buy_Sell == 'B') {
      return <button className='selected-button-buy'>B</button>
    }
    if (rowData.Buy_Sell == 'S') {
      return <button className='selected-button-sell'>S</button>
    }

    return null;
  }
  plusTemplate = (rowData: LegEntity) => {  
    
    return <i className="pi pi-plus" style={{ color: 'slateblue', fontSize:'smaller', cursor:'pointer' }} onClick={(e)=>{
      rowData.Position_Lot=+rowData.Position_Lot+1;
      if(rowData.Position_Lot>0)
          this.props.callback(this.props.passedData.legEntityList);
    }
    }></i>

  }

  minusTemplate = (rowData: LegEntity) => {  
    
    return <i className="pi pi-minus" style={{ color: 'slateblue' , fontSize:'smaller', cursor:'pointer' }} onClick={(e)=>{
      rowData.Position_Lot=+rowData.Position_Lot-1;
      if(rowData.Position_Lot>0)
      this.props.callback(this.props.passedData.legEntityList);
    }
    }></i>

  }
  optionPriceTemplate = (rowData: LegEntity) => {
    return (
      <InputText   value={rowData.Option_Price} style={{textAlign:'right', fontSize:'small', height:'22px', width:'100px'}}
      onChange={(event) => {
          console.log(event.target.value)
          rowData.Option_Price = event.target.value;
          if(rowData.Option_Price)
          this.props.callback(this.props.passedData.legEntityList);
        }} ></InputText>
    )
  }

  // IVTemplate = (rowData: LegEntity) => {
  //   return (
  //     "IV: " + rowData.IV
  //   )
  // }

  deleteTemplate = (rowData: LegEntity) => {
    let lotList = [];
    
    for(let i=0; i<rowData.Position_Lot; i++){
      lotList.push(i+1);
    }

    return <div className='flex'>
      <div className='leglot-dropdown'>
        <Dropdown id="legLotDropdown" value={rowData.Position_Lot} onChange={(e) => { rowData.Position_Lot = e.value; this.props.callback(this.props.passedData.legEntityList); }} options={lotList} />
      </div>
      <div>
        <Button icon="pi  pi-trash" className='p-button-text' style={{ height: '20px' }}
          onClick={() => {
            let list = this.props.passedData.legEntityList;
            const index = list.indexOf(rowData, 0);
            if (index > -1) {
              list.splice(index, 1);
            }
            this.props.callback(list);
            // this.setState({ legEntityList: list });
            // this.convertLegToOptionChain();
          }}></Button>
      </div>
    </div>
  }
  //#endregion

  generateGreeks = () => {

    let greeksList = [];

    let T = DateUtility.yearElapse(this.props.passedData.selectedExpiryDate);

    for (let leg of this.props.passedData.legEntityList) {
      let iv = PLCalc.getImpliedVolatility(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, leg.Option_Price, leg.CE_PE);
      let greeks = new Greeks();
      greeks.lots = leg.Position_Lot;
      greeks.iv = iv.toFixed(4);
      greeks.expiry = this.props.passedData.selectedExpiryDate;
      greeks.strikePrice = leg.Strike_Price;
      let delta = this.callLegDelta(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, iv);
      greeks.delta = delta.toFixed(4);;
      greeks.gamma = this.callLegGamma(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, iv).toFixed(4);
      greeks.theta = this.callLegTheta(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, iv, leg.CE_PE).toFixed(4);
      greeks.vega = this.callLegVega(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, iv).toFixed(4);
      greeksList.push(greeks);
    }

    return greeksList;
  }

  //#region old
  calcDelta = () => {
    let totalDelta = 0;

    let T = DateUtility.yearElapse(this.props.passedData.selectedExpiryDate);

    for (let leg of this.props.passedData.legEntityList) {
      // console.log(leg)
      let iv = PLCalc.getImpliedVolatility(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, leg.Option_Price, leg.CE_PE);
      let delta = this.callLegDelta(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, iv);
      if (leg.CE_PE == 'CE')
        totalDelta += +delta
      else
        totalDelta += +delta - 1;
    }

    return totalDelta.toFixed(4);
  }

  calcGamma = () => {

    let totalGamma = 0;

    let T = DateUtility.yearElapse(this.props.passedData.selectedExpiryDate);

    for (let leg of this.props.passedData.legEntityList) {
      let iv = PLCalc.getImpliedVolatility(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, leg.Option_Price, leg.CE_PE);

      let gamma = this.callLegGamma(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, iv);
      totalGamma += gamma
    }

    return totalGamma.toFixed(4);
  }

  calcTheta = () => {

    let totalTheta = 0;

    let T = DateUtility.yearElapse(this.props.passedData.selectedExpiryDate);

    for (let leg of this.props.passedData.legEntityList) {
      let iv = PLCalc.getImpliedVolatility(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, leg.Option_Price, leg.CE_PE);

      let theta = this.callLegTheta(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, iv, leg.CE_PE);
      totalTheta += theta;
    }

    return totalTheta.toFixed(4);
  }

  calcVega = () => {

    let totalVega = 0;

    let T = DateUtility.yearElapse(this.props.passedData.selectedExpiryDate);

    for (let leg of this.props.passedData.legEntityList) {
      let iv = PLCalc.getImpliedVolatility(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, leg.Option_Price, leg.CE_PE);

      let vega = this.callLegVega(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, iv);
      totalVega += vega;
    }

    return totalVega.toFixed(4);
  }

  calcIV = () => {
    let totalVega = 0;

    let T = DateUtility.yearElapse(this.props.passedData.selectedExpiryDate);

    for (let leg of this.props.passedData.legEntityList) {
      let iv = PLCalc.getImpliedVolatility(this.props.passedData.fairPrice, leg.Strike_Price, 0, T, leg.Option_Price, leg.CE_PE);

      totalVega += iv;
    }

    return (100 * totalVega).toFixed(4);
  }

  callLegDelta = (S, K, r, T, v) => {
    let d1 = this.calcD1(S, K, r, T, v);

    let nd1 = bs.stdNormCDF(d1);
    return nd1;
  }

  callLegGamma = (S, K, r, T, v) => {
    let d1 = this.calcD1(S, K, r, T, v);

    let nd1der = bs.stdNormCDF(d1);

    let gamma = nd1der / (S * v * Math.sqrt(T));

    return gamma;
  }

  callLegTheta = (S, K, r, T, v, type) => {

    let d1 = this.calcD1(S, K, r, T, v);
    let d2 = this.calcD2(S, K, r, T, v);

    let theta = -S * bs.stdNormCDF(d1) * v / 2 * Math.sqrt(T);

    if (type == 'CE')
      theta = theta - r * K * bs.stdNormCDF(d2);
    else
      theta = theta + r * K * bs.stdNormCDF(d2);

    return theta;
  }

  callLegVega = (S, K, r, T, v) => {
    let d1 = this.calcD1(S, K, r, T, v);
    let d1d = bs.stdNormCDF(d1);

    let vega = S * Math.sqrt(T) * d1d / 100;
    return vega;
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
  //#endregion

}