import React, { useState } from "react";
import styled from "styled-components";
import ScatterPlot from "./components/ScatterPlot";

const AppContainer = styled.div`
  background: white
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  min-width: 100vw;
`;

function App() {
  return (
    <ScatterPlotProvider>
      <ScatterPlotWrapper />
    </ScatterPlotProvider>
  );
}

// eslint-disable-next-line react/display-name
const ScatterPlotWrapper = React.memo(() => {
  return (
    <AppContainer>
      <ScatterPlot />
    </AppContainer>
  );
});

function ScatterPlotProvider({ children }) {
  const [data, setData] = useState([]);
  const [currentData, setcurrentData] = useState({
    type: "TransistorCount",
    URL:
      "https://gist.githubusercontent.com/arslanastral/6ac598aeeaf2c577dcbb785f203b263b/raw/12d2b06d274040582999ea40f56b4caa910aa03a/mircroprocessor-transistor-count.csv",
  });

  return (
    <ScatterPlotContext.Provider
      value={{
        data,
        setData,
        currentData,
        setcurrentData,
      }}
    >
      {children}
    </ScatterPlotContext.Provider>
  );
}

export const ScatterPlotContext = React.createContext();
export default App;
