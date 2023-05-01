import { Button, Column, DataTable, Dropdown, InputText, Panel } from "primereact";
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
  tag: number,
  strategyList: []
}
export class DialogLoad extends React.Component<Props, State> {
  tradeOptions: { label: string; value: string; }[];
  constructor(props: Props) {
    super(props);

    this.state = {
      strategyName: null,
      description: null,
      tag: 0,
      strategyList: []
    }

  }

  componentDidMount = () => {
    this.refreshList();
  }

  refreshList = () => {
    let formData = new FormData();
    formData.append("data", JSON.stringify({ "username": "haritha0" }));

    let url = "https://www.icharts.in/opt/api/getStrategyList_Api.php";

    axios({
      method: "post",
      url: url,
      data: formData
    })
      .then(response => {
        let data = response.data;
        this.setState({ strategyList: data });
      }).catch(err => {
        console.log(err);
      });
  }
  
  onHide = () => {
    this.props.closed(true, null);
  }

  rowClicked = (e) => {
    this.props.closed(null, e.data);
  }

  deleteTemplate = (rowData) => {

    return <Button icon="pi  pi-trash" className='p-button-text' style={{ height: '20px' }}
      onClick={() => {
        console.log(rowData)
        let formData = new FormData();
        formData.append("strategy_id", rowData.strategy_id);
        formData.append("username", "haritha0");

        let url = "https://www.icharts.in/opt/api/DeleteStrategy_Api.php";
        axios({
          method: "post",
          url: url,
          data: formData
        }).then(response => {
          let data = response.data;
          this.refreshList();
        }).catch(err => {
          console.log(err);
        });
      }

      }
    ></Button>
  }

  render() {
    return (

      <Dialog header="All Strategies" style={{ width: '50vw' }} visible={true} onHide={this.onHide} className="dialog"  >

        <div style={{ visibility: this.state.strategyList.length > 0 ? 'visible' : 'hidden' }}>
          <DataTable className='strategyList' value={this.state.strategyList} responsiveLayout="scroll" onRowClick={(e) => this.rowClicked(e)} showGridlines >
            <Column field='symbol' header="Symbol"></Column>
            <Column field='st_name' header="Name"></Column>
            <Column field='st_category' header="Strategy Category"></Column>
            <Column field="st_status" header="Status"></Column>
            <Column field="payoff_date_dby" header="Payoff Date"></Column>
            <Column body={this.deleteTemplate}></Column>
          </DataTable>
        </div>

      </Dialog>

    )
  }
}
