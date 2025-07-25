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
    console.log("Invalid OHLC data:", ohlc);
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
    console.log("No signal data provided");
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

  // Create candlestick data (data is already sorted from SignalPage)
  const candlestickData = ohlc.map((p) => ({
    x: new Date(p.datetime).getTime(),
    o: parseFloat(p.open),
    h: parseFloat(p.high),
    l: parseFloat(p.low),
    c: parseFloat(p.close),
  }));

  // Properly map SMA data
  let smaData = [];
  if (sma && Array.isArray(sma) && sma.length > 0) {
    if (typeof sma[0] === "object" && sma[0].datetime && sma[0].value) {
      // SMA data has datetime and value properties
      smaData = sma.map((point) => ({
        x: new Date(point.datetime).getTime(),
        y: point.value,
      }));
    } else if (typeof sma[0] === "number") {
      // SMA data is just array of numbers, map to corresponding OHLC dates
      smaData = sma
        .map((value, i) => ({
          x: new Date(ohlc[ohlc.length - sma.length + i]?.datetime).getTime(),
          y: value,
        }))
        .filter((point) => !isNaN(point.x) && !isNaN(point.y));
    }
  }

  // Create Bollinger Bands data
  const bollingerUpperData = signal.bollinger?.upper
    ? ohlc.map((p) => ({
        x: new Date(p.datetime).getTime(),
        y: signal.bollinger.upper,
      }))
    : [];

  const bollingerLowerData = signal.bollinger?.lower
    ? ohlc.map((p) => ({
        x: new Date(p.datetime).getTime(),
        y: signal.bollinger.lower,
      }))
    : [];

  // Get min and max values for proper scaling
  const allValues = [
    ...candlestickData.flatMap((d) => [d.o, d.h, d.l, d.c]),
    ...smaData.map((d) => d.y).filter((y) => y !== null && !isNaN(y)),
  ];

  if (signal.bollinger?.upper) allValues.push(signal.bollinger.upper);
  if (signal.bollinger?.lower) allValues.push(signal.bollinger.lower);

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const padding = (maxValue - minValue) * 0.1;

  const datasets = [
    {
      label: "Price",
      data: candlestickData,
      type: "candlestick",
      borderColor: {
        up: "#10b981", // Emerald green
        down: "#ef4444", // Red
        unchanged: "#64748b", // Slate
      },
      backgroundColor: {
        up: "rgba(16, 185, 129, 0.8)",
        down: "rgba(239, 68, 68, 0.8)",
        unchanged: "rgba(100, 116, 139, 0.8)",
      },
      yAxisID: "price",
    },
  ];

  // Add SMA line if data exists
  if (smaData.length > 0) {
    datasets.push({
      label: "SMA (20)",
      data: smaData,
      type: "line",
      borderColor: "#3b82f6", // Professional blue
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0.1,
      spanGaps: true,
      yAxisID: "price",
    });
  }

  // Add Bollinger Bands if they exist
  if (bollingerUpperData.length > 0) {
    datasets.push({
      label: "Bollinger Upper",
      data: bollingerUpperData,
      type: "line",
      borderColor: "#8b5cf6", // Purple
      backgroundColor: "rgba(139, 92, 246, 0.1)",
      borderWidth: 1,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: false,
      yAxisID: "price",
    });
  }

  if (bollingerLowerData.length > 0) {
    datasets.push({
      label: "Bollinger Lower",
      data: bollingerLowerData,
      type: "line",
      borderColor: "#8b5cf6", // Purple
      backgroundColor: "rgba(139, 92, 246, 0.05)",
      borderWidth: 1,
      borderDash: [5, 5],
      pointRadius: 0,
      fill: "+1", // Fill between upper and lower bands
      yAxisID: "price",
    });
  }

  // Add RSI as a separate dataset on secondary y-axis
  if (signal.rsi) {
    const rsiData = ohlc.map((p) => ({
      x: new Date(p.datetime).getTime(),
      y: signal.rsi,
    }));

    datasets.push({
      label: `RSI (${signal.rsi.toFixed(1)})`,
      data: rsiData,
      type: "line",
      borderColor: "#f59e0b", // Amber
      backgroundColor: "rgba(245, 158, 11, 0.1)",
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      yAxisID: "rsi",
      hidden: true, // Start hidden since RSI scale is different
    });
  }

  // Add MACD as separate datasets on secondary y-axis
  if (signal.macd) {
    const macdValueData = ohlc.map((p) => ({
      x: new Date(p.datetime).getTime(),
      y: signal.macd.value,
    }));

    const macdSignalData = ohlc.map((p) => ({
      x: new Date(p.datetime).getTime(),
      y: signal.macd.signal,
    }));

    datasets.push(
      {
        label: `MACD Value (${signal.macd.value.toFixed(3)})`,
        data: macdValueData,
        type: "line",
        borderColor: "#06b6d4", // Cyan
        backgroundColor: "rgba(6, 182, 212, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        yAxisID: "macd",
        hidden: true, // Start hidden since MACD scale is different
      },
      {
        label: `MACD Signal (${signal.macd.signal.toFixed(3)})`,
        data: macdSignalData,
        type: "line",
        borderColor: "#ef4444", // Red
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        yAxisID: "macd",
        hidden: true, // Start hidden since MACD scale is different
      }
    );
  }

  const data = { datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
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
          font: {
            size: 12,
            weight: "500",
          },
        },
        grid: {
          color: "rgba(148, 163, 184, 0.1)",
          drawBorder: false,
        },
        ticks: {
          color: "#64748b",
          maxTicksLimit: 8,
        },
        border: {
          display: false,
        },
      },
      price: {
        type: "linear",
        position: "left",
        beginAtZero: false,
        min: Math.max(0, minValue - padding),
        max: maxValue + padding,
        title: {
          display: true,
          text: "Price ($)",
          color: "#64748b",
          font: {
            size: 12,
            weight: "500",
          },
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
        border: {
          display: false,
        },
      },
      rsi: {
        type: "linear",
        position: "right",
        min: 0,
        max: 100,
        title: {
          display: true,
          text: "RSI",
          color: "#f59e0b",
          font: {
            size: 12,
            weight: "500",
          },
        },
        grid: {
          drawOnChartArea: false,
          color: "rgba(245, 158, 11, 0.2)",
        },
        ticks: {
          color: "#f59e0b",
          callback: function (value) {
            return value.toFixed(0);
          },
        },
        border: {
          display: false,
        },
      },
      macd: {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "MACD",
          color: "#06b6d4",
          font: {
            size: 12,
            weight: "500",
          },
        },
        grid: {
          drawOnChartArea: false,
          color: "rgba(6, 182, 212, 0.2)",
        },
        ticks: {
          color: "#06b6d4",
          callback: function (value) {
            return value.toFixed(3);
          },
        },
        border: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: "500",
          },
          color: "#475569",
          filter: function (item) {
            return true; // Show all legend items
          },
        },
        onClick: function (e, legendItem, legend) {
          const index = legendItem.datasetIndex;
          const chart = legend.chart;
          const meta = chart.getDatasetMeta(index);

          meta.hidden =
            meta.hidden === null ? !chart.data.datasets[index].hidden : null;
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
        titleFont: {
          size: 14,
          weight: "600",
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
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
              return `${datasetLabel}: ${context.parsed.y.toFixed(1)}`;
            } else if (datasetLabel.includes("MACD")) {
              return `${datasetLabel}: ${context.parsed.y.toFixed(4)}`;
            } else if (datasetLabel.includes("Bollinger")) {
              return `${datasetLabel}: $${context.parsed.y.toFixed(2)}`;
            } else {
              return `${datasetLabel}: $${context.parsed.y.toFixed(2)}`;
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
            <p className="text-xs">RSI & MACD hidden by default</p>
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
              ${signal.bollinger?.lower.toFixed(2)} - ${signal.bollinger?.upper.toFixed(2)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Volatility channel
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;