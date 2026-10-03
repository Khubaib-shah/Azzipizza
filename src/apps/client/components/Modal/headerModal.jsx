import { Fragment } from "react";
import { Dialog, DialogBackdrop, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Link, useLocation } from "react-router-dom";
import {
  X,
  Home,
  Menu,
  Info,
  Phone,
  ShoppingBag,
  Instagram,
  Facebook,
  Twitter
} from "lucide-react";
import logo from "../../assets/logo-pizza.png";

export default function HeaderModal({ open, setOpen, navItems }) {
  const location = useLocation();

  // Supplementary links
  const accountLinks = [
    { path: "/my-orders", label: "My Orders", icon: ShoppingBag },
  ];

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[60]" onClose={setOpen}>
        {/* Backdrop */}
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ease-in-out data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto relative w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    {/* Header */}
                    <div className="px-6 py-6 bg-[var(--color-primary)] text-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img src={logo} alt="Logo" className="h-10 w-10 object-contain bg-white/10 rounded-full p-1" />
                          <div>
                            <h2 className="text-xl font-bold font-serif">Azzipizza</h2>
                            <p className="text-xs text-white/80 italic">Premium Italian Taste</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="rounded-full p-2 text-white hover:bg-white/20 transition-colors focus:outline-none"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <X size={24} />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-8">
                      {/* Main Navigation */}
                      <div className="space-y-2 mb-10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Menu</p>
                        {navItems.map((item) => {
                          const isActive = location.pathname === item.path;
                          // Choose icon based on label (simplified mapping)
                          let Icon = Home;
                          if (item.label.includes("Menu")) Icon = Menu;
                          if (item.label.includes("About")) Icon = Info;
                          if (item.label.includes("Contact")) Icon = Phone;

                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setOpen(false)}
                              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                            >
                              <Icon
                                size={20}
                                className={`transition-colors ${isActive ? "text-[var(--color-primary)]" : "text-gray-400 group-hover:text-gray-600"}`}
                              />
                              <span className="text-lg">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Account Links */}
                      <div className="space-y-2 mb-10">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Account</p>
                        {accountLinks.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
                          >
                            <item.icon size={20} className="text-gray-400 group-hover:text-gray-600" />
                            <span className="text-base font-medium">{item.label}</span>
                          </Link>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="mt-8">
                        <Link
                          to="/#full-menu"
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-center w-full py-4 bg-[var(--color-primary)] text-white rounded-xl font-bold shadow-lg shadow-red-200 btn-primary hover:-translate-y-1 transition-all"
                        >
                          Order Now 🍕
                        </Link>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100 px-6 py-6 bg-gray-50">
                      <div className="flex justify-center gap-6 mb-4">
                        <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Instagram size={24} /></a>
                        <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Facebook size={24} /></a>
                        <a href="#" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors"><Twitter size={24} /></a>
                      </div>
                      <p className="text-center text-xs text-gray-400">
                        © 2026 Azzipizza. All rights reserved.
                      </p>
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
