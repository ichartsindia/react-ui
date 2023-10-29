import axios from "axios";
import { Column, DataTable, Panel, TabPanel, TabView } from "primereact";
import React from "react";
import { Button } from "react-bootstrap";
import { OptionChain } from "../entity/OptionChain";
import { PLCalc } from "../utils/PLCalc";

interface Props {
  passedData
  callback;
 // callbackHide;
  callbackExpiryChange;
}

interface State {
  expiryList
}

export class OptionChainLiteComponent extends React.Component<Props, State> {
 closest;
 previousRecords; 
 constructor(props: Props) {
    super(props);
    
    this.state={
      expiryList: []
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.previousRecords=prevProps.passedData.records;
  }

  render() {
    if (this.props.passedData.records == null) return null;
    let records = this.props.passedData.records;
    let strikePriceArray = records.map(p => p.Strike_Price);
    this.closest = PLCalc.findClosest(strikePriceArray, this.props.passedData.fairPrice);
    let expiryList = [];  
    if (this.props.passedData.expiryDateList != null && this.props.passedData.expiryDateList.length > 4) {
      for (let i = 0; i < 4; i++) {
      
    let strikePriceArray = records.map(p => p.Strike_Price);
    expiryList.push(<button key={"button_" + this.props.passedData.expiryDateList[i]["expiry_dates"]} 
    className= {this.props.passedData.selectedExpiryDate!=this.props.passedData.expiryDateList[i]["expiry_dates"]?'button-above-option-chain':'button-above-option-chain-orange'} 
    onClick={(e) => {
          this.props.passedData.selectedExpiryDate = e.target["innerText"];
          e.target['className']='button-above-option-chain-orange';
          this.props.callbackExpiryChange(this.props.passedData.selectedExpiryDate);
        }
        }>{this.props.passedData.expiryDateList[i]["expiry_dates"]} </button>);
      }
      // console.log("after",expiryList);
    }
    let offset = this.props.passedData.legEntityList.length*25;
    let height = window.innerHeight-200 
    
    if(offset>0){
      height = height-100-offset
    }
    console.log("height",height);
    return (
       <div>
        <div className="alignedCenter">Option Chain</div> 
          <div style={{display:'flex', justifyContent: 'space-evenly', marginBottom:'3px', marginTop:'3px'}}>      
            {expiryList}
          </div> 
          <div key={'optionList_' + this.props.passedData.selectedsymbol}>
            <DataTable className='optionList' value={records} responsiveLayout="scroll" scrollable scrollHeight={height +'px'} showGridlines >
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
            rowData.Call_Price = this.newPrice(rowData, "CE");
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
           
            rowData.Call_Price = this.newPrice(rowData, "CE");
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
            // if(rowData.Sell_Put){
            //   rowData.Put_Lot=null;
            // }
            console.log(rowData)
            if (rowData.Put_Lot == null) {
              rowData.Put_Price = rowData.Put_LTP;
              rowData.Put_Lot = 1;
            } else {
              rowData.Put_Price = this.newPrice(rowData, "PE")
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
            rowData.Put_Price =  this.newPrice(rowData, "PE")
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

  newPrice = (rowData, CE_PE) => {
    console.log(rowData);
    let clone = JSON.parse(JSON.stringify(this.previousRecords));
    let foundPreviousRow = clone.filter(row => row.Strike_Price == rowData.Strike_Price)[0] ;
    let legs = this.props.passedData.legEntityList.filter((leg) => leg.CE_PE == CE_PE && leg.Strike_Price - rowData.Strike_Price == 0);
    let previousLeg;
    if (legs.length > 0) {
      previousLeg = legs[0];
    }
    let previousPrice = previousLeg.Entry_Price;
    let totalAmout;
    let totalLeg
    if (CE_PE == "CE") {
      let previousTotalAmount = parseFloat(previousPrice) * parseFloat(foundPreviousRow.Call_Lot);
      totalAmout = previousTotalAmount + parseFloat(rowData.Call_LTP.toString());
      totalLeg = foundPreviousRow.Call_Lot + 1;
    } else {
      let previousTotalAmount = parseFloat(previousPrice) * parseFloat(foundPreviousRow.Put_Lot);
      totalAmout = previousTotalAmount + parseFloat(rowData.Put_LTP.toString());
      totalLeg = foundPreviousRow.Put_Lot + 1;

    }
    return parseFloat((totalAmout / totalLeg).toFixed(2));

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