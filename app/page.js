"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

export default function Home() {
  const [url, setUrl] = useState('');
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [otherPrices, setOtherPrices] = useState([]);

  const fetchHistory = async (productId) => {
    try {
      const hist = await axios.get(`/api/history?id=${productId}`);
      const sorted = hist.data
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map((item) => ({
          ...item,
          formattedDate: new Date(item.createdAt).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }));

      setHistory(sorted);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/track', { url });
      setProduct(res.data.product);
      setOtherPrices(res.data.otherPrices || []);
      await fetchHistory(res.data.product.id);
    } catch (error) {
      console.error('Tracking failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!product) return;
    const interval = setInterval(() => fetchHistory(product.id), 1800000); // every 30 minutes
    return () => clearInterval(interval);
  }, [product]);

  const priceDiff =
    history.length > 1
      ? history[history.length - 1].price - history[history.length - 2].price
      : 0;

  const prices = history.map((h) => h.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const avgPrice = (prices.reduce((acc, p) => acc + p, 0) / prices.length).toFixed(2);

  return (
    <div className="bg-[#0b1120] text-white min-h-screen p-6 max-w-4xl mx-auto rounded-xl shadow-xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-400 tracking-tight">📈 PricePulse</h1>

      <div className="flex gap-4 mb-8">
        <input
          type="text"
          placeholder="Paste Amazon product URL..."
          className="border border-gray-700 bg-[#1f2937] text-white p-3 w-full rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Track'}
        </button>
      </div>

      {product && (
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
          <img src={product.image} alt={product.title} className="w-32 h-auto rounded-lg shadow-md" />
          <div className="flex-1">
            <h2 className="text-2xl font-semibold leading-snug mb-2">{product.title}</h2>
            <p className="text-green-400 font-bold text-xl">₹{history[history.length - 1]?.price}</p>
            <p
              className={`mt-1 text-sm ${
                priceDiff > 0 ? 'text-red-400' : 'text-green-400'
              } font-medium`}
            >
              {priceDiff > 0 ? '↑' : '↓'} ₹{Math.abs(priceDiff).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Last updated: {lastUpdated}</p>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-6 bg-[#1f2937] p-6 rounded-lg shadow-inner">
          <h3 className="text-lg font-semibold mb-4 text-blue-300">Price History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
              <XAxis dataKey="formattedDate" stroke="#ccc" interval="preserveStartEnd" minTickGap={10} />
              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#4B5563', color: '#fff' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} isAnimationActive />
              <ReferenceLine
                y={maxPrice}
                label={{ value: `Highest: ₹${maxPrice}`, position: 'right', fill: '#f87171' }}
                stroke="#f87171"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={minPrice}
                label={{ value: `Lowest: ₹${minPrice}`, position: 'right', fill: '#60a5fa' }}
                stroke="#60a5fa"
                strokeDasharray="3 3"
              />
              <ReferenceLine
                y={parseFloat(avgPrice)}
                label={{ value: `Avg: ₹${avgPrice}`, position: 'right', fill: '#facc15' }}
                stroke="#facc15"
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {otherPrices.length > 0 && (
        <div className="mt-10 bg-[#1f2937] p-6 rounded-lg border border-blue-800 shadow-md">
          <h3 className="text-xl font-semibold mb-5 text-blue-400">Compare on Other Platforms</h3>
          <ul className="space-y-4">
            {otherPrices.map((item, idx) => (
              <li
                key={idx}
                className="bg-[#111827] p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center hover:bg-[#1a202e] transition"
              >
                <div>
                  <p className="font-medium text-white">{item.platform}: {item.title}</p>
                  <p className="text-green-400 font-bold text-lg mt-1">₹{item.price}</p>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                >
                  View Deal
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loading && !product && (
        <p className="mt-6 text-gray-400 text-center animate-pulse">Fetching data, please wait...</p>
      )}
    </div>
  );
}
