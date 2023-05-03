import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import OptionService from '../service/OptionService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button, Calendar, Checkbox, Dialog, Dropdown, InputNumber, InputText, Panel, SelectButton, Splitter, SplitterPanel, TabPanel, TabView } from 'primereact';
import { v4 as uuidv4 } from 'uuid';
import { DialogSave } from './DialogSave';
import axios from "axios";
import { OptionChain } from 'src/entity/OptionChain';
import { CircleSpinnerOverlay, FerrisWheelSpinner } from 'react-spinner-overlay';
import { OptData, OptHeader, OptLeg, WhatIf } from 'src/entity/OptData';
import { PLCalc } from 'src/utils/PLCalc';
import { PayoffChartComponent } from './PayoffChartComponent';
import { LegEntity } from 'src/entity/LegEntity';
import '../component/Simulator.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import { chain, number } from 'mathjs';
import { threadId } from 'worker_threads';
import { PLComputeCompoenent } from './PLComputeCompoenent';
import { LegComponent } from './LegComponent';
import { OptionChainComponent } from './OptionChainComponent';
import { DialogLoad } from './DialogLoad';
import { StrategyProfile } from 'src/entity/StretegyProfile';
import { Utility } from 'src/utils/Utility';
interface Props {

}

interface State {
  records: OptionChain[];
  selectedsymbol: string;
  legEntityList: LegEntity[];
  openSaveDialog: boolean;
  openLoadDialog: boolean;
  SymbolList;
  expiryDateList;
  selectedExpiryDate;
  // spotPrice;
  futPrice;
  lotSize;
  avgiv;
  ivr;
  ivp;
  fairPrice;
  isBusy: boolean;
  symbol;
  chartData;
  closest;
  strategyProfile: StrategyProfile;
  classChain: string;
  classRight: string;
  // classPayoff:string;
  // classLeg:string;
  chainShowed: boolean;
  payoffChartShowed: boolean;
  exitedLegList: [],
  strategyId: string;
  latestRefreshDate: Date;
  whatif: WhatIf;
  lastUpdate:Date;
}

export class StrategyBuilder extends React.Component<Props, State> {
  basicData: { labels: string[]; datasets: { label: string; data: number[]; fill: boolean; borderColor: string; tension: number; }[]; };
  SymbolWithMarketSegments: any;
  interval: NodeJS.Timer;

  classPayoff: string;
  classLeg: string;
  constructor(props: Props) {
    super(props);

    this.state = {
      records: [],
      selectedsymbol: 'NIFTY',
      legEntityList: [],
      openSaveDialog: false,
      openLoadDialog: false,
      SymbolList: [],
      expiryDateList: [],
      selectedExpiryDate: null,
      //   spotPrice: null,
      futPrice: null,
      lotSize: null,
      avgiv: null,
      ivr: null,
      ivp: null,
      fairPrice: null,
      isBusy: false,
      symbol: null,
      chartData: null,
      closest: null,
      strategyProfile: null,
      classChain: "col-5 lg:col-5 ",
      classRight: "col-7 lg:col-7",

      chainShowed: true,
      payoffChartShowed: true,
      exitedLegList: [],
      strategyId: null,
      latestRefreshDate: null,
      whatif: null,
      lastUpdate:null
    }

    this.classPayoff = "p-card col-12 lg:col-12";
    this.classLeg = "p-card col-12 lg:col-12";
  }

  componentDidMount = () => {
    this.loadsymbolListAndExpiryList();
    this.setCounter();

    document.addEventListener('keydown', event => {

      // event.preventDefault();
      this.stopCounter();
      this.setCounter();

    });

    document.addEventListener('click', event => {
      // event.preventDefault();
      this.stopCounter();
      this.setCounter();
    });

    if(this.state.lastUpdate!=null  && this.state.latestRefreshDate>this.state.lastUpdate){
      this.setState({latestRefreshDate:this.state.lastUpdate},()=>console.log(this.state))
    }
  }

  stopCounter = () => {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  setCounter = () => {
    this.interval = setInterval(() => {
      this.refreshData();
  //    this.refreshOptionData();
    //  this.onExpiryDateChange(this.state.selectedExpiryDate,false);
    }, 30000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.setState({
      exitedLegList: []
    })
  }

  onExpiryDateChange = (date, displayBusy = true) => {
    this.setState({ selectedExpiryDate: date })
    let symbol = this.SymbolWithMarketSegments.filter(p => p.symbol == this.state.selectedsymbol);
    this.setState({ symbol: symbol })
    let url = "https://www.icharts.in/opt/api/SymbolDetails_Api.php?sym=" + symbol[0].symbol + "&exp_date=" + date + "&sym_type=" + symbol[0].symbol_type;
    if (displayBusy)
      this.setState({ isBusy: true, legEntityList: [] });
    axios.get(url, { withCredentials: false })
      .then(response => {
        let data = response.data;
        //      console.log(data);
        if (data.length > 0) {
          let record = data[0];
          let latestRefreshDate = new Date();
          if (latestRefreshDate > new Date(record.last_updated)) {
            latestRefreshDate = new Date(record.last_updated);
          }
          this.setState({
            //       spotPrice: record.spot_price,
            futPrice: record.fut_price,
            lotSize: record.lot_size,
            avgiv: record.avgiv,
            ivr: record.ivr,
            ivp: record.ivp,
            fairPrice: record.fair_price,
            isBusy: false,
            strategyProfile: null,
            legEntityList: [],
            exitedLegList: [],
            lastUpdate: latestRefreshDate,
            latestRefreshDate: latestRefreshDate
          }, () => this.refreshOptionData());
        }

      }).catch(err => {
        console.log(err);
      });
  }

  loadsymbolListAndExpiryList = () => {
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
            this.setState({ expiryDateList: data, isBusy: false, selectedExpiryDate: data[0]["expiry_dates"] }, () => this.onExpiryDateChange(data[0]["expiry_dates"]));
          }).catch(err => {
            this.setState({ expiryDateList: err.response.data });
          });
      });
  }

  refreshData=()=>{
    let sym=this.state.symbol;
      let url = "https://www.icharts.in/opt/api/SymbolDetails_Api.php?sym=" + this.state.selectedsymbol+ "&exp_date=" + this.state.selectedExpiryDate + "&sym_type=" + sym[0].symbol_type;
     axios.get(url, { withCredentials: false })
     .then(response => {
       let data = response.data;
       if (data.length > 0) {
         let record = data[0];
         let latestRefreshDate = new Date();
         if (latestRefreshDate > new Date(record.last_updated)) {
           latestRefreshDate = new Date(record.last_updated);
         }
         this.setState({
           futPrice: record.fut_price,
           lotSize: record.lot_size,
           avgiv: record.avgiv,
           ivr: record.ivr,
           ivp: record.ivp,
           fairPrice: record.fair_price,
           isBusy: false,
           strategyProfile: null,
           lastUpdate: latestRefreshDate,
           latestRefreshDate: latestRefreshDate
         }, () => this.refreshOptionData(true));
       }

     }).catch(err => {
       console.log(err);
     });
  }

  refreshOptionData = (fromTimer=false) => {
    let urlDetail = "https://www.icharts.in/opt/api/OptionChain_Api.php?sym=" + this.state.symbol[0].symbol + "&exp_date=" + this.state.selectedExpiryDate + "&sym_type=" + this.state.symbol[0].symbol_type;
    // this.setState({ isBusy: true });
    axios(urlDetail, { withCredentials: false })
      .then(response => {
        let data = response.data;
        if (this.state.records != null && data != null) {
          let isEqual = Utility.objectsEqual(data,this.state.records);
       //   console.log(isEqual)
          if (isEqual) {
            this.setState({
              isBusy: false,
            });
            return;
          }
        }

        this.setState({
          records: data,
          isBusy: false,
        }, () => {
           // console.log(this.state);
            this.convertLegToOptionChain();
            if (data == null) return;
            if(fromTimer) return;

            let strikePriceArray = data.map(p => p.Strike_Price);
            let closest = PLCalc.findClosest(strikePriceArray, this.state.fairPrice);
            let tbody = document.querySelector('.optionList .p-datatable-wrapper .p-datatable-table .p-datatable-tbody');
            let trs = tbody.querySelectorAll('tr');
            let len = trs.length;

            if (len > 40) {
              for (let i = 0; i < len; i++) {
                if (trs[i].innerHTML.indexOf(closest) > -1) {
                  if (i > 13)
                    trs[i - 13]?.scrollIntoView();
                  else {
                    trs[i - 10]?.scrollIntoView();
                  }
                  break;
                }
              }
            }
          })
      }
      )
  }

  render() {
    return (
      <div className="grid p-fluid">
        <div>
          {this.state.isBusy ? <CircleSpinnerOverlay loading={true} overlayColor="rgba(0,153,255,0.2)" /> : null}
        </div>
        <div className="col-12">
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
                  let expiry = data != null && data.length > 0 ? data[0]['expiry_dates'] : null;
                  this.setState({ expiryDateList: data, isBusy: false, records: [], selectedExpiryDate: expiry });
                  if (expiry != null) {
                    this.onExpiryDateChange(expiry);
                  }
                }).catch(err => {
                  this.setState({ expiryDateList: err.response.data });
                });
            }} /></div>
            <div className="flex-item date-dropdown"><Dropdown value={this.state.selectedExpiryDate} optionValue="expiry_dates" optionLabel="expiry_dates" options={this.state.expiryDateList}
              onChange={(e) => {
                this.onExpiryDateChange(e.value);
              }} /></div>
            <div className="flex-item"><Button className='smallButton' onClick={() => {
              this.setState({
                openSaveDialog: true
              });
            }}>Save</Button></div>
            <div className="flex-item"><Button className='smallButton' onClick={() => {
              this.setState({
                openLoadDialog: true
              });
            }}>Load</Button></div>
            <div className="flex-item"><Button className='smallButton' onClick={() => {
              this.setState({ selectedExpiryDate: null, legEntityList: [], exitedLegList: [] }, () => { this.refreshOptionData() })
            }}>Reset</Button></div>
            <div className="flex-item"><Button className='smallButton'>Trade</Button></div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex' }}>
                <div className='flex-item'>Fair Price:</div>
                <div className='flex-item'>{this.state.fairPrice}</div>
                <div className='flex-item'>Future Price:</div>
                <div className='flex-item'>{this.state.futPrice}</div>
                <div className='flex-item'>Lot Size:</div>
                <div className='flex-item'>{this.state.lotSize}</div>
                <div className='flex-item'>IV:</div>
                <div className='flex-item'>{this.state.avgiv}</div>
                <div className='flex-item'>IVR:</div>
                <div className='flex-item'>{this.state.ivr}</div>
                <div className='flex-item'>IVP:</div>
                <div className='flex-item'>{this.state.ivp}</div>
              </div>
              <div style={{ display: 'flex' }}>
                <div className='flex-item'>Last Update Time</div>
                <div className='flex-item'>{this.state.latestRefreshDate!=null?this.state.latestRefreshDate.toLocaleTimeString():null}</div>
              </div>
            </div>
          </div>
        </div>

        {/* list of available positions */}
        <div className={this.state.classRight} style={{ borderStyle: 'ridge' }} >
          <div className='alignedCenter' style={{ display: this.state.chainShowed ? 'flex' : 'none' }}
            onClick={() => {
              this.setState({
                payoffChartShowed: !this.state.payoffChartShowed && this.state.chainShowed
              })
            }}>Payoff Chart
            <img src={this.state.payoffChartShowed ? './hide_up.svg' : './show_down.svg'} />
          </div>
          <div className={this.classPayoff} style={{ marginBottom: '10px' }} hidden={this.state.legEntityList.length == 0 || !this.state.payoffChartShowed}>
          
           <PayoffChartComponent data={this.state.chartData} chainShowed={this.state.chainShowed} 
            expiryDate={this.state.selectedExpiryDate} 
            fairPrice={this.state.fairPrice} 
            selectedsymbol={this.state.selectedsymbol}
              latestRefreshDate={this.state.latestRefreshDate}
              callback={(p) => {
                console.log(p);
                this.setState({ whatif: p });
                this.updateRecord(null, this.generateLegList);
              }}
              callbackShow={() => {
                this.classPayoff = "p-card col-12";
                this.classLeg = "p-card col-12";
                this.setState({
                  classChain: "col-6",
                  classRight: "col-6",
                  chainShowed: true
                })
              }} />
          </div>
          <div className={this.classLeg} style={{display:'flex'}}>
            <div style={{width:'20%', marginRight:'20px', display:this.state.legEntityList.length>0?'block':'none'}}>
              <PLComputeCompoenent passedData={this.state} />
            </div>
            <div style={{width:this.state.chartData==null? '100%':'80%'}}>
              <LegComponent passedData={this.state} callback={
                legEntityList => {
                  let exitedList = legEntityList.filter(p => p.exited);
                  this.setState({ legEntityList: legEntityList, exitedLegList: exitedList },
                    () => {
                      console.log(this.state.legEntityList)
                      this.convertLegToOptionChain();
                       let chartData = new PLCalc().chartData(this.state);
                      this.setState({ chartData: chartData });
                    })
                }}
              />
            </div>
          </div>
          <p></p>
        </div>
        {/* right side: charts and leg table  */}
        <div className={this.state.classChain} style={{ borderStyle: 'ridge' }}>
          <div className="p-card flex flex-column" >
            <OptionChainComponent passedData={this.state}
              callback={(data) => {
                this.setState({ records: data.records },
                  () => this.updateRecord(null, this.generateLegList));
              }}
              callbackHide={() => {
                this.classPayoff = "p-card col-6";
                this.classLeg = "p-card col-6";
                this.setState({
                  classChain: 'hideComponent',
                  classRight: 'col-12 flex',
                  chainShowed: false
                });
              }
              } />
          </div>
        </div>


        {
          this.state.openSaveDialog ? <div>
            <DialogSave passedData={this.state} closed={(st_save_id) => { this.setState({ openSaveDialog: false, strategyId: st_save_id }) }} /></div> : null
        }
        {
          this.state.openLoadDialog ? <div>
            <DialogLoad passedData={this.state} closed={(closed, data) => {
              if (closed == null) {
                console.log(data);
                this.setState({ strategyId: data.strategy_id })
                this.loadOptionChain(data)
              } else {
                this.setState({ openLoadDialog: false })
              }
            }} /></div> : null
        }

      </div>
    )
  }


  loadOptionChain = (data) => {
    console.log(data);
    let symbol = this.SymbolWithMarketSegments.filter(p => p.symbol == data.symbol);
    this.setState({
      openLoadDialog: false,
      selectedsymbol: data.symbol,
      symbol: symbol,
      selectedExpiryDate: data.payoff_date_dby,
    }, () => {
      this.refreshOptionData();
      this.setupLeg(data);
    })
  }

  setupLeg = (dataFrom) => {

    let url = "https://www.icharts.in/opt/api/LoadStrategy_Api.php";
    this.setState({ isBusy: true })
    let data = {
      "strategy_id": dataFrom.strategy_id,
      "username": 'haritha0'
    }
    let formData = new FormData();
    formData.append("data", JSON.stringify(data));
    axios.post(url, formData).then(
      res => {
        console.log(res);

        let pro = new StrategyProfile();
        pro.strategyId = res.data[0].strategy_header[0].strategy_id;
        pro.strategyName = res.data[0].strategy_header[0].st_name;
        pro.strategyDesc = res.data[0].strategy_header[0].st_description;
        pro.strategyCategory = res.data[0].strategy_header[0].st_category;
        this.setState({
          strategyProfile: pro
        });
        this.updateRecord(res, this.generateLegFromLoaded);

      }
    )
  }

  generateLegFromLoaded = (ret) => {
    let positionList = [];
    ret.data.forEach(p => {
      let legList = p.strategy_details;
      legList.forEach(element => {
        console.log(element)
        let position = new LegEntity();
        position.Buy_Sell = element.trade_type;
        position.CE_PE = element.option_type;
        position.Option_Price = Number.parseFloat(element.entry_price).toFixed(2);
        position.Strike_Price = Number.parseFloat(element.strike_price);
        position.Position_Lot = element.lots;
        position.IV = this.state.avgiv;
        positionList.push(position);

        if (element.exit_price == "1000000.0000000") {
          position.exited = true;
        };
      });
    })

    return positionList;
  }

  generateLegList = () => {
    let list1 = this.state.records.filter(p => p.Buy_Call == true || p.Sell_Call == true);
    let list2 = this.state.records.filter(p => p.Buy_Put == true || p.Sell_Put == true);

    let positionList = [];
    if (this.state.exitedLegList.length > 0)
      positionList.push(...this.state.exitedLegList)

    list1.forEach(rowData => {
      let position = new LegEntity();

      position.Position_Lot = rowData.Call_Lot

      if (rowData.Buy_Call || rowData.Sell_Call) {
        position.CE_PE = "CE";
        position.Option_Price = rowData.Call_Price.toString().replace(",", "");
      }


      if (rowData.Buy_Call) {
        position.Buy_Sell = "B";
      }

      if (rowData.Sell_Call) {
        position.Buy_Sell = "S";
      }
      position.IV = rowData.Call_IV;

      position.Strike_Price = rowData.Strike_Price;
      position.iv_adjustment=rowData.iv_adjustment;
      positionList.push(position);
    })

    list2.forEach(rowData => {
      let position = new LegEntity();
      position.Position_Lot = rowData.Put_Lot

      if (rowData.Buy_Put || rowData.Sell_Put) {
        position.CE_PE = "PE";
        position.Option_Price = rowData.Put_Price.toString().replace(",", "");
      }


      if (rowData.Buy_Put) {
        position.Buy_Sell = "B";
      }

      if (rowData.Sell_Put) {
        position.Buy_Sell = "S";
      }

      position.IV = rowData.Put_IV;
      position.Strike_Price = rowData.Strike_Price;
      positionList.push(position);
    })

    return positionList;

  }

  updateRecord = (param, positionListfunc) => {

    this.setState({ records: this.state.records }, () => {
      //let positionList = this.generateStrategyList();
      let legList = param == null ? positionListfunc() : positionListfunc(param);
      let exitedLegList = legList.filter(p => p.exited);
      this.setState({ legEntityList: legList, exitedLegList: exitedLegList }, () => {   
        let chartData = new PLCalc().chartData(this.state);
        this.setState({ chartData: chartData });
      })
    });
  }

  convertLegToOptionChain = () => {
    let legList: Array<LegEntity> = this.state.legEntityList.filter(p => p.exited != true);

    let optionList: Array<OptionChain> = this.state.records;
    if (optionList == null) return;
    //reset to inital state so it can be set by legs
    optionList.forEach(p => {
      p.Buy_Call = null;
      p.Sell_Call = null;
      p.Buy_Put = null;
      p.Sell_Put = null;

      p.Call_Lot = null;
      p.Put_Lot = null;
    });

    legList.forEach(leg => {
      let selectedOptionList = optionList.filter(chain => leg.Strike_Price - chain.Strike_Price == 0);

      for (let optionSelected of selectedOptionList) {
        if (leg.Buy_Sell == 'B') {
          if (leg.CE_PE == 'CE') {
            optionSelected.Buy_Call = true;
            optionSelected.Call_Lot = leg.Position_Lot;
          } else {
            optionSelected.Buy_Put = true;
            optionSelected.Put_Lot = leg.Position_Lot;
          }
        } else {
          if (leg.CE_PE == 'CE') {
            optionSelected.Sell_Call = true;
            optionSelected.Call_Lot = leg.Position_Lot;
          } else {
            optionSelected.Sell_Put = true;
            optionSelected.Put_Lot = leg.Position_Lot;
          }
        }
        optionSelected.iv_adjustment=leg.iv_adjustment;
      }
    });

    this.setState({ records: optionList });
  }
}