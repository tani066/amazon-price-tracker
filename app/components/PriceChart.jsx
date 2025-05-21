// components/PriceChart.js
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
  } from 'recharts';
  
  export default function PriceChart({ prices }) {
    const data = prices.map(p => ({
      price: p.price,
      timestamp: new Date(p.timestamp).toLocaleDateString(),
    }));
  
    return (
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Price History</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="timestamp" />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#eee" />
            <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
  