import React from "react";
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
} from "chart.js";
import { Chart } from "react-chartjs-2";
import {
  CandlestickController,
  CandlestickElement,
} from "chartjs-chart-financial";
import "chartjs-adapter-date-fns";

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

const StockChart = ({ ohlc, sma, signal }) => {
  // Validation
  if (!ohlc || !Array.isArray(ohlc) || ohlc.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-slate-500 font-medium">No OHLC data available</p>
        </div>
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="h-96 flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-slate-500 font-medium">No signal data available</p>
        </div>
      </div>
    );
  }

  // Create candlestick data
  const candlestickData = ohlc.map((p) => ({
    x: new Date(p.datetime).getTime(),
    o: parseFloat(p.open),
    h: parseFloat(p.high),
    l: parseFloat(p.low),
    c: parseFloat(p.close),
  }));

  // Debug: Log data alignment info
  console.log('DEBUG: Chart Data Alignment:');
  console.log('- OHLC data points:', candlestickData.length);
  console.log('- Date range:', new Date(candlestickData[0]?.x).toISOString().split('T')[0], 'to', new Date(candlestickData[candlestickData.length-1]?.x).toISOString().split('T')[0]);
  
  // Log first and last few dates for debugging
  console.log('- First 3 OHLC dates:', candlestickData.slice(0, 3).map(d => new Date(d.x).toISOString().split('T')[0]));
  console.log('- Last 3 OHLC dates:', candlestickData.slice(-3).map(d => new Date(d.x).toISOString().split('T')[0]));

  // Create SMA data aligned with OHLC dates (null values for missing dates)
  let smaData = candlestickData.map(ohlcPoint => ({ x: ohlcPoint.x, y: null })); // Initialize with nulls
  
  if (sma && Array.isArray(sma) && sma.length > 0) {
    if (typeof sma[0] === "object" && sma[0].datetime && sma[0].value !== undefined) {
      // SMA array has datetime - match with OHLC dates
      sma.forEach(smaPoint => {
        const smaTime = new Date(smaPoint.datetime).getTime();
        const ohlcIndex = candlestickData.findIndex(ohlc => ohlc.x === smaTime);
        if (ohlcIndex !== -1) {
          smaData[ohlcIndex] = { x: smaTime, y: smaPoint.value };
        }
      });
      console.log('DEBUG: SMA using datetime array, aligned with OHLC');
    } else if (typeof sma[0] === "number") {
      // SMA is just numbers - align starting from day 20 (index 19)
      const smaStartIndex = 19; // 20-day SMA starts from day 20
      sma.forEach((value, i) => {
        const ohlcIndex = smaStartIndex + i;
        if (ohlcIndex < candlestickData.length && value !== null && value !== undefined) {
          smaData[ohlcIndex] = { x: candlestickData[ohlcIndex].x, y: value };
        }
      });
      console.log('DEBUG: SMA using number array, aligned with OHLC');
    }
    
    const validSmaPoints = smaData.filter(point => point.y !== null).length;
    console.log(`DEBUG: SMA total points: ${smaData.length}, valid points: ${validSmaPoints}`);
  }

  // Create Bollinger Bands data aligned with OHLC dates (null values for missing dates)
  let bollingerUpperData = candlestickData.map(ohlcPoint => ({ x: ohlcPoint.x, y: null }));
  let bollingerLowerData = candlestickData.map(ohlcPoint => ({ x: ohlcPoint.x, y: null }));

  if (signal.bollinger?.array && Array.isArray(signal.bollinger.array)) {
    // Match Bollinger data with OHLC dates
    signal.bollinger.array.forEach(bb => {
      const bbTime = new Date(bb.datetime).getTime();
      const ohlcIndex = candlestickData.findIndex(ohlc => ohlc.x === bbTime);
      if (ohlcIndex !== -1) {
        bollingerUpperData[ohlcIndex] = { x: bbTime, y: bb.upper };
        bollingerLowerData[ohlcIndex] = { x: bbTime, y: bb.lower };
      }
    });
    
    const validBollingerPoints = bollingerUpperData.filter(point => point.y !== null).length;
    console.log(`DEBUG: Bollinger total points: ${bollingerUpperData.length}, valid points: ${validBollingerPoints}`);
  } else if (signal.bollinger?.upper && signal.bollinger?.lower) {
    // Static Bollinger values - apply to all dates (fallback)
    bollingerUpperData = candlestickData.map(p => ({ x: p.x, y: signal.bollinger.upper }));
    bollingerLowerData = candlestickData.map(p => ({ x: p.x, y: signal.bollinger.lower }));
    console.log('DEBUG: Bollinger using static values for all dates');
  }

  // Create MACD data aligned with OHLC dates (null values for missing dates)
  let macdLineData = candlestickData.map(ohlcPoint => ({ x: ohlcPoint.x, y: null }));
  let macdSignalData = candlestickData.map(ohlcPoint => ({ x: ohlcPoint.x, y: null }));

  // Use new datetime-aware arrays if available
  if (signal.macd?.macdArray && signal.macd?.signalArray) {
    // Match MACD line data with OHLC dates
    signal.macd.macdArray.forEach(macdPoint => {
      const macdTime = new Date(macdPoint.datetime).getTime();
      const ohlcIndex = candlestickData.findIndex(ohlc => ohlc.x === macdTime);
      if (ohlcIndex !== -1) {
        macdLineData[ohlcIndex] = { x: macdTime, y: macdPoint.value };
      }
    });

    // Match MACD signal data with OHLC dates
    signal.macd.signalArray.forEach(signalPoint => {
      const signalTime = new Date(signalPoint.datetime).getTime();
      const ohlcIndex = candlestickData.findIndex(ohlc => ohlc.x === signalTime);
      if (ohlcIndex !== -1) {
        macdSignalData[ohlcIndex] = { x: signalTime, y: signalPoint.value };
      }
    });
    
    const validMacdPoints = macdLineData.filter(point => point.y !== null).length;
    const validSignalPoints = macdSignalData.filter(point => point.y !== null).length;
    console.log(`DEBUG: MACD using datetime arrays - MACD: ${validMacdPoints}, Signal: ${validSignalPoints}`);
  } 
  // Fallback to old method if new arrays not available
  else if (signal.macd?.macdHistory && signal.macd?.signalHistory) {
    // Align MACD with OHLC starting from day 26 (index 25)
    signal.macd.macdHistory.forEach((macdValue, i) => {
      const ohlcIndex = 25 + i;
      if (ohlcIndex < candlestickData.length && macdValue !== null && macdValue !== undefined) {
        macdLineData[ohlcIndex] = { x: candlestickData[ohlcIndex].x, y: macdValue };
      }
    });

    // Align MACD Signal with OHLC starting from day 34 (index 33)
    signal.macd.signalHistory.forEach((signalValue, i) => {
      const ohlcIndex = 33 + i;
      if (ohlcIndex < candlestickData.length && signalValue !== null && signalValue !== undefined) {
        macdSignalData[ohlcIndex] = { x: candlestickData[ohlcIndex].x, y: signalValue };
      }
    });
    
    const validMacdPoints = macdLineData.filter(point => point.y !== null).length;
    const validSignalPoints = macdSignalData.filter(point => point.y !== null).length;
    console.log(`DEBUG: MACD using fallback alignment - MACD: ${validMacdPoints}, Signal: ${validSignalPoints}`);
  }

  // Get min and max values for price axis scaling
  const allPriceValues = [
    ...candlestickData.flatMap((d) => [d.o, d.h, d.l, d.c]),
    ...smaData.map((d) => d.y).filter((y) => y !== null && !isNaN(y)),
    ...bollingerUpperData.map((d) => d.y).filter((y) => y !== null && !isNaN(y)),
    ...bollingerLowerData.map((d) => d.y).filter((y) => y !== null && !isNaN(y)),
  ];

  const minPriceValue = Math.min(...allPriceValues);
  const maxPriceValue = Math.max(...allPriceValues);
  const pricePadding = (maxPriceValue - minPriceValue) * 0.1;

  // Get MACD range for proper scaling
  const allMacdValues = [
    ...macdLineData.map(d => d.y).filter(y => !isNaN(y)),
    ...macdSignalData.map(d => d.y).filter(y => !isNaN(y))
  ];
  const minMacdValue = allMacdValues.length > 0 ? Math.min(...allMacdValues) : -1;
  const maxMacdValue = allMacdValues.length > 0 ? Math.max(...allMacdValues) : 1;
  const macdPadding = Math.abs(maxMacdValue - minMacdValue) * 0.1;

  const datasets = [
    {
      label: "Price",
      data: candlestickData,
      type: "candlestick",
      borderColor: {
        up: "#10b981",
        down: "#ef4444",
        unchanged: "#64748b",
      },
      backgroundColor: {
        up: "rgba(16, 185, 129, 0.8)",
        down: "rgba(239, 68, 68, 0.8)",
        unchanged: "rgba(100, 116, 139, 0.8)",
      },
      yAxisID: "price",
    },
  ];

  // Add SMA line
  if (smaData.length > 0) {
    datasets.push({
      label: "SMA (20)",
      data: smaData,
      type: "line",
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0.1,
      spanGaps: false, // Don't connect across null values
      yAxisID: "price",
    });
  }

  // Add Moving Bollinger Bands
  if (bollingerUpperData.length > 0) {
    datasets.push({
      label: "Bollinger Upper",
      data: bollingerUpperData,
      type: "line",
      borderColor: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.1)",
      borderWidth: 1,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
      spanGaps: false, // Don't connect across null values
      yAxisID: "price",
    });
  }

  if (bollingerLowerData.length > 0) {
    datasets.push({
      label: "Bollinger Lower",
      data: bollingerLowerData,
      type: "line",
      borderColor: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.05)",
      borderWidth: 1,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: "+1",
      spanGaps: false, // Don't connect across null values
      yAxisID: "price",
    });
  }

  // Add RSI data
  if (signal.rsi) {
    const rsiData = ohlc.map((p) => ({
      x: new Date(p.datetime).getTime(),
      y: signal.rsi,
    }));

    datasets.push({
      label: `RSI (${signal.rsi.toFixed(1)})`,
      data: rsiData,
      type: "line",
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      spanGaps: false, // Don't connect across null values
      yAxisID: "rsi",
      hidden: true,
    });
  }

  // Add MACD data
  if (macdLineData.length > 0) {
    datasets.push({
      label: `MACD Line`,
      data: macdLineData,
      type: "line",
      borderColor: "#06b6d4",
      backgroundColor: "rgba(6, 182, 212, 0.1)",
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      spanGaps: false, // Don't connect across null values
      yAxisID: "macd",
      hidden: true,
    });
  }

  if (macdSignalData.length > 0) {
    datasets.push({
      label: `MACD Signal`,
      data: macdSignalData,
      type: "line",
      borderColor: "#ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.1)",
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      spanGaps: false, // Don't connect across null values
      yAxisID: "macd",
      hidden: true,
    });
  }

  const data = { datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    layout: {
      padding: {
        right: 60, // Extra padding for right axes
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: "day",
          displayFormats: {
            day: "MMM dd",
          },
        },
        title: {
          display: true,
          text: "Date",
          color: "#64748b",
          font: { size: 12, weight: "500" },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          maxTicksLimit: 8,
        },
        border: { display: false },
      },
      // PRIMARY Y-AXIS (LEFT) - Price, SMA, Bollinger Bands
      price: {
        type: "linear",
        position: "left",
        beginAtZero: false,
        min: Math.max(0, minPriceValue - pricePadding),
        max: maxPriceValue + pricePadding,
        title: {
          display: true,
          text: "Price ($)",
          color: "#64748b",
          font: { size: 12, weight: "500" },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          callback: function (value) {
            return "$" + value.toFixed(2);
          },
        },
        border: { display: false },
      },
      // SECONDARY Y-AXIS (RIGHT) - RSI only
      rsi: {
        type: "linear",
        position: "right",
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "RSI (0-100)",
          color: "#f59e0b",
          font: { size: 11, weight: "500" },
        },
        grid: {
          drawOnChartArea: false, // Don't draw grid lines across chart
          color: "rgba(245, 158, 11, 0.2)",
        },
        ticks: {
          color: "#f59e0b",
          stepSize: 25,
          font: { size: 10 },
          callback: function (value) {
            return value.toFixed(0);
          },
        },
        border: { display: false },
      },
      // THIRD Y-AXIS (RIGHT, OFFSET) - MACD only
      macd: {
        type: "linear",
        position: "right",
        offset: true, // This creates separation from RSI axis
        min: minMacdValue - macdPadding,
        max: maxMacdValue + macdPadding,
        title: {
          display: true,
          text: "MACD",
          color: "#06b6d4", 
          font: { size: 11, weight: "500" },
        },
        grid: {
          drawOnChartArea: false, // Don't draw grid lines across chart
          color: "rgba(6, 182, 212, 0.2)",
        },
        ticks: {
          color: "#06b6d4",
          maxTicksLimit: 5,
          font: { size: 10 },
          callback: function (value) {
            return value.toFixed(3);
          },
        },
        border: { display: false },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11, weight: "500" },
          color: "#475569",
          generateLabels: function(chart) {
            const originalLabels = ChartJS.defaults.plugins.legend.labels.generateLabels(chart);
            // Add axis info to legend labels for clarity
            return originalLabels.map(label => {
              if (label.text.includes('RSI')) {
                label.text += ' (Right)';
              } else if (label.text.includes('MACD')) {
                label.text += ' (Right)';
              }
              return label;
            });
          },
        },
        onClick: function (e, legendItem, legend) {
          const index = legendItem.datasetIndex;
          const chart = legend.chart;
          const meta = chart.getDatasetMeta(index);
          meta.hidden = meta.hidden === null ? !chart.data.datasets[index].hidden : null;
          chart.update();
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        titleColor: "#1e293b",
        bodyColor: "#475569",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { size: 14, weight: "600" },
        bodyFont: { size: 13 },
        callbacks: {
          // Filter callback - only show datasets that have non-null values
          filter: function(tooltipItem) {
            // Always show OHLC data
            if (tooltipItem.dataset.label === "Price") {
              return true;
            }
            
            // For line datasets, only show if y value is not null
            return tooltipItem.parsed.y !== null;
          },
          
          label: function (context) {
            const datasetLabel = context.dataset.label || "";
            if (datasetLabel === "Price") {
              const data = context.raw;
              return [
                `Open: $${data.o.toFixed(2)}`,
                `High: $${data.h.toFixed(2)}`,
                `Low: $${data.l.toFixed(2)}`,
                `Close: $${data.c.toFixed(2)}`,
              ];
            } else if (datasetLabel.includes("RSI")) {
              return `RSI: ${context.parsed.y.toFixed(1)} (Right Axis)`;
            } else if (datasetLabel.includes("MACD")) {
              return `${datasetLabel}: ${context.parsed.y.toFixed(4)} (Right Axis)`;
            } else if (datasetLabel.includes("Bollinger")) {
              return `${datasetLabel}: ${context.parsed.y.toFixed(2)}`;
            } else {
              return `${datasetLabel}: ${context.parsed.y.toFixed(2)}`;
            }
          },
        },
      },
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">
            {/* Price Chart & Technical Indicators */}
          </h3>
          <div className="text-sm text-slate-500 text-right">
            <p className="font-medium">Click legend to toggle indicators</p>
            <p className="text-xs">RSI & MACD on separate right axes (hidden by default)</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div style={{ height: "500px" }}>
          <Chart type="candlestick" data={data} options={options} />
        </div>

        {/* Quick Reference Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <strong className="text-slate-700">SMA (20-day)</strong> 
            </div>
            <div className="text-2xl font-bold text-slate-800">
              ${signal.sma?.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Price {signal.currentPrice > signal.sma ? 'above' : 'below'} trend line
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <strong className="text-slate-700">RSI</strong> 
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {signal.rsi?.toFixed(1)}
            </div>
            <div className={`text-xs mt-1 font-medium ${
              signal.rsi > 70 ? 'text-red-600' : 
              signal.rsi < 30 ? 'text-emerald-600' : 
              'text-slate-500'
            }`}>
              {signal.rsi > 70 ? 'Overbought' : signal.rsi < 30 ? 'Oversold' : 'Neutral'}
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
              <strong className="text-slate-700">MACD</strong>
            </div>
            <div className="text-lg font-bold text-slate-800">
              {signal.macd?.value.toFixed(3)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Signal: {signal.macd?.signal.toFixed(3)}
            </div>
          </div>
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <strong className="text-slate-700">Bollinger Bands</strong>
            </div>
            <div className="text-sm font-semibold text-slate-800">
              ${signal.bollinger?.lower?.toFixed(2)} - ${signal.bollinger?.upper?.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Current range
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;