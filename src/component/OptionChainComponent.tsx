import axios from "axios";
import { Column, DataTable, Panel, TabPanel, TabView } from "primereact";
import React from "react";
import { OptionChain } from "src/entity/OptionChain";
import { PLCalc } from "src/utils/PLCalc";

interface Props {
  passedData
  callback;
  callbackHide;
}

interface State {
 
}

export class OptionChainComponent extends React.Component<Props, State> {
 closest;
 previousRecords; 
 constructor(props: Props) {
    super(props);

   
  }

  componentDidUpdate(prevProps, prevState) {
    this.previousRecords=prevProps.passedData.records;
  }

  render() {
    if (this.props.passedData.records == null) return null;
    let records = this.props.passedData.records;

    let strikePriceArray=records.map(p=>p.Strike_Price);

    this.closest = PLCalc.findClosest(strikePriceArray,this.props.passedData.fairPrice);

    return (
       <div>
        <div className="alignedCenter">Option Chain<img src='./hide_left.svg'  onClick={this.props.callbackHide}></img></div>    
          <div key={'optionList_' + this.props.passedData.selectedsymbol}>
            <DataTable className='optionList' value={records} responsiveLayout="scroll" scrollable scrollHeight="calc(100vh - 182px)" showGridlines >
              {/* <Column style={{ width: '6%',  backgroundColor:  '#FFFF00' }} align="right" field='Call_Delta' header="Delta"></Column> */}
              <Column style={{ width: '6%' }} align="right" header="Delta" body={this.deltaTemplate}></Column>
              <Column style={{ width: '6%' }} align="right" header="IV"  body={this.ivTemplate}></Column>
              <Column style={{ width: '6%' }} align="right" header="LTP" body={this.ltpTemplate}></Column>
              <Column style={{ width: '32%' }} align="left"  header="Call" body={this.callTemplate}></Column>
              <Column style={{ width: '12%' }} align="center" header="Strike" body={this.strikeTemplate}  ></Column>
              <Column style={{ width: '32%' }} align="right" header="Put" body={this.putTemplate}></Column>
              <Column style={{ width: '6%' }} align="right"  header="LTP" body={this.ltpPutTemplate}></Column>
              <Column style={{ width: '6%' }} align="right"  header="IV" body={this.ivPutTemplate}></Column>
              <Column style={{ width: '6%' }} align="right"  header="Delta" body={this.deltaPutTemplate}></Column>
            </DataTable>
          </div>
        </div>
    )
  }

  deltaTemplate = (rowData: OptionChain) => {
    if(this.closest==rowData.Strike_Price){
      return (
        <div style={{ backgroundColor: '#ffe494', display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
          {rowData.Call_Delta}
        </div>
      )
    }
    if (this.props.passedData.fairPrice >= rowData.Strike_Price) {
      return (
        <div style={{ backgroundColor: '#f4fcfa', display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
          {rowData.Call_Delta}
        </div>
      )
    }
    return rowData.Call_Delta;
  }
  
  ivTemplate = (rowData: OptionChain) => {
    if(this.closest==rowData.Strike_Price){
      return (
        <div style={{ backgroundColor: '#ffe494', display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
          {rowData.Call_IV}
        </div>
      )
    }
    if (this.props.passedData.fairPrice >= rowData.Strike_Price) {
      return (
        <div style={{ backgroundColor: '#f4fcfa', display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
          {rowData.Call_IV}
        </div>
      )
    }
    return rowData.Call_IV;
  }

  ltpTemplate = (rowData: OptionChain) => {
    if(this.closest==rowData.Strike_Price){
      return (
        <div style={{ backgroundColor: '#ffe494', display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
          {rowData.Call_LTP}
        </div>
      )
    }
    if (this.props.passedData.fairPrice >= rowData.Strike_Price) {
      return (
        <div style={{ backgroundColor: '#f4fcfa', display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
          {rowData.Call_LTP}
        </div>
      )
    }
    return rowData.Call_LTP;
  }

  callTemplate = (rowData: OptionChain) => {
   
    return (<div  style={{ backgroundColor: this.closest==rowData.Strike_Price?'#ffe494':null,height:'100%', width:'100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
      <div>
        <button className='smallGreenButton' style={{marginTop:'4px',backgroundColor: rowData.Buy_Call == true ? 'green' : 'white', color: rowData.Buy_Call == true ? 'white' : 'black' }} onClick={(event) => {
           if(rowData.Sell_Call==true){
            rowData.Call_Lot=null;
          }

          if (rowData.Call_Lot == null) {
            rowData.Call_Lot = 1;
            rowData.Call_Price = rowData.Call_LTP;
          } else {
            let clone = JSON.parse(JSON.stringify(this.previousRecords));
            let foundPreviousRow = clone.filter(row => row.Strike_Price == rowData.Strike_Price)[0];
            let previousTotalAmount = parseFloat(foundPreviousRow.Call_Price) * parseFloat(foundPreviousRow.Call_Lot);
            let totalAmout = previousTotalAmount + parseFloat(rowData.Call_LTP.toString());
            let totalLeg = foundPreviousRow.Call_Lot + 1;
            rowData.Call_Price = parseFloat((totalAmout / totalLeg).toFixed(2));
            console.log(rowData.Call_Price);
            rowData.Call_Lot += 1;
          }
          rowData.Buy_Call = true;
          rowData.Sell_Call = null;
        //  rowData.Put_Price = null;

          this.props.callback(this.props.passedData);
        }}>B</button>
      </div>
      <div style={{marginTop:'4px'}}>
        <button className='smallRedButton' style={{ backgroundColor: rowData.Sell_Call == true ? 'red' : 'white', color: rowData.Sell_Call == true ? 'white' : 'black' }} onClick={() => {
          if(rowData.Buy_Call){
            rowData.Call_Lot=null;
          }

          if (rowData.Call_Lot == null) {
            rowData.Call_Lot = 1;
            rowData.Call_Price = rowData.Call_LTP;
          } else {
            let clone = JSON.parse(JSON.stringify(this.previousRecords));
            let foundPreviousRow = clone.filter(row => row.Strike_Price == rowData.Strike_Price)[0];
            let previousTotalAmount = Number.parseFloat(foundPreviousRow.Call_Price) * Number.parseFloat(foundPreviousRow.Call_Lot);
            let totalAmout = previousTotalAmount + Number.parseFloat(rowData.Call_LTP.toString());
            let totalLeg = foundPreviousRow.Call_Lot + 1;
            rowData.Call_Price = Number.parseFloat((totalAmout / totalLeg).toFixed(2));
            rowData.Call_Lot += 1;
          }
          rowData.Sell_Call = true;
          rowData.Buy_Call = null;
        //  rowData.Put_Price = null;

          this.props.callback(this.props.passedData);
        }}>S</button>
      </div>
      <div style={rowData.Call_Lot ? { display: 'block',   marginTop:'4px' } : { display: 'none' }}>
        <input type="number" min={1} max={5000} className='smallText' onChange={(event) => {
          rowData.Call_Lot = Number.parseInt(event.target.value);
          this.props.callback(this.props.passedData);
        }} value={rowData.Call_Lot}></input>
      </div>
    </div>)
  }

  putTemplate = (rowData: OptionChain) => {
    return (<div  style={{ backgroundColor: this.closest==rowData.Strike_Price?'#ffe494':null,height:'100%', width:'100%', display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
      <div style={rowData.Put_Lot ? { display: 'block',marginTop:'4px' } : { display: 'none' }}>
        <input type="number" min={1} max={5000} className='smallText'
          onChange={(event) => {
            rowData.Put_Lot = Number.parseInt(event.target.value);
            this.props.callback(this.props.passedData);
          }} value={rowData.Put_Lot}></input>
      </div>
      <div style={{marginTop:'4px'}}>
        <button className='smallGreenButton' style={{ backgroundColor: rowData.Buy_Put == true ? 'green' : 'white', color: rowData.Buy_Put == true ? 'white' : 'black' }}
          onClick={() => {
            if(rowData.Sell_Put){
              rowData.Put_Lot=null;
            }
            if (rowData.Put_Lot == null) {
              rowData.Put_Price = rowData.Put_LTP;
              rowData.Put_Lot = 1;
            } else {
              let clone = JSON.parse(JSON.stringify(this.previousRecords));
              let foundPreviousRow = clone.filter(row => row.Strike_Price == rowData.Strike_Price)[0];
              let previousTotalAmount = parseFloat(foundPreviousRow.Put_Price) * parseFloat(foundPreviousRow.Put_Lot);
              let totalAmout = previousTotalAmount + parseFloat(rowData.Put_LTP.toString());
              let totalLeg = foundPreviousRow.Put_Lot + 1;
              rowData.Put_Price = parseFloat((totalAmout / totalLeg).toFixed(2));
              rowData.Put_Lot += 1;
            }
            rowData.Buy_Put = true;
            rowData.Sell_Put = null;
       //     rowData.Call_Price = null;

            this.props.callback(this.props.passedData);
          }}>B</button>
      </div>
      <div style={{marginTop:'4px'}}>
        <button className='smallRedButton' style={{ backgroundColor: rowData.Sell_Put == true ? 'red' : 'white', color: rowData.Sell_Put == true ? 'white' : 'black' }}
        onClick={() => {
          if(rowData.Buy_Put){
            rowData.Put_Lot =null;
          }

          if (rowData.Put_Lot == null) {
            rowData.Put_Lot = 1;
            rowData.Put_Price = rowData.Put_LTP;
          } else {
            let clone = JSON.parse(JSON.stringify(this.previousRecords));
            let foundPreviousRow = clone.filter(row => row.Strike_Price == rowData.Strike_Price)[0];
            let previousTotalAmount = parseFloat(foundPreviousRow.Put_Price) * parseFloat(foundPreviousRow.Put_Lot);
            let totalAmout = previousTotalAmount + parseFloat(rowData.Put_LTP.toString());
            let totalLeg = foundPreviousRow.Put_Lot + 1;
            rowData.Put_Price = parseFloat((totalAmout / totalLeg).toFixed(2));
            rowData.Put_Lot += 1;
          }
          rowData.Sell_Put = true;
          rowData.Buy_Put = null;
       //   rowData.Call_Price = null;
          this.props.callback(this.props.passedData);
        }}>S</button>
      </div>
    </div>
  )
  }
  
  strikeTemplate=(rowData: OptionChain)=>{
    if(this.closest==rowData.Strike_Price){
      return (
        <div style={{ backgroundColor: '#ffe494', display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
          {rowData.Strike_Price}
        </div>
      )
  } 
  return <div style={{ display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
      {rowData.Strike_Price}
    </div>
 
  
}
  ltpPutTemplate = (rowData: OptionChain) => {
    if(this.closest==rowData.Strike_Price){
      return (
        <div style={{ backgroundColor: '#ffe494', display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
          {rowData.Put_LTP}
        </div>
      )
    }
    if (this.props.passedData.fairPrice < rowData.Strike_Price) {
      return (
        <div style={{ backgroundColor: '#f4fcfa', display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
          {rowData.Put_LTP}
        </div>
      )
    }
    return rowData.Put_LTP;
  }

  ivPutTemplate = (rowData: OptionChain) => {
    if(this.closest==rowData.Strike_Price){
      return (
        <div style={{ backgroundColor: '#ffe494', display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
          {rowData.Put_IV}
        </div>
      )
    }
    if (this.props.passedData.fairPrice < rowData.Strike_Price) {
      return (
        <div style={{ backgroundColor: '#f4fcfa', display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
          {rowData.Put_IV}
        </div>
      )
    }
    return rowData.Put_IV;
  }
  
  deltaPutTemplate = (rowData: OptionChain) => {
    if(this.closest==rowData.Strike_Price){
      return (
        <div style={{ backgroundColor: '#ffe494', display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
          {rowData.Put_Delta}
        </div>
      )
    }
    
    if (this.props.passedData.fairPrice < rowData.Strike_Price) {
      return (
        <div style={{ backgroundColor: '#f4fcfa', display:'flex',  height:'100%', width:'100%',  alignItems: 'center',justifyContent: 'right' }}>
          {rowData.Put_Delta}
        </div>
      )
    }
    return rowData.Put_Delta;
  }
}