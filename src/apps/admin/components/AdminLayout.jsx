import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./common/Header";
import AudioManager from "./AudioManager";
import { AdminSocketProvider } from "../context/AdminSocketContext";
import { AdminDataProvider } from "../context/AdminDataContext";

const AdminLayout = () => {
  // Prevent browser auto-translate (e.g. Chrome Translate) from mutating React text nodes
  useEffect(() => {
    const html = document.documentElement;
    const prevTranslate = html.getAttribute("translate");
    html.setAttribute("translate", "no");
    html.classList.add("notranslate");

    return () => {
      if (prevTranslate === null) {
        html.removeAttribute("translate");
      } else {
        html.setAttribute("translate", prevTranslate);
      }
      html.classList.remove("notranslate");
    };
  }, []);

  return (
    <AdminSocketProvider>
      <AdminDataProvider>
        <div translate="no" className="min-h-screen bg-slate-50 notranslate">
          <AudioManager />
          <Header />
          <div className="flex min-h-screen">
            <Sidebar />

            {/* Spacer to push main content past the fixed desktop Sidebar (w-64) */}
            <div className="hidden md:block w-64 shrink-0" />

            <main className="flex-1 min-w-0 mt-16 md:mt-20">
              <Outlet />
            </main>
          </div>
        </div>
      </AdminDataProvider>
    </AdminSocketProvider>
  );
};

export default AdminLayout;
