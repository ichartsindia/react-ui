import { Button, Dropdown, InputText, Panel } from "primereact";
import React, { Component } from "react";
import { Dialog } from 'primereact/dialog';
import axios from "axios";

interface Props {
  closed;
  passedData;
}
interface State {
  strategyName: string,
  description: string,
  tag: string
}
export class DialogSave extends React.Component<Props, State> {
  tradeOptions: { label: string; value: string; }[];
  constructor(props: Props) {
    super(props);
    console.log(props);

    if (props.passedData.strategyProfile) {
      this.state = {
        strategyName: props.passedData.strategyProfile.strategyName,
        description: props.passedData.strategyProfile.strategyDesc,
        tag: props.passedData.strategyProfile.strategyCategory
      }
    } else {
      this.state = {
        strategyName: props.passedData.selectedsymbol + "-" + props.passedData.selectedExpiryDate,
        description: null,
        tag: 'PaperTrades'
      }
    }
    console.log(this.state);
    this.tradeOptions = [
      { label: 'Live Trades', value: "LiveTrades" },
      { label: 'Paper Trades', value: "PaperTrades" },
      { label: 'Misc Trades', value: "MiscTrades" }
    ];

  }

  onHide = () => {

    this.props.closed(true);
  }

  onSave = () => {

    this.saveStrategy();

    this.props.closed(true);
  }

  saveStrategy=()=>{
    let userDetails = { "username": "haritha0" };
    let strategyHeader = {
      "symbol": this.props.passedData.selectedsymbol,
      "symboltype": "NSEFNO",
      "target_expiry_date": this.props.passedData.selectedExpiryDate,
      "strategy_name": this.state.strategyName,
      "strategy_status": 1, //question?
      "strategy_des": this.state.description,
      "strategy_id": Math.random(),
      "st_tag_val": this.state.tag
    }

    let legs = this.props.passedData.legEntityList;

    let strategyDetails = [];

    legs.forEach(leg => {
      let strategyDetail = {
        "trade_type": leg.Buy_Sell,
        "strprc": leg.Strike_Price,
        "opttype": leg.CE_PE,
        "exd": this.props.passedData.selectedExpiryDate,
        "entry_price": leg.Option_Price,
        "exit_price": 10000, //hardcoded, ask haritha
        "optleg_status": 1,
        "lots": leg.Position_Lot,
        "opt_leg_id": Math.random()
      }
      strategyDetails.push(strategyDetail);
    });

    let optdata = {
      "user_details": userDetails,
      "strategy_header": strategyHeader,
      "strategy_details": strategyDetails
    };
 
    let url = "https://www.icharts.in/opt/api/saveStrategy_Api.php";
    // if (this.props.passedData.strategyProfile) {
    //   url = "https://www.icharts.in/opt/api/EditStrategy_Api.php";
    //   strategyHeader.strategy_id = this.props.passedData.strategyProfile.strategyId;
    //   console.log(optdata);
    // }
 
    let formData = new FormData();
    formData.append("optdata", JSON.stringify(optdata));

    axios({
      method: "post",
      url: url,
      data: formData
    })
      .then(response => {
        let data = response.data;
        console.log(response);
      }).catch(err => {
        console.log(err);
      });


  }

  footer = (
    <div>
      <Button label="Save" icon="pi pi-save" type="submit" onClick={this.onSave} />
      <Button label="Cancel" icon="pi pi-times" onClick={this.onHide} />
      {/* <input type="submit" value="Submit" /> */}
    </div>
  );

 deleteStrategy=()=>{
  let formData = new FormData();
  formData.append("strategy_id", this.props.passedData.strategyProfile.strategyId);
  formData.append("username", "haritha0");

  let url = "https://www.icharts.in/opt/api/DeleteStrategy_Api.php";
  axios({
    method: "post",
    url: url,
    data: formData
  }).then(response => {
    this.saveStrategy();

  }).catch(err => {
    console.log(err);
  });
 }
  render() {


    return (

      <Dialog blockScroll={true} header="Portfolio Manager" visible={true} onHide={this.onHide} footer={this.footer} className="dialog" >
        <form id="login">
          <Panel header="Editing">
            <div>
              <InputText className='dialogControl' value={this.state.strategyName} placeholder='Strategy name' onChange={(e) => this.setState({ strategyName: e.target.value })}></InputText>
            </div>
            <div>
              <InputText className='dialogControl' value={this.state.description} placeholder='Portfolio description' onChange={(e) => this.setState({ description: e.target.value })}></InputText>
            </div>
            <div>
              <Dropdown appendTo="self" className='dialogControl' value={this.state.tag} placeholder='Select tag' options={this.tradeOptions} onChange={(e) => this.setState({ tag: e.value })}> </Dropdown >
            </div>
          </Panel>
        </form>

      </Dialog>

    )
  }
}
