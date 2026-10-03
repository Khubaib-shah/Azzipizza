const OrderModal = ({ order, eta, onClose }) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Customer Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Customer Name</p>
              <p className="text-sm font-medium text-gray-900">{order.name}</p>
            </div>
            <div>
              <p className="!text-sm text-gray-500">Contact</p>
              <p className="text-sm font-medium text-gray-900">
                {order.phoneNumber || "N/A"}
              </p>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <p className="text-sm text-gray-500">Delivery Address</p>
            <p className="text-sm font-medium text-gray-900">
              {order.deliveryAddress.street}, {order.deliveryAddress.city},{" "}
              {order.deliveryAddress.postalCode}
            </p>
          </div>

          {/* Order Status and ETA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-sm font-medium text-gray-900">
                {order.orderStatus}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estimated Time</p>
              <p className="text-sm font-medium text-gray-900">
                {eta || "Calculating..."}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <p className="text-sm text-gray-500">Order Items</p>
            <div className="mt-2 space-y-2">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.quantity}x {item.menuItem.name}
                    </p>
                    {item.menuItem.customizations && (
                      <p className="text-xs text-gray-500 mt-1">
                        Customizations: {item.customizations}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-gray-700">
                    ${(item.quantity * item.menuItem.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total Price */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">Total Price</p>
            <p className="text-lg font-semibold text-gray-900">
              ${order.totalPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
