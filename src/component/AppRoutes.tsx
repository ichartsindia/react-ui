import React from "react";
import { Route, Routes } from "react-router-dom";
import { Simulator } from "./Simulator";
import { StrategyBuilder } from './StrategyBuilder';

const AppRoutes = (props) => {
  return (
    <Routes>
      <Route path="/simulator" element={<Simulator />} />
      <Route path="/strategyBuilder" element={<StrategyBuilder />} />
    </Routes>
  )
}

export default AppRoutes;