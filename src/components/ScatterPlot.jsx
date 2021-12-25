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

const Title = styled.h1`
  color: blue;
  animation: fadeIn;
  animation-duration: 1s;
  font-family: "Playfair Display", serif;
  margin: -4rem 0rem 7rem 1rem;
  line-height: 45px;
  font-size: clamp(3rem, 8vw, 4rem);
`;

const Subtitle = styled.p`
  color: #414142;
  animation: fadeIn;
  animation-duration: 1s;
  font-family: Inter;
  text-align: center;
  margin: -5rem 2rem 2rem 2rem;
  font-size: clamp(1rem, 4vw, 1rem);
`;

const LegendContainer = styled.div`
  animation: fadeIn;
  animation-duration: 1s;
  margin: 0rem 2rem 2rem 2rem;
  font-family: Inter;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const LegendWrapper = styled.div`
  margin-left: 20px;
`;

const LegendIcon = styled.span`
  background-color: #cfcfff;
  border-radius: 50%;
  border: 1px solid blue;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  display: inline-block;
`;

const LegendTitle = styled.span`
  font-size: 0.95rem;

  letter-spacing: -1px;
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
      .tickFormat((d) =>
        d3.format(".1s")(d).replace("G", "B").replace("M", "M")
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

    let div = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("left", "0px")
      .style("top", "0px");

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
      .attr("stroke", "blue")
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
      .on("mouseover", function (event, d) {
        d3.select(this).style("fill", "greenyellow");
        div.transition().duration(200).style("opacity", 1);
        div
          .html(
            `<span style="font-weight:600;font-size:1rem">${d.Processor}</span>` +
              " " +
              `<span style="font-size:0.9rem">(${d.Date})</span>` +
              "<br/>" +
              `<span style="font-size:0.95rem">Transistors: ${d3
                .format(".2s")(d.TransistorCount)
                .replace("G", " Billion")
                .replace("M", " Million")}</span>` +
              "<br/>" +
              `<span style="font-size:0.95rem">Designer: ${d.Designer}</span>` +
              "<br/>" +
              `<span style="font-size:0.95rem">Process: ${d.MOSProcess}</span>`
          )
          .style("left", event.pageX - 20 + "px")
          .style("top", event.pageY - 120 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).style("fill", "#cfcfff");
        div.transition().duration(500).style("opacity", 0);
      })
      .transition()
      .style("fill", "#cfcfff")
      .style("stroke", "blue");

    return () => {
      div.remove();
    };
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
      <Title>{"Moore's Law"}</Title>
      <Subtitle>{`"The number of transistors in a dense integrated circuit (IC) doubles about every two years."`}</Subtitle>
      <LegendContainer>
        <LegendWrapper>
          <LegendIcon style={{ background: "blue" }}></LegendIcon>
          <LegendTitle className="legend-title">
            {"Moore's Prediction"}
          </LegendTitle>
        </LegendWrapper>
        <LegendWrapper>
          <LegendIcon></LegendIcon>
          <LegendTitle className="legend-title">
            Actual Transistor Count
          </LegendTitle>
        </LegendWrapper>
      </LegendContainer>
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
