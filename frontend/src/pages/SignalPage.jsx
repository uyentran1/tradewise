import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api';

const SignalPage = () => {
    const [data, setData] = useState(null); // to store API result
    const [loading, setLoading] = useState(true); // loading flag
    const [error, setError] = useState(null); // error message
    const { symbol } = useParams();

    useEffect(() => {
        const fetchSignal = async () => {
            try {
                const res = await API.get(`/signals?symbol=${symbol}`);
                setData(res.data);
                setError('');
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || 'Failed to fetch signal');
            } finally {
                setLoading(false);
            }
        };

        fetchSignal();
    }, []);

    if (loading) return <p>Loading signal...</p>;
    if (error) return <p style={{ color: 'red'}}>{error}</p>;

    return (
        <div>
            <h1>Signal for {data.symbol}</h1>
            <p><strong>Recommendation:</strong> {data.recommendation}</p>

            <h3>Indicators</h3>
            <ul>
                <li>SMA: {data.sma.toFixed(2)}</li>
                <li>RSI: {data.rsi.toFixed(2)}</li>
                <li>MACD: {data.macd.value.toFixed(2)} (signal: {data.macd.signal.toFixed(2)})</li>
                <li>Bollinger Upper: {data.bollinger.upper.toFixed(2)}</li>
                <li>Bollinger Lower: {data.bollinger.lower.toFixed(2)}</li>
                <li>Current Price: {data.bollinger.currentPrice.toFixed(2)}</li>
            </ul>

            <h3>Natural Language Explanation</h3>
            <ul>
                {data.explanation.map((sentence, index) => (
                    <li key={index}>{sentence}</li>
                ))}
            </ul>
        </div>
    );
};

export default SignalPage;