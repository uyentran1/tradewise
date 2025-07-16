import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Tooltip } from "react-tooltip";
import API from "../api";
import Layout from "../layouts/Layout";
import CandlestickChart from '../components/CandleStickChart';
import { calculateSMAArray } from '../utilities/indicators';


const SignalPage = () => {
  const { symbol } = useParams();
  const [signal, setSignal] = useState(null); // stores API response
  const [loading, setLoading] = useState(true); // loading flag
  const [error, setError] = useState(null); // error message
  const [ohlc, setOhlc] = useState([]);
  const [sma, setSma] = useState([]); 

  useEffect(() => {
    const fetchSignal = async () => {
      try {
        const res = await API.get(`/signals?symbol=${symbol}`);
        setSignal(res.data);
        setError("");

        const prices = res.data.prices; // assuming this is OHLC
        setOhlc(prices);
        setSma(calculateSMAArray(prices)); 
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Failed to fetch signal");
      } finally {
        setLoading(false);
      }
    };

    fetchSignal();
  }, [symbol]); // Runs effect when symbol changes

  if (loading) return <div className="text-center mt-8">Loading signal...</div>;
  if (error)
    return <div className="text-center text-red-600 mt-8">{error}</div>;
  if (!signal) return null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto p-6">
        <Link
          to="/search"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Back To Search
        </Link>

        {/* Stock Info & Signal Overview */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
          <div>
            <h1 className="text-4xl font-bold">{symbol.toUpperCase()}</h1>
            <p className="text-green-600 text-2xl font-semibold">
              {" "}
              ${signal.bollinger.currentPrice}{" "}
            </p>
          </div>

          {/* Overall Signal Box*/}
          <div className="border rounded p-4 w-full md:w-1/2 bg-yellow-50">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Overall Signal:{" "}
              <span className="text-green-700">{signal.recommendation}</span>
            </h3>
            <ul className="text-sm text-gray-600">
              <li>
                <strong>Trend:</strong> Needs logic
              </li>
              <li>
                <strong>Momentum:</strong> Needs logic
              </li>
              <li>
                <strong>Volatility:</strong> Needs logic
              </li>
              <li>
                <strong>Confidence:</strong> Needs logic
              </li>
            </ul>
          </div>
        </div>

        {/* Interactive Chart */}
        <section className="w-full h-[400px] bg-blue-100 rounded mb-8 flex items-center justify-center">
          <p className="text-gray-600">
            [ Chart Placeholder: candlestick, MA overlay, volume bars ]
            <section className="mb-8">
              <CandlestickChart ohlc={ohlc} sma={sma} />
            </section>
          </p>
        </section>

        {/* Technical Signals */}
        <section className="bg-blue-50 p-6 rounded mb-8">
          <h3 className="text-lg font-semibold text-blue-700 mb-4">
            Technical Signals
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SignalItem
              name="RSI"
              value={signal.rsi.toFixed(2)}
              tag="HOLD"
              tooltip="RSI indicates overbought/oversold conditions."
            />
            <SignalItem
              name="MACD"
              value={signal.macd.value.toFixed(2)}
              tag="BUY"
              tooltip="MACD shows momentum and trend direction."
            />
            <SignalItem
              name="MA"
              value="Golden Cross"
              tag="BUY"
              tooltip="Moving Averages help identify trends."
            />
            <SignalItem
              name="Bollinger Bands"
              value="Upper Band"
              tag="SELL"
              tooltip="Bollinger Bands indicate volatility and price levels."
            />
          </div>
        </section>

        {/* Summary */}
        <section className="bg-white border rounded p-6 text-sm text-gray-700">
          <h4 className="text-blue-700 font-bold mb-2">Signal Summary</h4>
          <ul className="list-disc pl-5 space-y-1">
            {signal.explanation.map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </section>
      </div>
    </Layout>
  );
};

const SignalItem = ({ name, value, tag, tooltip }) => {
  const tagColor = {
    BUY: "bg-green-100 text-green-700",
    SELL: "bg-red-100 text-red-700",
    HOLD: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="flex justify-between items-center bg-white border rounded px-4 py-3">
      <div>
        <div className="flex items-center gap-1">
          <p className="font-semibold">{name}</p>
          {tooltip && (
            <>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  tagColor[tag] || "bg-gray-200"
                }`}
              >
                {tag}
              </span>
              <span
                data-tooltip-id={`tooltip-${name}`}
                data-tooltip-content={tooltip}
                className="ml-1 text-xs text-gray-400 cursor-help"
              >
                ?
              </span>
              <Tooltip id={`tooltip-${name}`} />
            </>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-500">{value}</p>
    </div>
  );
};

export default SignalPage;