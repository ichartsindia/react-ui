import React from "react";
import { Route, Routes } from "react-router-dom";
import  AppMenu  from "./component/AppMenu";
import  AppRoutes  from "./component/AppRoutes";
import Container from 'react-bootstrap/Container';
// import "primereact/resources/themes/tailwind-light/theme.css"
class App extends React.Component {
  constructor(props) {
    super(props);
   
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