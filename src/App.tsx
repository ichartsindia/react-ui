import React from "react";
import { Route, Routes } from "react-router-dom";
import  AppMenu  from "./component/AppMenu";
import  AppRoutes  from "./component/AppRoutes";
import Container from 'react-bootstrap/Container';


interface Props {
    
}

interface State {
  
  
}

class App extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
     
    };

 
  }

  render() {
    return (
      <div>
        <div style={{zIndex:1000}}>
          <AppMenu />
        </div>
        <div style={{zIndex:0}}>
          <Container >
            <AppRoutes />
        </Container>
        </div>
      </div>
    );
  }
}

export default App;