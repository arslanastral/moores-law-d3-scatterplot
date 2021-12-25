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
  const ScatterPlotChart = useRef();
  const wrapperRef = useRef();
  const dimensions = useResizeObserver(wrapperRef);

  useEffect(() => {
    const svg = d3.select(ScatterPlotChart.current);
    if (!dimensions) return;

    const xScale = d3
      .scalePoint()
      .domain(data.map((d) => d.Date))
      .range([30, dimensions.width - 30]);

    // const CircleAreaScale = d3
    //   .scaleSqrt()
    //   .domain([
    //     d3.min(data.map((d) => d.TransistorCount)),
    //     d3.max(data.map((d) => d.TransistorCount)),
    //   ])
    //   .range([5, 20]);

    let reducer = (previousValue, currentValue, currentIndex) => {
      let newVal = previousValue[currentIndex] * 2;
      return [...previousValue, newVal];
    };

    let prediction = xScale
      .domain()
      .reduce(reducer, [2250])
      .slice(0, xScale.domain().length / 2);

    const LineScale = d3
      .scaleLinear()
      .domain([0, prediction.length - 1])
      .range([30, dimensions.width - 30]);

    // const colorScale = d3
    //   .scaleLinear()
    //   .domain([
    //     d3.min(data.map((d) => d.TransistorCount)),
    //     d3.max(data.map((d) => d.TransistorCount)),
    //   ])
    //   .range(["#cfcfff", "#1500ff"]);

    const yScale = d3
      .scaleLog()
      .domain([
        d3.min(data.map((d) => d.TransistorCount)),
        d3.max(data.map((d) => d.TransistorCount)),
      ])
      .range([dimensions.height, 0])
      .nice();

    const xAxis = d3
      .axisBottom(xScale)
      .tickValues(
        xScale.domain().filter(function (d, i) {
          const MIN_WIDTH = 20;
          let skip = Math.round((MIN_WIDTH * data.length) / dimensions.width);
          skip = Math.max(2, skip);
          return !(i % skip);
        })
      )
      .tickPadding(15);

    svg
      .select(".x-axis")
      .style("transform", `translate(0px,${dimensions.height}px)`)
      .attr("font-family", "Inter")
      .attr("font-size", "1rem")
      .attr("color", "blue")
      .transition()
      .duration(300)
      .call(xAxis);

    svg.select(".x-axis").select("path").remove(); //removes outer ticks

    const yAxis = d3
      .axisLeft(yScale)
      .ticks(6)
      .tickSizeOuter(0)
      .tickSize(-dimensions.width)
      .tickFormat(
        (d) => d3.format(".1s")(d).replace("G", "B").replace("M", "M")
        // d3.format(",.2r")(d)
      );
    svg
      .select(".y-axis")
      .attr("font-family", "Inter")
      .attr("font-size", "0.9rem")
      .attr("color", "blue")
      .call(yAxis)
      .call((g) => g.select(".domain").remove())
      .call((g) =>
        g
          .selectAll(".tick:not(:first-of-type) line")
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "2,2")
      )
      .call((g) => g.selectAll(".tick text").attr("x", -10).attr("dy", 0));

    const myLine = d3
      .line()
      .x((value, index) => LineScale(index))
      .y(yScale);

    let path = svg
      .selectAll(".line")
      .data([prediction])
      .join("path")
      .attr("class", "line")
      .attr("d", myLine)
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width", "3");

    let pathTotalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", pathTotalLength + " " + pathTotalLength)
      .attr("stroke-dashoffset", pathTotalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    svg
      .selectAll(".dot")
      .data(data)
      .join("circle")
      .attr("class", "dot")
      .attr("r", 5)
      .attr("cx", (value) => xScale(value.Date))
      .attr("cy", (value) => yScale(value.TransistorCount))
      .transition()
      .style("fill", "#cfcfff")
      .style("stroke", "blue");
  }, [data, dimensions]);

  useEffect(() => {
    const row = (d) => {
      d.TransistorCount = +d.TransistorCount.split(",").join("");
      d.Date = +d.Date;

      return d;
    };
    d3.csv(currentData.URL, row).then(setData);
  }, [currentData, setData]);

  if (!data) {
    return <div>Loading...</div>;
  }
  return (
    <Wrapper>
      <ScatterPlotContainer ref={wrapperRef}>
        <ChartSvg ref={ScatterPlotChart}>
          <g className="x-axis" />
          <g className="y-axis" />
        </ChartSvg>
      </ScatterPlotContainer>
    </Wrapper>
  );
};

const useResizeObserver = (ref) => {
  const [dimensions, setDimensions] = useState(null);
  useEffect(() => {
    const observeTarget = ref.current;
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setDimensions(entry.contentRect);
      });
    });
    resizeObserver.observe(observeTarget);
    return () => {
      resizeObserver.unobserve(observeTarget);
    };
  }, [ref]);
  return dimensions;
};

export default ScatterPlot;
