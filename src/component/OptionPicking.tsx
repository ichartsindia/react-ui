import axios from "axios";
import { Button, Dropdown } from "primereact";
import React from "react";
import { CircleSpinnerOverlay } from "react-spinner-overlay";
import { StockSymbol } from "src/entity/StockSymbol";

interface Props {
  callback
}

interface State {
    isBusy,
    SymbolList,
    selectedsymbol: string,
    expiryDateList,
    exp_date,
    record,
    openSaveDialog,
    stockSymbol: StockSymbol
}

export class OptionPicking extends React.Component<Props, State> {
    SymbolWithMarketSegments: any;

    constructor(props){
        super(props);

        this.state={
          isBusy:false,
          SymbolList:[],
          selectedsymbol: null,
          expiryDateList:[],
          exp_date:null,
          record:null,
          openSaveDialog:false,
          stockSymbol:null
        };
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
      
    render(){


        return (
          <div>
            <div className='p-card  flex'>
              <div className="flex-item symbol-dropdown" ><Dropdown value={this.state.selectedsymbol} options={this.state.SymbolList} onChange={(e) => {
                this.setState({ selectedsymbol: e.value });
          
                let stockSymbol = this.SymbolWithMarketSegments.filter(p => p.symbol == e.value)[0];
       
            this.setState({stockSymbol: stockSymbol});
                let url = "https://www.icharts.in/opt/api/getExpiryDates_Api.php?sym=" + e.value + "&sym_type=" + stockSymbol.symbol_type;
          
                this.setState({isBusy:true})
            
                axios.get(url, { withCredentials: false })
                  .then(response => {
                    let data = response.data;
                    this.setState({ expiryDateList: data, isBusy:false });
                  }).catch(err => {
                    this.setState({ expiryDateList: err.response.data });
                  });
              }} /></div>
           
              <div className="flex-item date-dropdown"><Dropdown value={this.state.exp_date} optionValue="expiry_dates" optionLabel="expiry_dates" options={this.state.expiryDateList}
                onChange={(e) => {
                  let stockSymbol=this.state.stockSymbol;
                  stockSymbol.exp_date=e.value;
                this.setState({ exp_date: e.value, stockSymbol: stockSymbol})
                  console.log(stockSymbol);
                  let url = "https://www.icharts.in/opt/api/SymbolDetails_Api.php?sym=" + this.state.selectedsymbol + "&exp_date=" + e.value + "&sym_type=" + stockSymbol.symbol_type;
                  console.log(url)
                  this.setState({isBusy:true});
                  axios.get(url, { withCredentials: false })
                    .then(response => {
                      let data = response.data;
                      console.log(data)
                      if (data.length > 0) {
                        let record = data[0];
                        // this.setState({
                        //   spotPrice: record.spot_price,
                        //   futPrice: record.fut_price,
                        //   lotSize: record.lot_size,
                        //   avgiv: record.avgiv,
                        //   ivr: record.ivr,
                        //   ivp: record.ivp,
                        //   fairPrice: record.fair_price,
                        //   isBusy:false
                        // });
                        this.setState({
                            record:record
                        })
                        console.log(stockSymbol);
                        this.props.callback(stockSymbol);
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
            <div className='secondLine flex'> 
              <div className='flex-item'>Lot Size:</div>
              <div className='flex-item'>{this.state.record?.lot_size}</div>
              <div className='flex-item'>Avergae Price:</div>
              <div className='flex-item'>{this.state.record?.avgiv}</div>
              <div className='flex-item'>IVR:</div>
              <div className='flex-item'>{this.state.record?.ivr}</div>
              <div className='flex-item'>IVP:</div>
              <div className='flex-item'>{this.state.record?.ivp}</div>
              <div className='flex-item'>Fair Price:</div>
              <div className='flex-item'>{this.state.record?.fair_price}</div>
            </div>
        </div>
        )
    }
}