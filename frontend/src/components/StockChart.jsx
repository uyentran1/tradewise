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
      <div className="h-96 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-xl border border-purple-200">
        <p className="text-gray-500">No OHLC data available</p>
      </div>
    );
  }

  if (!signal) {
    console.log("No signal data provided");
    return (
      <div className="h-96 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-xl border border-purple-200">
        <p className="text-gray-500">No signal data available</p>
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

  // FIX: Properly map SMA data - check if sma is array of objects with datetime/value or just values
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

  // Create Bollinger Bands data (horizontal lines)
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

  // Get min and max values for proper scaling (include all indicators)
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
        up: "#10b981", // Emerald
        down: "#ef4444", // Rose
        unchanged: "#8b5cf6", // Purple
      },
      backgroundColor: {
        up: "rgba(16, 185, 129, 0.8)",
        down: "rgba(239, 68, 68, 0.8)",
        unchanged: "rgba(139, 92, 246, 0.8)",
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
      borderColor: "#ec4899", // Pink
      backgroundColor: "rgba(236, 72, 153, 0.1)",
      borderWidth: 3,
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
      borderColor: "#a855f7", // Purple
      backgroundColor: "rgba(168, 85, 247, 0.1)",
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
      borderColor: "#a855f7", // Purple
      backgroundColor: "rgba(168, 85, 247, 0.05)",
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
        borderColor: "#3b82f6", // Blue
        backgroundColor: "rgba(59, 130, 246, 0.1)",
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
        borderColor: "#ef4444", // Rose
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
            day: "dd MMM",
          },
        },
        title: {
          display: true,
          text: "Date",
          color: "#6b7280",
          font: {
            size: 12,
            weight: "500",
          },
        },
        grid: {
          color: "rgba(168, 85, 247, 0.1)",
        },
        ticks: {
          color: "#6b7280",
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
          color: "#6b7280",
          font: {
            size: 12,
            weight: "500",
          },
        },
        grid: {
          color: "rgba(168, 85, 247, 0.1)",
        },
        ticks: {
          color: "#6b7280",
          callback: function (value) {
            return "$" + value.toFixed(2);
          },
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
        },
        ticks: {
          color: "#f59e0b",
          callback: function (value) {
            return value.toFixed(0);
          },
        },
      },
      macd: {
        type: "linear",
        position: "right",
        title: {
          display: true,
          text: "MACD",
          color: "#3b82f6",
          font: {
            size: 12,
            weight: "500",
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "#3b82f6",
          callback: function (value) {
            return value.toFixed(3);
          },
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
          color: "#374151",
          filter: function (item) {
            // return !item.text.includes("RSI") && !item.text.includes("MACD"); // Not showing RSI and MACD
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
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#374151",
        bodyColor: "#6b7280",
        borderColor: "#a855f7",
        borderWidth: 1,
        cornerRadius: 8,
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
    <div className="bg-white border border-purple-200 rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 px-6 py-4 border-b border-purple-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 bg-clip-text text-transparent">
            Stock Price Chart with Technical Indicators
          </h3>
          <div className="text-sm text-gray-500 text-right">
            <p className="font-medium">Click legend to toggle indicators</p>
            <p className="text-xs">RSI & MACD hidden by default</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div style={{ height: "500px" }}>
          <Chart type="candlestick" data={data} options={options} />
        </div>

        {/* Quick Reference */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <strong className="text-gray-700">SMA:</strong> 
                </div>
                <span className="text-gray-600">
                ${signal.sma?.toFixed(2)} (20-day)
                </span>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-blue-50 border border-purple-200 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <strong className="text-gray-700">RSI:</strong> 
                </div>
                <span className="text-gray-600">
                {signal.rsi?.toFixed(1)} ({signal.rsi > 70 ? 'Overbought' : signal.rsi < 30 ? 'Oversold' : 'Neutral'})
                </span>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-purple-200 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <strong className="text-gray-700">MACD:</strong>
                </div>
                <span className="text-gray-600">
                {signal.macd?.value.toFixed(3)} / {signal.macd?.signal.toFixed(3)}
                </span>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <strong className="text-gray-700">Bollinger:</strong>
                </div>
                <span className="text-gray-600">
                ${signal.bollinger?.lower.toFixed(2)} - ${signal.bollinger?.upper.toFixed(2)}
                </span>
            </div>
        </div>


      </div>
    </div>
  );
};

export default StockChart;
