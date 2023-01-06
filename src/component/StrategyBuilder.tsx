import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import OptionService from '../service/OptionService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button, Calendar, Checkbox, Dialog, Dropdown, InputNumber, InputText, Panel, SelectButton, TabPanel, TabView } from 'primereact';
import { v4 as uuidv4 } from 'uuid';
import { SaveDialog } from './SaveDialog';
import axios from "axios";
import { OptionChain } from 'src/entity/OptionChain';
import { CircleSpinnerOverlay, FerrisWheelSpinner } from 'react-spinner-overlay';
import { DateUtility } from 'src/utils/DateUtility';
import { OptData, OptHeader, OptLeg } from 'src/entity/OptData';
import { PLCalc } from 'src/utils/PLCalc';
import { PayoffChart } from './PayoffChart';
import { LegEntity } from 'src/entity/LegEntity';
import '../component/Simulator.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import { chain } from 'mathjs';
interface Props {

}

interface State {
  records: OptionChain[];
  selectedsymbol: string;
  legEntityList: LegEntity[];
  openSaveDialog: boolean;
  SymbolList;
  expiryDateList;
  selectedExpiryDate;
  spotPrice;
  futPrice;
  lotSize;
  avgiv;
  ivr;
  ivp;
  fairPrice;
  isBusy: boolean,
  symbol;
}

export class StrategyBuilder extends React.Component<Props, State> {

  basicData: { labels: string[]; datasets: { label: string; data: number[]; fill: boolean; borderColor: string; tension: number; }[]; };
  SymbolWithMarketSegments: any;
  interval: NodeJS.Timer;
  constructor(props: Props) {
    super(props);

    this.state = {
      records: null,
      selectedsymbol: 'NIFTY',
      legEntityList: [],
      openSaveDialog: false,
      SymbolList: [],
      expiryDateList: [],
      selectedExpiryDate: null,
      spotPrice: null,
      futPrice: null,
      lotSize: null,
      avgiv: null,
      ivr: null,
      ivp: null,
      fairPrice: null,
      isBusy: false,
      symbol: null
    }


  }

  componentDidMount = () => {
    axios.get("https://www.icharts.in/opt/api/Symbol_List_Api.php", { withCredentials: false })
      .then(response => {
        let data = response.data;
        this.SymbolWithMarketSegments = data;
        let arr = data.map(p => p.symbol);
        this.setState({
          SymbolList: arr
        });
        let symbol = this.SymbolWithMarketSegments.filter(p => p.symbol == this.state.selectedsymbol);
        let url = "https://www.icharts.in/opt/api/getExpiryDates_Api.php?sym=" + this.state.selectedsymbol + "&sym_type=" + symbol[0].symbol_type;
        this.setState({ isBusy: true })
        axios.get(url, { withCredentials: false })
          .then(response => {
            let data = response.data;
            console.log(data)
            this.setState({ expiryDateList: data, isBusy: false, selectedExpiryDate: data[0]["expiry_dates"] });

          }).catch(err => {
            this.setState({ expiryDateList: err.response.data });
          });


      });

    this.interval = setInterval(() => this.refreshOptionData(), 30000);

  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  refreshOptionData = () => {
    let urlDetail = "https://www.icharts.in/opt/api/OptionChain_Api.php?sym=" + this.state.symbol[0].symbol + "&exp_date=" + this.state.selectedExpiryDate + "&sym_type=" + this.state.symbol[0].symbol_type;
    this.setState({ isBusy: true });
    axios(urlDetail, { withCredentials: false })
      .then(response => {
        // console.log(response)
        let data = response.data;
        // console.log(data);
        this.setState({
          records: data,
          isBusy: false
        },()=>this.convertLegToOptionChain())
      }
      )
  }
  render() {

    return (

      <div className="grid p-fluid">
        <div>
          {this.state.isBusy ? <CircleSpinnerOverlay loading={true} overlayColor="rgba(0,153,255,0.2)" /> : null}
        </div>
        <div className="col-12 lg:col-12">
          <div className='p-card secondLine'>
            <div className="flex-item symbol-dropdown" ><Dropdown value={this.state.selectedsymbol} options={this.state.SymbolList} onChange={(e) => {
              this.setState({ selectedsymbol: e.value });
              let symbol = this.SymbolWithMarketSegments.filter(p => p.symbol == e.value);
              this.setState({ symbol: symbol });
              let url = "https://www.icharts.in/opt/api/getExpiryDates_Api.php?sym=" + e.value + "&sym_type=" + symbol[0].symbol_type;
              this.setState({ isBusy: true })
              axios.get(url, { withCredentials: false })
                .then(response => {
                  let data = response.data;
                  this.setState({ expiryDateList: data, isBusy: false });
                }).catch(err => {
                  this.setState({ expiryDateList: err.response.data });
                });
            }} /></div>
            <div className="flex-item date-dropdown"><Dropdown value={this.state.selectedExpiryDate} optionValue="expiry_dates" optionLabel="expiry_dates" options={this.state.expiryDateList}
              onChange={(e) => {
                this.setState({ selectedExpiryDate: e.value })
                let symbol = this.SymbolWithMarketSegments.filter(p => p.symbol == this.state.selectedsymbol);
                this.setState({ symbol: symbol })
                let url = "https://www.icharts.in/opt/api/SymbolDetails_Api.php?sym=" + symbol[0].symbol + "&exp_date=" + e.value + "&sym_type=" + symbol[0].symbol_type;
                this.setState({ isBusy: true });
                axios.get(url, { withCredentials: false })
                  .then(response => {
                    let data = response.data;
                    if (data.length > 0) {
                      let record = data[0];
                      this.setState({
                        spotPrice: record.spot_price,
                        futPrice: record.fut_price,
                        lotSize: record.lot_size,
                        avgiv: record.avgiv,
                        ivr: record.ivr,
                        ivp: record.ivp,
                        fairPrice: record.fair_price,
                        isBusy: false
                      }, () => this.refreshOptionData());
                    }

                  }).catch(err => {
                    console.log(err);
                  });
              }

              } /></div>
            <div className="flex-item"><Button className='smallButton' onClick={() => {
              this.setState({
                openSaveDialog: true
              });

              // console.log(this.state.openSaveDialog)

            }}>Save</Button></div>
            <div className="flex-item"><Button className='smallButton' onClick={() => {
              this.setState({
                openSaveDialog: true
              });

              // console.log(this.state.openSaveDialog)

            }}>Load</Button></div>
            <div className="flex-item"><Button className='smallButton'>Trade</Button></div>
          </div>
          <div className='secondLine'>
            <div className='flex-item'>Fair Price:</div>
            <div className='flex-item'>{this.state.fairPrice}</div>
            <div className='flex-item'>Future Price:</div>
            <div className='flex-item'>{this.state.futPrice}</div>
            <div className='flex-item'>Spot Price:</div>
            <div className='flex-item'>{this.state.spotPrice}</div>
            <div className='flex-item'>Lot Size:</div>
            <div className='flex-item'>{this.state.lotSize}</div>
            <div className='flex-item'>IV:</div>
            <div className='flex-item'>{this.state.avgiv}</div>
            <div className='flex-item'>IVR:</div>
            <div className='flex-item'>{this.state.ivr}</div>
            <div className='flex-item'>IVP:</div>
            <div className='flex-item'>{this.state.ivp}</div>
          </div>
        </div>

        {/* list of available positions */}
        <div className="col-5 lg:col-5">
          <div className="p-card flex flex-column"  >
            <DataTable value={this.state.records} responsiveLayout="scroll" scrollHeight="calc(100vh - 160px)" showGridlines >
              <Column style={{ width: '12%' }} field='Call_LTP' header="LTP"></Column>
              <Column style={{ width: '32%' }} header="Call" body={this.callTemplate}></Column>
              <Column style={{ width: '12%' }} field="Strike_Price" header="Strike"></Column>
              <Column style={{ width: '32%' }} header="Put" body={this.putTemplate}></Column>
              <Column style={{ width: '12%' }} field="Put_LTP" header="LTP"></Column>
            </DataTable>
          </div>
        </div>
        {/* right side: charts and selected poistion table  */}
        <div className="col-7 lg:col-7">
          <div className="card">
            <div className="p-card">
              <div className="flex">
                <div className="col-12 lg:col-12">
                  <PayoffChart data={this.state} ></PayoffChart>
                </div>

              </div>
            </div>
            <div className="p-card">
              <div className="flex" >
                <div className="p-card col-4 lg:col-4">
                  <div className='flex flex-space-between'>
                    <div>Max Profit</div>
                    <div>{this.maxProfit()}</div>
                  </div>
                  <div className='flex flex-space-between'>
                    <div>Max Loss</div>
                    <div>{this.maxLoss()}</div>
                  </div>
                  <div className='flex flex-space-between'>
                    <div>Break Even</div>
                    <div>100</div>
                  </div>
                  <div className='flex flex-space-between'>
                    <div>RR</div>
                    <div>200</div>
                  </div>
                  <div className='flex flex-space-between'>
                    <div>Net Profit</div>
                    <div>400</div>
                  </div>
                  <div className='flex flex-space-between'>
                    <div>Estimate Margin</div>
                    <div>300</div>
                  </div>
                  <div className='flex flex-space-between'>
                    <div>Total P&L</div>
                    <div>200</div>
                  </div>
                </div>
                <div className="col-8 lg:col-8">
                  <div className="p-card" id='selectedList'>
                    <DataTable value={this.state.legEntityList} responsiveLayout="scroll" >
                      <Column body={this.lotTemplate}></Column>
                      <Column body={this.state.selectedExpiryDate}></Column>
                      <Column field="Strike_Price"></Column>
                      <Column field="CE_PE"></Column>
                      <Column body={this.buttonTemplate}></Column>
                      <Column body={this.optionPriceTemplate}></Column>
                      <Column body={this.IVTemplate}></Column>
                      <Column body={this.deleteTemplate}></Column>
                    </DataTable>
                  </div>
                </div>
              </div>
            </div>
            <p></p>

          </div>
        </div>

        {
          this.state.openSaveDialog ? <div>
            <SaveDialog closed={() => { this.setState({ openSaveDialog: false }) }} /></div> : null
        }

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
          // console.log(rowData)
          this.setState({ records: this.state.records });
          this.generateStrategyList();
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

          this.setState({ records: this.state.records });
          this.generateStrategyList();
        }}>S</button>
      </div>
      <div style={rowData.Call_Lot ? { display: 'block' } : { display: 'none' }}>
        <input type="number" min={1} max={5000} className='smallText' onChange={(event) => { rowData.Call_Lot = Number.parseInt(event.target.value); this.setState({ records: this.state.records }, ()=>this.generateStrategyList()); }} value={rowData.Call_Lot}></input>
      </div>
    </div>)
  }

  putTemplate = (rowData: OptionChain) => {
    return (<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
      <div style={rowData.Put_Lot ? { display: 'block' } : { display: 'none' }}>
        <input type="number" min={1} max={5000} className='smallText'
          onChange={(event) => { rowData.Put_Lot = Number.parseInt(event.target.value); this.setState({ records: this.state.records }, ()=>this.generateStrategyList()); }} value={rowData.Put_Lot}></input>
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
            // console.log(rowData);
            this.setState({ records: this.state.records });
            this.generateStrategyList();
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

          this.setState({ records: this.state.records });
          this.generateStrategyList();
        }}>S</button>
      </div>
    </div>)
  }

  generateStrategyList = () => {
    let list1 = this.state.records.filter(p => p.Buy_Call == true || p.Sell_Call == true);
    let list2 = this.state.records.filter(p => p.Buy_Put == true || p.Sell_Put == true);

    let positionList = [];
    list1.forEach(rowData => {
      let position = new LegEntity();

      position.Position_Lot = rowData.Call_Lot

      if (rowData.Buy_Call || rowData.Sell_Call) {
        position.CE_PE = "CE";
        position.Option_Price = rowData.Call_LTP.valueOf();
      }


      if (rowData.Buy_Call) {
        position.Buy_Sell = "Buy";
      }

      if (rowData.Sell_Call) {
        position.Buy_Sell = "Sell";
      }
      position.IV = rowData.Call_IV;

      position.Strike_Price = rowData.Strike_Price;
      positionList.push(position);
    })

    list2.forEach(rowData => {
      let position = new LegEntity();
     position.Position_Lot = rowData.Put_Lot

      if (rowData.Buy_Put || rowData.Sell_Put) {
        position.CE_PE = "PE";
        position.Option_Price = rowData.Put_LTP.valueOf();
      }


      if (rowData.Buy_Put) {
        position.Buy_Sell = "Buy";
      }

      if (rowData.Sell_Put) {
        position.Buy_Sell = "Sell";
      }

      position.IV = rowData.Put_IV;
      position.Strike_Price = rowData.Strike_Price;
      positionList.push(position);
    })


    this.setState({ legEntityList: positionList })
  }

  lotTemplate = (rowData: LegEntity) => {
    if (rowData.Buy_Sell == 'Sell') {
      return "-" + rowData.Position_Lot + "x" + this.state.lotSize;
    } else {
      return "+" + rowData.Position_Lot + "x" + this.state.lotSize;
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
          this.setState({ legEntityList: this.state.legEntityList });
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
        let list = this.state.legEntityList;
        const index = list.indexOf(rowData, 0);
        if (index > -1) {
          list.splice(index, 1);
        }
        this.setState({ legEntityList: list, records: this.state.records });
        this.convertLegToOptionChain();
      }}></Button>
  }

  convertLegToOptionChain=()=>{
    let legList: Array<LegEntity> = this.state.legEntityList;
    let optionList: Array<OptionChain> = this.state.records;
    //reset to inital state so it can be set by legs
    optionList.forEach(p=>{
      p.Buy_Call=null;
      p.Sell_Call=null;  
      p.Buy_Put=null;
      p.Sell_Put=null;

      p.Call_Lot=null;
      p.Put_Lot=null;
    });

    legList.forEach(leg=>{
      let selectedOptionList = optionList.filter(chain=>leg.Strike_Price==chain.Strike_Price);
      for(let optionSelected of selectedOptionList){
        if (leg.Buy_Sell=='Buy'){
          if(leg.CE_PE=='CE'){
            optionSelected.Buy_Call=true;
            optionSelected.Call_Lot=leg.Position_Lot;
          } else {
            optionSelected.Buy_Put=true;
            optionSelected.Put_Lot=leg.Position_Lot;
          }
        } else {
          if(leg.CE_PE=='CE'){
            optionSelected.Sell_Call=true;
            optionSelected.Call_Lot=leg.Position_Lot;
          } else {
            optionSelected.Sell_Put=true;
            optionSelected.Put_Lot=leg.Position_Lot;
          }
        }  
      }
    });

    this.setState({records:optionList});
  }

  maxProfit = () => {
    let strategyEntityList = this.state.legEntityList;

    return 100;
  }

  maxLoss = () => {
    let strategyEntityList = this.state.legEntityList;

    return 100;
  }
}