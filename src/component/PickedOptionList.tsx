import { Button, Column, DataTable } from "primereact";
import React from "react";
import { OptionChain } from "src/entity/OptionChain";
import { StockSymbol } from "src/entity/StockSymbol";

interface Props {
  strategyEntityList: OptionChain[],
  symbol: StockSymbol
}

interface State {
  strategyEntityList: OptionChain[],
  record: OptionChain
}
export class PickedOptionList extends React.Component<Props, State> {

  constructor(props) {
    super(props);

    this.state = {
      strategyEntityList: [],
      record: null
    }
  }

  render() {
    return (
      <div className="p-card" id='selectedList'>
        <DataTable value={this.props.strategyEntityList} responsiveLayout="scroll" >
          <Column body={this.positionTemplate}></Column>
          <Column body={this.props.symbol?.symbol}></Column>
          <Column field="Strike_Price"></Column>
          <Column body={this.CEPETemplate}></Column>
          <Column body={this.buttonTemplate}></Column>
          <Column body={this.optionPriceTemplate}></Column>
          <Column body={this.IVTemplate}></Column>
          <Column body={this.deleteTemplate}></Column>
        </DataTable>
      </div>

    )

  }

  positionTemplate = (rowData: OptionChain) => {
    let str;
    if (rowData.Sell_Call) {
      str = "-" + rowData.Call_Lot + "x" + rowData.Call_Lot;
    }
    if (rowData.Buy_Call) {
      str = "+" + rowData.Call_Lot + "x" + rowData.Call_Lot;
    }
    if (rowData.Sell_Put) {
      str = "-" + rowData.Put_Lot + "x" + rowData.Put_Lot;
    }
    if (rowData.Buy_Put) {
      str = "+" + rowData.Put_Lot + "x" + rowData.Put_Lot;
    }

    return str;
  }

  CEPETemplate = (rowData: OptionChain) => {
    if (rowData.Buy_Call || rowData.Sell_Call) {
      return "CE";
    }

    if (rowData.Buy_Put || rowData.Sell_Put) {
      return "PE";
    }

    return null;
  }

  buttonTemplate = (rowData: OptionChain) => {
    if (rowData.Buy_Call || rowData.Buy_Put) {
      return <button className='selected-button-buy'>B</button>
    }
    if (rowData.Buy_Put || rowData.Sell_Put) {
      return <button className='selected-button-sell'>S</button>
    }

    return null;
  }

  optionPriceTemplate = (rowData) => {
    return (
      <input width="150px" type="number" min={0.01} className='optionPriceText'
        onChange={(event) => {
          rowData.optionPrice = Number.parseFloat(event.target.value);
          this.setState({ strategyEntityList: this.state.strategyEntityList })
        }} value={(rowData.Buy_Put || rowData.Sell_Put) ? rowData.Put_Ask : rowData.Call_Ask}></input>
    )
  }

  IVTemplate = (rowData: OptionChain) => {
    return "IV: " + rowData.Buy_Call || rowData.Sell_Call ? rowData.Call_IV : rowData.Put_IV;
  }

  deleteTemplate = (rowData: OptionChain) => {
    return <Button icon="pi  pi-trash" className='p-button-text' style={{ height: '20px' }}
      onClick={() => {
        rowData.Put_Lot = null;
        rowData.Call_Lot = null;
        rowData.Sell_Put = null;
        rowData.Buy_Put = null;
        rowData.Sell_Call = null;
        rowData.Buy_Call = null;
        // this.setState({ records: this.state.records });
        //  this.generateStrategyList();
      }}></Button>
  }

  maxProfit = () => {
    let strategyEntityList = this.state.strategyEntityList;

    let buyCallList = strategyEntityList.filter(p => p.Buy_Call && p.Buy_Call == true);
    let sellCallList = strategyEntityList.filter(p => p.Sell_Call && p.Sell_Call == true);
    if (buyCallList.length > 0 && sellCallList.length == 0) {
      return "Unlimited";
    }

    let buyPutList = strategyEntityList.filter(p => p.Buy_Put && p.Buy_Put == true);
    let sellPutList = strategyEntityList.filter(p => p.Sell_Put && p.Sell_Put == true);
    if (buyPutList.length > 0 && sellPutList.length == 0) {
      return "Unlimited";
    }


    return 100;
  }

  maxLoss = () => {
    let strategyEntityList = this.state.strategyEntityList;
    let sellCallList = strategyEntityList.filter(p => p.Sell_Call == true);
    let buyCallList = strategyEntityList.filter(p => p.Buy_Call == true);
    if (sellCallList.length > 0 && buyCallList.length == 0) {
      return "Unlimited";
    }

    let sellPutList = strategyEntityList.filter(p => p.Sell_Put == true);
    let buyPutList = strategyEntityList.filter(p => p.Buy_Put == true);
    if (sellPutList.length > 0 && buyPutList.length == 0) {
      return "Unlimited";
    }

    return 100;
  }
}