import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Context from "@shared/context/dataContext";
import { baseUri } from "@shared/config/api";
import { Check, ShoppingBag, ArrowRight } from "lucide-react";

const OrderSuccess = () => {
  const { clearCart } = useContext(Context);
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cleared, setCleared] = useState(false);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    if (orderId) {
      const fetchOrder = async () => {
        try {
          const res = await baseUri.get(`/api/orders/${orderId}`);
          setCustomerName(res.data.name);
        } catch (error) {
          console.error("Error fetching order:", error);
        }
      };
      fetchOrder();
    }

    if (!cleared && orderId) {
      setCleared(true);
      setLoading(false);
      clearCart();
      localStorage.setItem("showInstallPromptAfterOrder", "true");
    } else if (!orderId) {
      setLoading(false);
    }
  }, [orderId, clearCart, cleared]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-['Poppins']">
      <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden animate-scale-in">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--color-primary)] to-amber-500"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100 rounded-full opacity-50 blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-100 rounded-full opacity-50 blur-2xl"></div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Finalizing your order...</p>
          </div>
        ) : (
          <div className="relative z-10">
            <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm animate-bounce">
              <Check size={40} strokeWidth={3} />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-['Playfair_Display']">
              Order Confirmed!
            </h1>
            <p className="text-xl font-semibold text-[var(--color-primary)] mb-2 capitalize">
              Thank you, {customerName || "Customer"}!
            </p>
            <p className="text-gray-500 mb-8">
              Your delicius order is now being prepared.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-8 border border-gray-100">
              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">Order ID</p>
              <p className="text-sm font-mono text-gray-800 break-all select-all">{orderId}</p>
              <div className="my-3 border-t border-dashed border-gray-200"></div>
              <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
                <ShoppingBag size={14} className="text-[var(--color-primary)]" />
                Estimated Delivery: <span className="font-bold text-gray-800">35-40 mins</span>
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/")}
                className="w-full py-4 bg-[var(--color-primary)] text-white rounded-xl font-bold shadow-lg hover:shadow-red-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Continue Shopping <ArrowRight size={18} />
              </button>

              <button
                onClick={() => navigate("/contact")}
                className="w-full py-3 text-gray-400 hover:text-gray-600 font-medium text-sm transition-colors"
              >
                Need help? Contact Support
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;
