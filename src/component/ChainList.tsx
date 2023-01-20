import axios from "axios";
import { Column, DataTable } from "primereact";
import React from "react";
import { CircleSpinnerOverlay } from "react-spinner-overlay";
import { OptionChain } from "src/entity/OptionChain";
import { StockSymbol } from "src/entity/StockSymbol";

interface Props {
  passedData
  callback;
}

interface State {

}

export class ChainList extends React.Component<Props, State> {

  constructor(props: Props) {
    super(props);

  }

  render() {
    if (this.props.passedData.records == null) return null;

    return (

      <div key={'optionList_' + this.props.passedData.selectedsymbol}>
        <DataTable className='optionList' value={this.props.passedData.records} responsiveLayout="scroll" scrollable scrollHeight="calc(100vh - 170px)" showGridlines >
          <Column style={{ width: '6%' }} align="right" field='Call_Delta' header="Delta"></Column>
          <Column style={{ width: '6%' }} align="right" field='Call_IV' header="IV"></Column>
          <Column style={{ width: '6%' }} align="right" field='Call_LTP' header="LTP"></Column>
          <Column style={{ width: '32%' }} align="left" header="Call" body={this.callTemplate}></Column>
          <Column style={{ width: '12%' }} align="center" field="Strike_Price" header="Strike"></Column>
          <Column style={{ width: '32%' }} align="right" header="Put" body={this.putTemplate}></Column>
          <Column style={{ width: '6%' }} align="right" field="Put_LTP" header="LTP"></Column>
          <Column style={{ width: '6%' }} align="right" field='Put_IV' header="IV"></Column>
          <Column style={{ width: '6%' }} align="right" field='Put_Delta' header="Delta"></Column>
        </DataTable>
      </div>
    )
  }

  callTemplate = (rowData: OptionChain) => {
    return (<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
      <div>
        <button className='smallGreenButton' style={{ backgroundColor: rowData.Buy_Call == true ? 'green' : 'white', color: rowData.Buy_Call == true ? 'white' : 'black' }} onClick={(event) => {
          // console.log(rowData.Buy_Call, rowData.Call_Lot);
          if (rowData.Buy_Call) {
            rowData.Call_Lot = null;
            rowData.Buy_Call = false;
          } else {
            rowData.Call_Lot = 1;
            rowData.Buy_Call = true;
            rowData.Sell_Call = null;
            rowData.Call_Price = rowData.Call_LTP;
          }
          //    this.updateRecord();
          this.props.callback(this.props.passedData);
        }}>B</button>
      </div>
      <div>
        <button className='smallRedButton' style={{ backgroundColor: rowData.Sell_Call == true ? 'red' : 'white', color: rowData.Sell_Call == true ? 'white' : 'black' }} onClick={() => {
          if (rowData.Sell_Call) {
            rowData.Call_Lot = null;
            rowData.Sell_Call = false;
          } else {
            rowData.Call_Lot = 1;
            rowData.Sell_Call = true;
            rowData.Buy_Call = null;
            rowData.Call_Price = rowData.Call_LTP;
          }
          //      this.updateRecord();
          this.props.callback(this.props.passedData);

        }}>S</button>
      </div>
      <div style={rowData.Call_Lot ? { display: 'block' } : { display: 'none' }}>
        <input type="number" min={1} max={5000} className='smallText' onChange={(event) => {
          rowData.Call_Lot = Number.parseInt(event.target.value);
          //</div>this.updateRecord() 
          this.props.callback(this.props.passedData);
        }} value={rowData.Call_Lot}></input>
      </div>
    </div>)
  }

  putTemplate = (rowData: OptionChain) => {
    return (<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
      <div style={rowData.Put_Lot ? { display: 'block' } : { display: 'none' }}>
        <input type="number" min={1} max={5000} className='smallText'
          onChange={(event) => {
            rowData.Put_Lot = Number.parseInt(event.target.value);
            this.props.callback(this.props.passedData);
          }} value={rowData.Put_Lot}></input>
      </div>
      <div>
        <button className='smallGreenButton' style={{ backgroundColor: rowData.Buy_Put == true ? 'green' : 'white', color: rowData.Buy_Put == true ? 'white' : 'black' }}
          onClick={() => {
            // console.log(rowData.Buy_Put, rowData.Put_Lot)
            if (rowData.Buy_Put) {
              rowData.Put_Lot = null;
              rowData.Buy_Put = false;
            } else {
              rowData.Put_Lot = 1;
              rowData.Buy_Put = true;
              rowData.Sell_Put = null;
              rowData.Put_Price = rowData.Put_LTP;
            }
            //         this.updateRecord();
            this.props.callback(this.props.passedData);
          }}>B</button>
      </div>
      <div><button className='smallRedButton' style={{ backgroundColor: rowData.Sell_Put == true ? 'red' : 'white', color: rowData.Sell_Put == true ? 'white' : 'black' }}
        onClick={() => {
          if (rowData.Sell_Put) {
            rowData.Put_Lot = null;
            rowData.Sell_Put = false;
          } else {
            rowData.Put_Lot = 1;
            rowData.Sell_Put = true;
            rowData.Buy_Put = null;
            rowData.Put_Price = rowData.Put_LTP;
          }
          this.props.callback(this.props.passedData);
          //       this.updateRecord();
        }}>S</button>
      </div>
    </div>)
  }


  generateStrategyList = () => {
    let list = this.props.passedData.records.filter(p => p.Buy_Call || p.Buy_Put || p.Sell_Call || p.Sell_Put);
    // this.setState({ strategyEntityList: list });

    let options = [];
    list.forEach(p => {
      let option = { side: null, type: null, strike: 0, bid: 0, ask: 0 };
      option.side = (p.Buy_Call || p.Buy_Put) ? 'buy' : 'sell';
      option.type = p.Buy_Call || p.Sell_Call ? 'call' : 'put';
      option.strike = p.Strike_Price;
      option.bid = option.type == 'call' ? p.Call_Bid : p.Put_Bid;
      option.ask = option.type == 'call' ? p.Call_Ask : p.Put_Ask;

      options.push(option);
    });

    let payoffMeta = { underlyingPrice: 0, priceRange: null };
    // payoffMeta.underlyingPrice = this.state.;
    payoffMeta.priceRange = [1, 2, 3, 4, 5];

    // let payoff = optionPayoff.payoff(options, payoffMeta);

    // this.setState({
    //     payoffData: payoff
    // })
  }
}