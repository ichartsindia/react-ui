import React from "react";
import { Route, Routes } from "react-router-dom";
import { StrategyBuilder } from './StrategyBuilder';

const AppRoutes = (props) => {
  return (
    <Routes>
      <Route path="/strategyBuilder" element={<StrategyBuilder />} />
    </Routes>
  )
}

export default AppRoutes;