import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
} from 'chart.js';
import 'chartjs-chart-financial';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  // FinancialChart,
  Tooltip,
  Legend
);

const CandlestickChart = ({ ohlc, sma }) => {
  const candlestickData = ohlc.map(p => ({
    x: p.datetime,
    o: parseFloat(p.open),
    h: parseFloat(p.high),
    l: parseFloat(p.low),
    c: parseFloat(p.close),
  }));

  const smaData = sma.map((point, i) => ({
    x: ohlc[i].datetime,
    y: point,
  })).filter(p => p.y); // remove null SMA values

  const data = {
    datasets: [
      {
        label: 'Candlestick',
        data: candlestickData,
        type: 'candlestick',
        color: {
          up: '#22c55e',
          down: '#ef4444',
          unchanged: '#999999'
        },
      },
      {
        label: 'SMA',
        data: smaData,
        type: 'line',
        borderColor: 'blue',
        borderWidth: 1,
        pointRadius: 0,
        parsing: false,
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day'
        },
      },
    },
  };

  return (
    <div className="bg-white rounded shadow p-4">
      <Chart type="candlestick" data={data} options={options} />
    </div>
  );
};

export default CandlestickChart;


