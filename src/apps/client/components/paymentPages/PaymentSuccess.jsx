import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Context from "@shared/context/dataContext";
import { baseUri } from "@shared/config/api";
import { saveOrderToLocalStorage } from "@shared/utils/SavedOrderSucces";
import { Check, ArrowRight } from "lucide-react";

const PaymentSuccess = () => {
  const { clearCart } = useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("Processing payment...");
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const paymentId = query.get("paymentId");
    const PayerID = query.get("PayerID");
    const orderId = query.get("orderId");
    // We will fetch the name from the server to be sure, or fallback to URL
    const urlName = query.get("order");

    if (!paymentId || !PayerID || !orderId) {
      setStatus("Invalid payment details.");
      setLoading(false);
      navigate("/payment-error", { replace: true });
      return;
    }

    const finalizePayment = async () => {
      try {
        setLoading(true);
        const res = await baseUri.post("/api/payment/success", {
          paymentId,
          PayerID,
          orderId,
        });

        if (res.data.success) {
          // Fetch full order to save to local storage and get name
          try {
            const orderRes = await baseUri.get(`/api/orders/${orderId}`);
            if (orderRes.data) {
              saveOrderToLocalStorage(orderRes.data);
              setCustomerName(orderRes.data.name);
            }
          } catch (fetchErr) {
            console.error("Failed to fetch order details", fetchErr);
            // Fallback to URL name if available
            if (urlName) setCustomerName(urlName);
          }

          clearCart();
          localStorage.setItem("showInstallPromptAfterOrder", "true");
          setSuccess(true);
        } else {
          console.error("Payment failed", res.data);
          navigate("/payment-error", { replace: true });
        }
      } catch (err) {
        console.error("Payment execution failed", err);
        navigate("/payment-error", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    finalizePayment();
  }, [location.search, navigate, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 font-['Poppins']">
      <div className="bg-white rounded-[2rem] shadow-xl p-8 md:p-12 max-w-md w-full text-center relative overflow-hidden animate-scale-in">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500"></div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">{status}</p>
          </div>
        ) : success ? (
          <div className="relative z-10">
            <div className="mx-auto w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm animate-bounce">
              <Check size={40} strokeWidth={3} />
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-2 font-['Playfair_Display']">
              Payment Successful!
            </h1>
            <p className="text-gray-500 mb-8">
              Your payment has been secured and processed. We are starting your order immediately.
            </p>

            {/* Transaction Details Card */}
            <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100 text-left space-y-3">
              <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                <span className="text-gray-500 text-sm">Order For</span>
                <span className="font-semibold text-gray-800 capitalize">{customerName || "Customer"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Transaction ID</span>
                <span className="font-mono text-xs text-gray-400">{new URLSearchParams(location.search).get("orderId")}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold shadow-lg hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              Return to Home <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className="text-gray-500">Redirecting...</div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
