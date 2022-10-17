import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import OptionService from '../service/OptionService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button, Calendar, Checkbox, Dialog, Dropdown, InputNumber, InputText, Panel, SelectButton, TabPanel, TabView } from 'primereact';
import { Position } from 'src/entity/position';
import { v4 as uuidv4 } from 'uuid';
import { SaveDialog } from './SaveDialog';
import axios from "axios";
import { OptionChain } from 'src/entity/OptionChain';
import { CircleSpinnerOverlay, FerrisWheelSpinner } from 'react-spinner-overlay';

interface Props {

}

interface State {
  records: OptionChain[];
  positions: Position[];
  selectedsymbol: string;
  strategyEntityList: OptionChain[];
  openSaveDialog: boolean;
  SymbolList;
  expiryDateList;
  selectedEporyDate;
  spotPrice;
  futPrice;
  lotSize;
  avgiv;
  ivr;
  ivp;
  fairPrice;
  isBusy: boolean
}

export class StrategyBuilder extends React.Component<Props, State> {



  basicData: { labels: string[]; datasets: { label: string; data: number[]; fill: boolean; borderColor: string; tension: number; }[]; };
  SymbolWithMarketSegments: any;
  constructor(props: Props) {
    super(props);

    this.state = {
      records: null,
      positions: [],
      selectedsymbol: 'Nifty',
      strategyEntityList: [],
      openSaveDialog: false,
      SymbolList: [],
      expiryDateList: [],
      selectedEporyDate: null,
      spotPrice: null,
      futPrice: null,
      lotSize: null,
      avgiv: null,
      ivr: null,
      ivp: null,
      fairPrice: null,
      isBusy:false
    }

    // const optionService = new OptionService();

    // optionService.getOptions()
    //   .then(data => {
    //     this.setState({ records: data });
    //   });
  }

  callTemplate = (rowData: OptionChain) => {
    return (<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
      <div>
        <button className='smallGreenButton' style={{ backgroundColor: rowData.Buy_Call == true ? 'green' : 'white', color: rowData.Buy_Call == true ? 'white' : 'black' }} onClick={(event) => {
          if (rowData.Buy_Call) {
            rowData.Call_Lot = null;
            rowData.Buy_Call = false;
          } else {
            rowData.Call_Lot = 1;
            rowData.Buy_Call = true;
            rowData.Sell_Call = null;
          }
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
            }

          this.setState({ records: this.state.records });
          this.generateStrategyList();
        }}>S</button>
      </div>
      <div style={rowData.Call_Lot ? { display: 'block' } : { display: 'none' }}>
        <input type="number" min={1} max={5000} className='smallText' onChange={(event) => { rowData.Call_Lot = Number.parseInt(event.target.value); this.setState({ records: this.state.records }); }} value={rowData.Call_Lot}></input>
      </div>
    </div>)
  }

  putTemplate = (rowData: OptionChain) => {
    return (<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
      <div style={rowData.Put_Lot ? { display: 'block' } : { display: 'none' }}>
        <input type="number" min={1} max={5000} className='smallText' onChange={(event) => { rowData.Put_Lot = Number.parseInt(event.target.value); this.setState({ records: this.state.records }); }} value={rowData.Put_Lot}></input>
      </div>
      <div>
        <button className='smallGreenButton' style={{ backgroundColor: rowData.Buy_Put == true ? 'green' : 'white', color: rowData.Buy_Put == true ? 'white' : 'black' }}
          onClick={() => {
            if (rowData.Buy_Put) {
              rowData.Put_Lot = null;
              rowData.Buy_Put = false;
            } else {
              rowData.Put_Lot = 1;
              rowData.Buy_Put = true;
              rowData.Sell_Put = null;
            }
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
          }
          this.setState({ records: this.state.records });
          this.generateStrategyList();
        }}>S</button>
      </div>
    </div>)
  }

  generateStrategyList = () => {
    let list = this.state.records.filter(p => p.Buy_Call || p.Buy_Put || p.Sell_Call || p.Sell_Put);
    this.setState({ strategyEntityList: list })
  }

  componentDidMount = () => {
    axios.get("https://www.icharts.in/opt/api/Symbol_List_Api.php", { withCredentials: false })
      .then(response => {
        let data = response.data;
        this.SymbolWithMarketSegments = data;
        let arr = data.map(p => p.symbol);
        this.setState({
          SymbolList: arr
        })
      });
  }

  render() {
    
    this.basicData = {
      labels: ['600', '800', '1000', '1200', '1400', '1600', '1800'],
      datasets: [
        {
          label: 'P/L',
          data: [-65, 59, 80, 80, 80, 80],
          fill: true,
          borderColor: '#42A5F5',
          tension: 0
        }
      ]
    };
    let basicOptions = {
      maintainAspectRatio: false,
      aspectRatio: 1,
      plugins: {
        legend: {
          labels: {
            color: '#495057'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        },
        y: {
          ticks: {
            color: '#495057'
          },
          grid: {
            color: '#ebedef'
          }
        }
      }
    };

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
              let url = "https://www.icharts.in/opt/api/getExpiryDates_Api.php?sym=" + e.value + "&sym_type=" + symbol[0].symbol_type;
              this.setState({isBusy:true})
              axios.get(url, { withCredentials: false })
                .then(response => {
                  let data = response.data;
                  this.setState({ expiryDateList: data, isBusy:false });
                }).catch(err => {
                  this.setState({ expiryDateList: err.response.data });
                });
            }} /></div>
            <div className="flex-item date-dropdown"><Dropdown value={this.state.selectedEporyDate} optionValue="expiry_dates" optionLabel="expiry_dates" options={this.state.expiryDateList}
              onChange={(e) => {
                this.setState({ selectedEporyDate: e.value })
                let symbol = this.SymbolWithMarketSegments.filter(p => p.symbol == this.state.selectedsymbol);
                console.log(symbol);
                let url = "https://www.icharts.in/opt/api/SymbolDetails_Api.php?sym=" + symbol[0].symbol + "&exp_date=" + e.value + "&sym_type=" + symbol[0].symbol_type;
                this.setState({isBusy:true});
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
                        isBusy:false
                      });
                    }

                  }).catch(err => {
                    console.log(err);
                  });

                let urlDetail = "https://www.icharts.in/opt/api/OptionChain_Api.php?sym=" + symbol[0].symbol + "&exp_date=" + e.value + "&sym_type=" + symbol[0].symbol_type;
                this.setState({isBusy:true});
                axios.get(urlDetail, { withCredentials: false })
                  .then(response => {
                    console.log(response)
                    let data = response.data;
                    console.log(data);
                    this.setState({
                      records: data,
                      isBusy:false
                    })
                  }
                  )

              }

              } /></div>
            <div className="flex-item"><Button className='smallButton' onClick={() => {
              this.setState({
                openSaveDialog: true
              });

              console.log(this.state.openSaveDialog)

            }}>Save</Button></div>
            <div className="flex-item"><Button className='smallButton' onClick={() => {
              this.setState({
                openSaveDialog: true
              });

              console.log(this.state.openSaveDialog)

            }}>Load</Button></div>
            <div className="flex-item"><Button className='smallButton'>Trade</Button></div>
          </div>
          <div className='secondLine'>

            <div className='flex-item'>Spot Price:</div>
            <div className='flex-item'>{this.state.spotPrice}</div>
            <div className='flex-item'>Lot Size:</div>
            <div className='flex-item'>{this.state.lotSize}</div>
            <div className='flex-item'>Avergae Price:</div>
            <div className='flex-item'>{this.state.avgiv}</div>
            <div className='flex-item'>IVR:</div>
            <div className='flex-item'>{this.state.ivr}</div>
            <div className='flex-item'> IVP:</div>
            <div className='flex-item'>{this.state.ivp}</div>
            <div className='flex-item'>Fair Price:</div>
            <div className='flex-item'>{this.state.fairPrice}</div>
          </div>
        </div>
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
        <div className="col-7 lg:col-7">
          <div className="flex flex-column" >
            <TabView className='tabview'>
              <TabPanel header="Payoff">
                <div className="p-card">
                  <Chart type="line" data={this.basicData} options={basicOptions} />
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
                        <DataTable value={this.state.strategyEntityList} responsiveLayout="scroll" >
                          <Column body={this.positionTemplate}></Column>
                          <Column body={this.state.selectedEporyDate}></Column>
                          <Column field="Strike_Price"></Column>
                          <Column body={this.CEPETemplate}></Column>
                          <Column body={this.buttonTemplate}></Column>
                          <Column body={this.optionPriceTemplate}></Column>
                          <Column body={this.IVTemplate}></Column>
                          <Column body={this.deleteTemplate}></Column>
                        </DataTable>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
              <TabPanel header="Greeks">
                <div className="p-card">
                  <Chart type="line" data={this.basicData} options={basicOptions} />
                </div>
                <div className="p-card">
                  <div className="flex" >
                    <div className="p-card col-4 lg:col-4">
                      <div className='flex flex-space-between'>
                        <div>Delta</div>
                        <div>{this.maxProfit()}</div>
                      </div>
                      <div className='flex flex-space-between'>
                        <div>Theta</div>
                        <div>{this.maxLoss()}</div>
                      </div>
                      <div className='flex flex-space-between'>
                        <div>Gamma</div>
                        <div>100</div>
                      </div>
                      <div className=' flex flex-space-between'>
                        <div>Vega</div>
                        <div>200</div>
                      </div>
                      <div className=' flex flex-space-between'>
                        <div>PoP</div>
                        <div>400</div>
                      </div>
                    </div>
                    <div className="col-8 lg:col-8">
                      <div className="p-card" id='selectedList'>
                        <DataTable value={this.state.strategyEntityList} responsiveLayout="scroll" >
                          <Column body={this.positionTemplate}></Column>
                          <Column body={this.state.selectedEporyDate}></Column>
                          <Column field="Strike"></Column>
                          <Column body={this.CEPETemplate}></Column>
                          <Column body={this.buttonTemplate}></Column>
                          <Column body={this.optionPriceTemplate}></Column>
                          <Column body={this.IVTemplate}></Column>
                          <Column body={this.deleteTemplate}></Column>
                        </DataTable>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
            </TabView>
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


  positionTemplate = (rowData: OptionChain) => {
    let str;
    if (rowData.Sell_Call) {
      str = "-" + rowData.Call_Lot + "x" + this.state.lotSize;
    }
    if (rowData.Buy_Call) {
      str = "+" + rowData.Call_Lot + "x" + this.state.lotSize;
    }
    if (rowData.Sell_Put) {
      str = "-" + rowData.Put_Lot + "x" + this.state.lotSize;
    }
    if (rowData.Buy_Put) {
      str = "+" + rowData.Put_Lot + "x" + this.state.lotSize;
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
        }} value={(rowData.Buy_Put || rowData.Sell_Put)? rowData.Put_Ask:rowData.Call_Ask}></input>
    )
  }

  IVTemplate = (rowData: OptionChain) => {
    return "IV: " + this.state.ivp;
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
        this.setState({ records: this.state.records });
        this.generateStrategyList();
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