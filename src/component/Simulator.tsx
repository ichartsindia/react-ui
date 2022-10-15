import React, { useEffect, useState } from 'react';
import { Chart } from 'primereact/chart';
import OptionService from '../service/OptionService';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button, Calendar, Checkbox, Dropdown, SelectButton, TabPanel, TabView } from 'primereact';
import { Position } from 'src/entity/position';
import '../component/Simulator.css';
import { v4 as uuidv4 } from 'uuid';
// import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
interface Props {

}

interface State {
  records: any[];
  positions: Position[];
  indexValue: string;
  indexlotSizeValue: string;
  tradeDate;
  tradeHour: number;
  tradeMinute: string;
  commonIVChecked: boolean;


}

export class Simulator extends React.Component<Props, State> {
  indexValueOptions;
  lostSizeOptions;
  hourOptions;
  minuteOptions;
  constructor(props: Props) {
    super(props);

    this.state = {
      records: null,
      positions: [],
      indexValue: 'Nifty',
      indexlotSizeValue: '20',
      tradeDate: new Date(),
      tradeHour: 9,
      tradeMinute: '00',
      commonIVChecked: false
    }

    const optionService = new OptionService();

    optionService.getOptions()
      .then(data => {
        this.setState({ records: data });
        console.log(data);
      });

    this.indexValueOptions = ['Nifty', 'Banknifty'];
    this.lostSizeOptions = ['20', '25', '40'];
    this.hourOptions = [9, 10, 11, 12, 13, 14, 15];
    this.minuteOptions = [
      '00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
      '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
      '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
      '31', '32', '33', '34', '35', '36', '37', '38', '39', '40',
      '41', '42', '43', '44', '45', '46', '47', '48', '49', '50',
      '51', '52', '53', '54', '55', '56', '57', '58', '59'];
  }

  callTemplate = (rowData) => {
    return (<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Button tooltip='Buy Call' tooltipOptions={{ position: 'top' }} icon="pi pi-plus-circle" className="p-button-rounded p-button-text" aria-label="Buy Call" onClick={() => {
        let position: Position = new Position();
        position.id=uuidv4();
        position.strike = rowData.Strike;
        position.stringString = rowData.Strike + "CE";
        position.lot = 2;
        position.time = new Date().toLocaleTimeString();
        this.state.positions.push(position);

        this.setState({ positions: this.state.positions });
        console.log(this.state.positions);
      }} ></Button>
      {rowData.CallLTP} 
      <Button tooltip='Sell Call' tooltipOptions={{ position: 'top' }} icon="pi pi-minus-circle" className="p-button-rounded p-button-secondary p-button-text" aria-label="Buy Call" onClick={() => {
        let position: Position = new Position();
        position.strike = rowData.Strike;
        position.stringString = rowData.Strike + "CE";
        position.lot = -2;
        position.time = new Date().toLocaleTimeString();
        this.state.positions.push(position);

        this.setState({ positions: this.state.positions });
      }} ></Button>
     
    </div>)
  }

  putTemplate = (rowData) => {
    return (<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>   
      <Button tooltip='Buy Put' tooltipOptions={{ position: 'top' }} icon="pi pi-plus-circle" className="p-button-rounded p-button-text" aria-label="Buy Put" ></Button>
       {rowData.PutLTP}
       <Button tooltip='Sell Put' tooltipOptions={{ position: 'top' }} icon="pi pi-minus-circle" className="p-button-rounded p-button-secondary p-button-text" aria-label="Sell Put" ></Button>
    </div>)
  }

  buttonTemplate=(rowData)=>{
    return (<div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
       <Button tooltip='Remove' tooltipOptions={{ position: 'top' }} icon="pi pi-trash" className="p-button-rounded p-button-secondary p-button-text"  onClick={() => {
        let positionsFound=this.state.positions.filter(p=>p.id!==rowData.id);
        this.setState({ positions: positionsFound });
      }} ></Button>
    </div>)
  }

  render() {
    if (this.state.records == null)
      return null;

    return (

      <div className="grid p-fluid">
        <div className="col-12 lg:col-12">
          <div className='card'>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>Select Index</div>
              <div>Select Lot Size</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <div><SelectButton value={this.state.indexValue} options={this.indexValueOptions} onChange={(e) => this.setState({ indexValue: e.value })} /></div>
              <div>&lt;&lt;Day</div>
              <div>&lt;SOD</div>
              <div>&lt;2h</div>
              <div>&lt;30m</div>
              <div>&lt;15m</div>
              <div>&lt;5m</div>
              <div>&lt;1m</div>
              <div><Calendar id="basic" style={{ width: '110px' }} value={this.state.tradeDate} onChange={(e) => this.setState({ tradeDate: e.value })} /></div>
              <div><Dropdown style={{ width: '100px' }} value={this.state.tradeHour} options={this.hourOptions} onChange={(e) => this.setState({ tradeHour: e.value })} /></div>
              <div><Dropdown style={{ width: '100px' }} value={this.state.tradeMinute} options={this.minuteOptions} onChange={(e) => this.setState({ tradeMinute: e.value })} /></div>
              <div>&gt;1m</div>
              <div>&gt;5m</div>
              <div>&gt;15m</div>
              <div>&gt;30m</div>
              <div>&gt;2h</div>
              <div>&gt;EOD</div>
              <div>&gt;&gt;Day</div>
              <div><SelectButton value={this.state.indexlotSizeValue} options={this.lostSizeOptions} onChange={(e) => this.setState({ indexlotSizeValue: e.value })} /></div>
            </div>
          </div>

        </div>
        <div className="col-12 lg:col-12">
          <div className='card'>
            <div className="field-checkbox">
              <Checkbox inputId="commonIV" checked={this.state.commonIVChecked} onChange={e => this.setState({ commonIVChecked: e.checked })} />
              <label htmlFor="commonIV">Common IV</label>
            </div>
          </div>
        </div>
        <div className="col-6 lg:col-6">
          <TabView>
            <TabPanel header={this.state.tradeDate.toLocaleDateString()}>
              <div className="card flex flex-column" >
                <DataTable className='DataTable' value={this.state.records} responsiveLayout="scroll" scrollHeight="600px" rowHover showGridlines scrollable>
                  <Column body={this.callTemplate} header="Call LTP"></Column>
                  <Column field="Strike" header="Strike"></Column>
                  <Column header="Put LTP" body={this.putTemplate}></Column>
                </DataTable>
              </div>
            </TabPanel>
            <TabPanel header={this.state.tradeDate.setDate(this.state.tradeDate.getDate()+7)}>
              <div className="card flex flex-column" >
                <DataTable className='DataTable' value={this.state.records} responsiveLayout="scroll" scrollHeight="800px" rowHover showGridlines scrollable>
                  <Column body={this.callTemplate} header="Call LTP"></Column>
                  <Column field="Strike" header="Strike"></Column>
                  <Column header="Put LTP" body={this.putTemplate}></Column>
                </DataTable>
              </div>
            </TabPanel>
          </TabView>
          
        </div>
        <div className="col-6 lg:col-6">
          <div className="card flex flex-column" >
            <DataTable value={this.state.positions} responsiveLayout="scroll" scrollable id='simulator'>
              <Column field="lot" header="Lots"></Column>
              <Column field="time" header="Time"></Column>
              <Column field="stringString" header="Strike"></Column>
              <Column field="pop" header="Prob of Profit (POP)"></Column>
              <Column field="payoff" header="Payoff"></Column>
              <Column body={this.buttonTemplate}></Column>
            </DataTable>
          </div>
        </div>
      </div>
    )
  }

}