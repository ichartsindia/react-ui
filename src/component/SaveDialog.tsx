import { Button, Dropdown, InputText, Panel } from "primereact";
import React, { Component } from "react";
import { Dialog } from 'primereact/dialog';

interface Props {
    closed;
}
interface State {
 
}
export class SaveDialog extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

       
    }

    onHide = () => {
        this.props.closed(true);
    }

    footer = (
        <div>
          <Button label="Save" icon="pi pi-save"  type="submit" onClick={this.onHide} />
          <Button label="Cancel" icon="pi pi-times" onClick={this.onHide} />
          {/* <input type="submit" value="Submit" /> */}
        </div>
      );


render(){
    return(
        
        <Dialog header="Portfolio/Strategy Manager" visible={true} onHide={this.onHide} footer={this.footer} className="dialog" >
          <form id="login">
            <Panel header="Strategy Manager">
              <div>
                <InputText className='dialogControl' placeholder='Strategy name'></InputText>
              </div>
            </Panel>
            <p></p>
            <Panel header="Portfolio Manager">
              <div>
                <InputText className='dialogControl' placeholder='Portfolio name'></InputText>
              </div>
              <div>
                <Dropdown  className='dialogControl' placeholder='Select Portfolio'> </Dropdown >
              </div>
            </Panel>
             </form>
           
          </Dialog>
        
    )
    }
}
