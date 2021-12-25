import React, { useContext, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import styled from "styled-components";
import { ScatterPlotContext } from "../App";

const ScatterPlotContainer = styled.div`
  border-radius: 10px;
  width: clamp(200px, 60vw, 800px);
  height: 400px;
  margin-left: -35px;
`;

const Wrapper = styled.div`
  background: white;
  width: clamp(320px, 85vw, 1000px);
  box-shadow: 0 2px 25px rgba(255, 0, 130, 0.5);
  height: 750px;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
`;

const ChartSvg = styled.svg`
  width: 100%;
  height: 100%;
  margin-left: 25px;
  animation: fadeIn;
  animation-duration: 1s;
  overflow: visible !important;
`;

const ScatterPlot = () => {
  const { data, setData, currentData } = useContext(ScatterPlotContext);

  useEffect(() => {
    d3.csv(currentData.URL).then(setData);
  }, [currentData, setData]);

  if (!data) {
    return <div>Loading...</div>;
  }
  return (
    <Wrapper>
      <ScatterPlotContainer>
        <ChartSvg>
          <g className="x-axis" />
          <g className="y-axis" />
        </ChartSvg>
      </ScatterPlotContainer>
    </Wrapper>
  );
};

export default ScatterPlot;
