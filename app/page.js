// --- app/page.js ---
"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

export default function Home() {
  const [url, setUrl] = useState('');
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

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

  const prices = history.map(h => h.price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const avgPrice = (prices.reduce((acc, p) => acc + p, 0) / prices.length).toFixed(2);

  return (
    <div className="bg-[#0b1120] text-white min-h-screen p-6 max-w-4xl mx-auto rounded-xl shadow-xl">
      <h1 className="text-3xl font-bold mb-6 text-center">PricePulse</h1>
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter Amazon product URL"
          className="border border-gray-600 bg-[#1f2937] text-white p-3 w-full rounded-lg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Track'}
        </button>
      </div>

      {product && (
        <div className="flex items-start gap-6">
          <img src={product.image} alt={product.title} className="w-32 h-auto rounded-lg" />
          <div>
            <h2 className="text-xl font-semibold leading-snug mb-2">{product.title}</h2>
            <p className="text-green-400 font-bold text-lg">Latest Price : ₹{history[history.length - 1]?.price}</p>
            <p className={`mt-1 text-sm ${priceDiff > 0 ? 'text-red-400' : 'text-green-400'}`}>
              {priceDiff > 0 ? '↑' : '↓'} ₹{Math.abs(priceDiff).toFixed(2)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Last updated: {lastUpdated}</p>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8 bg-[#1f2937] p-4 rounded-lg shadow-inner">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history}>
            <XAxis
  dataKey="formattedDate"
  stroke="#ccc"
  interval="preserveStartEnd"
  minTickGap={10}
/>

              <YAxis stroke="#ccc" />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#4B5563', color: '#fff' }}
                labelStyle={{ color: '#9CA3AF' }}
              />
              <Line type="monotone" dataKey="price" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} isAnimationActive={true} />
              <ReferenceLine y={maxPrice} label={{ value: `Highest: ₹${maxPrice}`, position: 'right', fill: '#f87171' }} stroke="#f87171" strokeDasharray="3 3" />
              <ReferenceLine y={minPrice} label={{ value: `Lowest: ₹${minPrice}`, position: 'right', fill: '#60a5fa' }} stroke="#60a5fa" strokeDasharray="3 3" />
              <ReferenceLine y={parseFloat(avgPrice)} label={{ value: `Average: ₹${avgPrice}`, position: 'right', fill: '#facc15' }} stroke="#facc15" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {loading && !product && <p className="mt-4 text-gray-400 text-center">Fetching data...</p>}
    </div>
  );
}
