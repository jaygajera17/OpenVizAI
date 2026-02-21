import Chart from "react-apexcharts";
import React, { Component } from "react";

const options = { chart: {
          id: "basic-bar"
        },
        xaxis: {
          categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
        }
    }

const series = {
    series: [
        {
          name: "series-1",
          data: [30, 40, 45, 50, 49, 60, 70, 91]
        }
      ]
}
export default function LineChart() {
  return (
    <>
      <Chart
        type="line"
        width="500"
        options={options}
        series={series.series}
      />
    </>
  );
}
