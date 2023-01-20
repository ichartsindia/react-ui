import { Button, Column, DataTable } from "primereact";
import React from "react";
import { LegEntity } from "src/entity/LegEntity";
import { OptionChain } from "src/entity/OptionChain";
import { StockSymbol } from "src/entity/StockSymbol";

interface Props {
 passedData,
 callback
}

interface State {
 
}
export class LegList extends React.Component<Props, State> {

  constructor(props) {
    super(props);
console.log(props.passedData)
   
  }

  render() {
    return (
      <div className="p-card" id="selectedList" key={'payoffChart_' + this.props.passedData.selectedsymbol}>
        <DataTable value={this.props.passedData.legEntityList} responsiveLayout="scroll" >
            <Column body={this.lotTemplate}></Column>
            <Column body={this.props.passedData.selectedExpiryDate}></Column>
            <Column field="Strike_Price"></Column>
            <Column field="CE_PE"></Column>
            <Column body={this.buttonTemplate}></Column>
            <Column body={this.optionPriceTemplate}></Column>
            <Column body={this.IVTemplate}></Column>
            <Column body={this.deleteTemplate}></Column>
         </DataTable>
      </div>

    )

  }

  lotTemplate = (rowData: LegEntity) => {
    if (rowData.Buy_Sell == 'Sell') {
      return "-" + rowData.Position_Lot + "x" + this.props.passedData.lotSize;
    } else {
      return "+" + rowData.Position_Lot + "x" + this.props.passedData.lotSize;
    }
  }

  buttonTemplate = (rowData: LegEntity) => {
    if (rowData.Buy_Sell == 'Buy') {
      return <button className='selected-button-buy'>B</button>
    }
    if (rowData.Buy_Sell == 'Sell') {
      return <button className='selected-button-sell'>S</button>
    }

    return null;
  }

  optionPriceTemplate = (rowData: LegEntity) => {
    // console.log(rowData.Option_Price)
    return (
      <input width="150px" type="text" min={1.0} max={50000.0} value={rowData.Option_Price}
        onChange={(event) => {
          rowData.Option_Price = Number.parseFloat(event.target.value);
          this.props.callback(this.props.passedData);
         // this.setState({ legEntityList: this.props.passedData.legEntityList });
        }} ></input>
    )
  }

  IVTemplate = (rowData: LegEntity) => {
    return (
      "IV: " + rowData.IV
    )
  }

  deleteTemplate = (rowData: LegEntity) => {
    return <Button icon="pi  pi-trash" className='p-button-text' style={{ height: '20px' }}
      onClick={() => {
        let list = this.props.passedData.legEntityList;
        const index = list.indexOf(rowData, 0);
        if (index > -1) {
          list.splice(index, 1);
        }
        this.props.callback(this.props.passedData);
        this.setState({ legEntityList: list, records: this.props.passedData.records });
        // this.convertLegToOptionChain();
      }}></Button>
  }
}