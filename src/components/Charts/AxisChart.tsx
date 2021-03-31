import React, { useState, useEffect } from 'react';
import {
  Chart,
  Point,
  Line,
  Area,
  Tooltip,
  Axis,
  Coordinate
} from 'bizcharts';
import DataSet from '@antv/data-set';

const data = [
  { item: 'NTC 300', Previous: 40.33, Current: 45.49 },
  { item: 'Merged 800', Previous: 38.29, Current: 41.04 },
  { item: 'Flitto', Previous: 28.81, Current: 31.23 },
  { item: 'WMT', Previous: 40.2, Current: 33.37 },
  { item: '기호TC', Previous: 25.5, Current: 27.0 },
];

const tooltipConfig = {
  visible: true,
}


const AxisChart: React.FC = () => {
  const { DataView } = DataSet;
  const dv = new DataView().source(data);
  dv.transform({
    type: 'fold',
    fields: ['Previous', 'Current'], // 展开字段集
    key: 'user', // key字段
    value: 'score', // value字段
  });

  const newData = dv.rows;
  console.log('data', data);
  const axisConfig = {
    label: {
      offset: 25
    },
    tickLine: {
      length: 20
    }
  }

  return <Chart
    height={400}
    data = { newData}
    autoFit
    scale={{
      score:{
        min: 15,
        max: 50,
      }
    }}
    interactions={['legend-highlight']}
    >
    <Coordinate type="polar" radius={0.8} />
    <Tooltip { ...tooltipConfig } />
    <Point
      position="item*score"
      color="user"
      shape="circle"
    />
    <Line
      position="item*score"
      color="user"
      size="2"
    />
    <Area
      position="item*score"
      color="user"
        />
    <Axis name="item" { ...axisConfig }/>
  </Chart>
}

// ReactDOM.render(<Demo />, mountNode);
export default AxisChart;
