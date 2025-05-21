// components/ProductCard.js
export default function ProductCard({ product }) {
    return (
      <div className="bg-white p-4 rounded shadow mb-6 text-center">
        <img src={product.image} alt={product.title} className="mx-auto h-48 object-contain" />
        <h2 className="text-xl font-semibold mt-2">{product.title}</h2>
        <p className="text-lg text-green-600 font-bold mt-1">₹{product.prices.at(-1)?.price}</p>
      </div>
    );
  }
  