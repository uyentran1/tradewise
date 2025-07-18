import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  LineController,
  LineElement,
  PointElement,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  LineController,
  LineElement,
  PointElement,
  CandlestickController,
  CandlestickElement
);


const StockChart = ({ ohlc, sma }) => {

  // Validation
  if (!ohlc || !Array.isArray(ohlc) || ohlc.length === 0) {
    console.log('Invalid OHLC data:', ohlc);
    return <div>No OHLC data available</div>;
  }

  if (!sma || !Array.isArray(sma) || sma.length === 0) {
    console.log('Invalid SMA data:', sma);
    return <div>No SMA data available</div>;
  }

  // Create candlestick data (data is already sorted from SignalPage)
  const candlestickData = ohlc.map(p => ({
    x: new Date(p.datetime).getTime(), // Convert to timestamp
    o: parseFloat(p.open),
    h: parseFloat(p.high),
    l: parseFloat(p.low),
    c: parseFloat(p.close),
  }));

  const smaData = sma.map((point, i) => ({
    x: new Date(ohlc[i]?.datetime).getTime(), // Convert to timestamp
    y: point, 
  }));

  console.log('OHLC length:', ohlc.length);
  console.log('SMA length:', sma.length);
  console.log('Candlestick data sample:', candlestickData.slice(0, 3));
  console.log('SMA data sample:', smaData.slice(0, 3));
  console.log('First SMA non-null index:', sma.findIndex(val => val !== null));
  console.log('SMA data length after filtering:', smaData.length);

  // Get min and max values for proper scaling
  const allValues = [...candlestickData.flatMap(d => [d.o, d.h, d.l, d.c]), ...smaData.map(d => d.y)];
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const padding = (maxValue - minValue) * 0.1;

  const data = {
    datasets: [
      {
        label: 'Candlestick',
        data: candlestickData,
        type: 'candlestick',
        borderColor: {
          up: '#22c55e',
          down: '#ef4444',
          unchanged: '#999999'
        },
        backgroundColor: {
          up: 'rgba(34, 197, 94, 0.8)',
          down: 'rgba(239, 68, 68, 0.8)',
          unchanged: 'rgba(153, 153, 153, 0.8)'
        },
      },
      {
        label: 'SMA',
        data: smaData,
        type: 'line',
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0.1,
        spanGaps: true, // This helps with gaps in SMA data
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'MMM dd'
          }
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        beginAtZero: false,
        min: minValue - padding,
        max: maxValue + padding,
        title: {
          display: true,
          text: 'Price'
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            const datasetLabel = context.dataset.label || '';
            if (datasetLabel === 'Candlestick') {
              const data = context.raw;
              return [
                `Open: ${data.o.toFixed(2)}`,
                `High: ${data.h.toFixed(2)}`,
                `Low: ${data.l.toFixed(2)}`,
                `Close: ${data.c.toFixed(2)}`
              ];
            } else {
              return `${datasetLabel}: ${context.parsed.y.toFixed(2)}`;
            }
          }
        }
      }
    },
  };


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Stock Price Chart</h3>
      <div style={{ height: '400px' }}>
        <Chart
          type="candlestick"
          data={data}
          options={options}
        />
      </div>
    </div>
  );
};

export default StockChart;


