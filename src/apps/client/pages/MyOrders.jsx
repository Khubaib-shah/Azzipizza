import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Clock, MapPin, ChefHat, Search, ArrowRight, ShoppingBag } from "lucide-react";
import { getStatusColor } from "@shared/utils/getStatusColor";

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("all"); // all, active, delivered

    useEffect(() => {
        const fetchOrders = () => {
            const stored = localStorage.getItem("orderHistory");
            if (stored) {
                try {
                    // Sort by newest first
                    const parsed = JSON.parse(stored).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setOrders(parsed);
                } catch (e) {
                    console.error("Failed to parse orders", e);
                }
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const isActiveOrder = (status) => {
        const s = status?.toLowerCase();
        return s !== "delivered" && s !== "cancelled";
    };

    const filteredOrders = orders.filter((order) => {
        if (activeTab === "active") return isActiveOrder(order.orderStatus);
        if (activeTab === "delivered") return !isActiveOrder(order.orderStatus);
        return true;
    });

    return (
        <div className="bg-gray-50 py-12 px-4 font-['Poppins']">
            <div className="max-w-4xl mx-auto">
               
                {/* Order List */}
                <div className="space-y-6">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                            <>
                             <header className="mb-4 sm:mb-10 text-center sm:text-left">
                    <h1 className="text-4xl font-bold font-['Playfair_Display'] text-gray-900 mb-2 !text-black">My Orders</h1>
                    <p className="text-gray-500">Track current deliveries and view your pizza history.</p>
                </header>

                {/* Tabs */}
                <div className="flex justify-center sm:justify-start gap-2 mb-4 sm:mb-8 bg-white p-1.5 rounded-xl shadow-sm w-fit mx-auto sm:mx-0 border border-gray-100">
                    {["all", "active", "delivered"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab
                                ? "bg-[var(--color-primary)] text-white shadow-md"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                            <div
                                key={order._id}
                                className="bg-white rounded-2xl p-6 sm:shadow-sm border sm:border-gray-100 hover:shadow-md transition-shadow group animate-scale-in"
                            >
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-gray-50 pb-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isActiveOrder(order.orderStatus) ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                            {isActiveOrder(order.orderStatus) ? <ChefHat size={24} /> : <Package size={24} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-lg text-gray-800">Order #{order._id.slice(-6).toUpperCase()}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.orderStatus)} bg-opacity-10 text-opacity-100`}>
                                                    {order.orderStatus}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 flex items-center gap-2">
                                                <Clock size={14} /> {new Date(order.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-[var(--color-primary)]">€{order.totalPrice.toFixed(2)}</p>
                                        <p className="text-xs text-gray-400">{order.items.length} items</p>
                                    </div>
                                </div>

                                {/* Items Preview */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                    <ul className="space-y-2">
                                        {order.items.map((item, i) => (
                                            <li key={i} className="flex justify-between items-start text-sm text-gray-700">
                                                <span><span className="font-bold">{item.quantity}x</span> {item.name} <span className="text-gray-400 italic font-light">{item.customizations ? `(${item.customizations})` : ""}</span></span>
                                                <span>€{Number(item.price).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Footer Info */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="text-gray-400" />
                                        <span className="truncate max-w-[250px]">{order.deliveryAddress.street}, {order.deliveryAddress.city}</span>
                                    </div>

                                    {isActiveOrder(order.orderStatus) && (
                                        <div className="w-full sm:w-auto">
                                            <button className="w-full sm:w-auto px-5 py-2 bg-amber-500 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors cursor-default">
                                                Track Live <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            </>

                        ))
                    ) : (
                        <div className="text-center sm:py-20 bg-transparent sm:bg-white sm:rounded-3xl sm:border sm:border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No orders found</h3>
                            <p className="text-gray-500 mb-8">Looks like you haven't ordered any pizzas yet!</p>
                            <Link to="/menu" className="btn-primary px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2">
                                Browse Menu <ArrowRight size={18} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOrders;
