import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import OptionService from '../service/OptionService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button, Calendar, Checkbox, Dialog, Dropdown, InputNumber, InputText, Panel, SelectButton, TabPanel, TabView } from 'primereact';
import { Position } from 'src/entity/position';
import { StrategyEntity } from 'src/entity/StrategyEntity';
import { v4 as uuidv4 } from 'uuid';
import { SaveDialog } from './SaveDialog';
import axios from "axios";

interface Props {

}

interface State {
  records: StrategyEntity[];
  positions: Position[];
  selectedsymbol: string;
  strategyEntityList: StrategyEntity[];
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
      fairPrice: null
    }

    // const optionService = new OptionService();

    // optionService.getOptions()
    //   .then(data => {
    //     this.setState({ records: data });
    //   });
  }

  callTemplate = (rowData: StrategyEntity) => {
    return (<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
      <div>
        <button className='smallGreenButton' style={{ backgroundColor: rowData.callBuy == true ? 'green' : 'white', color: rowData.callBuy == true ? 'white' : 'black' }} onClick={(event) => {
          if (rowData.callBuy) {
            rowData.callLots = null;
            rowData.callBuy = false;
          } else {
            rowData.callLots = 1;
            rowData.callBuy = true;
          }
          this.setState({ records: this.state.records });
          this.generateStrategyList();
        }}>B</button>
      </div>
      <div>
        <button className='smallRedButton' style={{ backgroundColor: rowData.callSell == true ? 'red' : 'white', color: rowData.callSell == true ? 'white' : 'black' }} onClick={() => {
          if (rowData.callSell) {
            rowData.callLots = null;
            rowData.callSell = false;
          } else {
            rowData.callLots = 1;
            rowData.callSell = true;
          }

          this.setState({ records: this.state.records });
          this.generateStrategyList();
        }}>S</button>
      </div>
      <div style={rowData.callLots ? { display: 'block' } : { display: 'none' }}>
        <input type="number" min={1} max={5000} className='smallText' onChange={(event) => { rowData.callLots = Number.parseInt(event.target.value); this.setState({ records: this.state.records }); }} value={rowData.callLots}></input>
      </div>
    </div>)
  }

  putTemplate = (rowData: StrategyEntity) => {
    return (<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
      <div style={rowData.putLots ? { display: 'block' } : { display: 'none' }}>
        <input type="number" min={1} max={5000} className='smallText' onChange={(event) => { rowData.putLots = Number.parseInt(event.target.value); this.setState({ records: this.state.records }); }} value={rowData.putLots}></input>
      </div>
      <div>
        <button className='smallGreenButton' style={{ backgroundColor: rowData.putBuy == true ? 'green' : 'white', color: rowData.putBuy == true ? 'white' : 'black' }}
          onClick={() => {
            if (rowData.putBuy) {
              rowData.putLots = null;
              rowData.putBuy = false;
            } else {
              rowData.putLots = 1;
              rowData.putBuy = true;
              rowData.putSell = null;
            }
            this.setState({ records: this.state.records });
            this.generateStrategyList();
          }}>B</button>
      </div>
      <div><button className='smallRedButton' style={{ backgroundColor: rowData.putSell == true ? 'red' : 'white', color: rowData.putSell == true ? 'white' : 'black' }}
        onClick={() => {
          if (rowData.putSell) {
            rowData.putLots = null;
            rowData.putSell = false;
          } else {
            rowData.putLots = 1;
            rowData.putSell = true;
            rowData.putBuy = null;
          }
          this.setState({ records: this.state.records });
          this.generateStrategyList();
        }}>S</button>
      </div>
    </div>)
  }

  generateStrategyList = () => {
    let list = this.state.records.filter(p => p.callBuy || p.putBuy || p.callSell || p.putSell);
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
        <div className="col-12 lg:col-12">
          <div className='p-card secondLine'>
            <div className="flex-item symbol-dropdown" ><Dropdown value={this.state.selectedsymbol} options={this.state.SymbolList} onChange={(e) => {
              this.setState({ selectedsymbol: e.value });
              let symbol = this.SymbolWithMarketSegments.filter(p => p.symbol == e.value);
              let url = "https://www.icharts.in/opt/api/getExpiryDates_Api.php?sym=" + e.value + "&sym_type=" + symbol[0].symbol_type;
              axios.get(url, { withCredentials: false })
                .then(response => {
                  let data = response.data;
                  this.setState({ expiryDateList: data });
                }).catch(err => {
                  console.log(err);
                  console.log(err.response.data);
                  this.setState({ expiryDateList: err.response.data });
                });
            }} /></div>
            <div className="flex-item date-dropdown"><Dropdown value={this.state.selectedEporyDate} optionValue="expiry_dates" optionLabel="expiry_dates" options={this.state.expiryDateList}
              onChange={(e) => {
                this.setState({ selectedEporyDate: e.value })
                let symbol = this.SymbolWithMarketSegments.filter(p => p.symbol == this.state.selectedsymbol);
                console.log(symbol);
                let url = "https://www.icharts.in/opt/api/SymbolDetails_Api.php?sym=" + symbol[0].symbol + "&exp_date=" + e.value + "&sym_type=" + symbol[0].symbol_type;
                console.log(url);
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
                        fairPrice: record.fair_price
                      });
                    }

                  }).catch(err => {
                    console.log(err);
                  });

                let urlDetail = "https://www.icharts.in/opt/api/OptionChain_Api.php?sym=" + symbol[0].symbol + "&exp_date=" + e.value + "&sym_type=" + symbol[0].symbol_type;
                axios.get(urlDetail, { withCredentials: false })
                  .then(response => {
                    console.log(response)
                    let data = response.data;
                    console.log(data);
                    this.setState({
                      records: data
                    })
                  }
                  )

              }

              } /></div>
            <div className="flex-item"><Button onClick={() => {
              this.setState({
                openSaveDialog: true
              });

              console.log(this.state.openSaveDialog)

            }}>Save</Button></div>
            <div className="flex-item"><Button onClick={() => {
              this.setState({
                openSaveDialog: true
              });

              console.log(this.state.openSaveDialog)

            }}>Load</Button></div>
            <div className="flex-item"><Button >Trade</Button></div>
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


  positionTemplate = (rowData: StrategyEntity) => {
    let str;
    if (rowData.callSell) {
      str = "-" + rowData.callLots + "x" + this.state.lotSize;
    }
    if (rowData.callBuy) {
      str = "+" + rowData.callLots + "x" + this.state.lotSize;
    }
    if (rowData.putSell) {
      str = "-" + rowData.putLots + "x" + this.state.lotSize;
    }
    if (rowData.putBuy) {
      str = "+" + rowData.putLots + "x" + this.state.lotSize;
    }

    return str;
  }

  CEPETemplate = (rowData: StrategyEntity) => {
    if (rowData.callBuy || rowData.callSell) {
      return "CE";
    }

    if (rowData.putBuy || rowData.putSell) {
      return "PE";
    }

    return null;
  }

  buttonTemplate = (rowData: StrategyEntity) => {
    if (rowData.callBuy || rowData.putBuy) {
      return <button className='selected-button-buy'>B</button>
    }
    if (rowData.callSell || rowData.putSell) {
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
        }} value={(rowData.putBuy || rowData.putSell)? rowData.Put_Ask:rowData.Call_Ask}></input>
    )
  }

  IVTemplate = (rowData: StrategyEntity) => {
    return "IV: " + this.state.ivp;
  }

  deleteTemplate = (rowData: StrategyEntity) => {
    return <Button icon="pi  pi-trash" className='p-button-text' style={{ height: '20px' }}
      onClick={() => {
        rowData.putLots = null;
        rowData.callLots = null;
        rowData.putSell = null;
        rowData.putBuy = null;
        rowData.callSell = null;
        rowData.callBuy = null;
        this.setState({ records: this.state.records });
        this.generateStrategyList();
      }}></Button>
  }

  maxProfit = () => {
    let strategyEntityList = this.state.strategyEntityList;

    let buyCallList = strategyEntityList.filter(p => p.callBuy && p.callBuy == true);
    let sellCallList = strategyEntityList.filter(p => p.callSell && p.callSell == true);
    if (buyCallList.length > 0 && sellCallList.length == 0) {
      return "Unlimited";
    }

    let buyPutList = strategyEntityList.filter(p => p.putBuy && p.putBuy == true);
    let sellPutList = strategyEntityList.filter(p => p.putSell && p.putSell == true);
    if (buyPutList.length > 0 && sellPutList.length == 0) {
      return "Unlimited";
    }


    return 100;
  }

  maxLoss = () => {
    let strategyEntityList = this.state.strategyEntityList;
    let sellCallList = strategyEntityList.filter(p => p.callSell == true);
    let buyCallList = strategyEntityList.filter(p => p.callBuy == true);
    if (sellCallList.length > 0 && buyCallList.length == 0) {
      return "Unlimited";
    }

    let sellPutList = strategyEntityList.filter(p => p.putSell == true);
    let buyPutList = strategyEntityList.filter(p => p.putBuy == true);
    if (sellPutList.length > 0 && buyPutList.length == 0) {
      return "Unlimited";
    }

    return 100;
  }
}