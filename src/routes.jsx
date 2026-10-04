import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

// Client App Components
import ClientApp from "./apps/client/App";
const Landing = lazy(() => import("./apps/client/pages/Landing"));
const About = lazy(() => import("./apps/client/pages/About"));
const Contact = lazy(() => import("./apps/client/pages/ContactUs"));
const MyOrders = lazy(() => import("./apps/client/pages/MyOrders"));
const Cart = lazy(() => import("./apps/client/pages/Cart"));
const OrderSuccess = lazy(
  () => import("./apps/client/components/paymentPages/OrderSuccess"),
);
const PaymentSuccess = lazy(
  () => import("./apps/client/components/paymentPages/PaymentSuccess"),
);
const PaymentError = lazy(
  () => import("./apps/client/components/paymentPages/PaymentError"),
);
const PaymentCancelled = lazy(
  () => import("./apps/client/components/paymentPages/PaymentCancelled"),
);
const CategoryPage = lazy(() => import("./apps/client/pages/CategoryPage"));

// Admin App Components
import AdminProtectedRoute from "./apps/admin/components/ProtectedRoute";
const AdminLogin = lazy(() => import("./apps/admin/pages/Login"));
const AdminOrders = lazy(() => import("./apps/admin/pages/Orders"));
const AdminListItems = lazy(() => import("./apps/admin/pages/ListItems"));
const AdminNotFound = lazy(() => import("./apps/admin/pages/NotFound"));
const AdminDashboard = lazy(() => import("./apps/admin/pages/Dashboard"));
const AdminReports = lazy(() => import("./apps/admin/pages/Reports"));

// Helper for Admin Layout (it was in admin/src/App.jsx)
import AdminLayout from "./apps/admin/components/AdminLayout"; // I will create this

const router = createBrowserRouter([
  // Client Routes
  {
    path: "/",
    element: (
      <div className="client-theme">
        <ClientApp />
      </div>
    ),
    children: [
      { path: "/", element: <Landing /> },
      { path: "about", element: <About /> },
      { path: "contatti", element: <Contact /> },
      { path: "menu", element: <CategoryPage defaultCategory="menu" title="Menu Completo Pizzeria e Fritti | Azzipizza Bologna" description="Sfoglia il nostro menu completo di pizze cotte a legna, fritti artigianali, dolci e bibite. Scopri tutti i sapori autentici di Azzipizza a Bologna." /> },
      { path: "pizze", element: <CategoryPage defaultCategory="Pizze Rosse" title="Pizze Rosse e Bianche Artigianali | Azzipizza Bologna" description="Scopri le nostre pizze classiche e speciali. Impasto a lunga lievitazione e ingredienti di prima scelta. Ordina ora la tua pizza preferita!" /> },
      { path: "fritti", element: <CategoryPage defaultCategory="Fritti" title="Fritti Artigianali Caldi e Croccanti | Azzipizza Bologna" description="I migliori fritti di Bologna: supplì, crocchette e patatine preparati freschi ogni giorno. L'antipasto perfetto per la tua pizza." /> },
      { path: "cart", element: <Cart /> },
      { path: "ordina", element: <Cart /> },
      { path: "order-success/:orderId", element: <OrderSuccess /> },
      { path: "payment-success", element: <PaymentSuccess /> },
      { path: "payment-error", element: <PaymentError /> },
      { path: "payment-cancelled", element: <PaymentCancelled /> },
      { path: "my-orders", element: <MyOrders /> },
    ],
  },
  // Admin Routes
  {
    path: "/admin/login",
    element: (
      <div className="admin-theme">
        <AdminLogin />
      </div>
    ),
  },
  {
    path: "/admin",
    element: (
      <AdminProtectedRoute>
        <div className="admin-theme">
          <AdminLayout />
        </div>
      </AdminProtectedRoute>
    ),
    children: [
      { path: "", element: <AdminDashboard /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "orders", element: <AdminOrders /> },
      { path: "reports", element: <AdminReports /> },
      { path: "list-items", element: <AdminListItems /> },
      { path: "*", element: <AdminNotFound /> },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default router;
