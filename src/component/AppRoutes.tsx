import React from "react";
import { Route, Routes } from "react-router-dom";
import { StrategyBuilder } from './StrategyBuilder';
import TVChartContainer from "./TVChartContainer";


const AppRoutes = (props) => {
  return (
    <Routes>
      <Route path="/strategy" element={<StrategyBuilder />} />
      <Route path="/tvChart" element={<TVChartContainer />} />
    </Routes>
  )
}

export default AppRoutes;