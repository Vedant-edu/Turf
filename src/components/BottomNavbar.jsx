import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Home, RefreshCw, Calendar, User } from "lucide-react"
import { useLocation, useNavigate } from 'react-router-dom';

export default function BottomBar() {
  const [activeTab, setActiveTab] = useState("home")
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "rebook", icon: RefreshCw, label: "Categories", path: "/rebook" },
    { id: "mybookings", icon: Calendar, label: "My Bookings", path: "/mybooking" },
    { id: "account", icon: User, label: "Account", path: "/account" },
  ]

  useEffect(() => {
    const foundTab = tabs.find(tab => tab.path === location.pathname);
    if (foundTab) {
      setActiveTab(foundTab.id);
    }
  }, [location.pathname]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-10 border-gray-200"> {/* Changed z-1 to z-10 */}
      <div className="max-w-3xl mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex flex-col items-center space-y-1 relative p-2 ${
                activeTab === tab.id ? "text-green-700" : "text-gray-500"
              }`}
              onClick={() => {
                setActiveTab(tab.id);
                navigate(tab.path);
              }}
            >
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: activeTab === tab.id ? 1.2 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <tab.icon className="w-6 h-5" />
              </motion.div>
              <span className="text-xs font-medium">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-700"
                  layoutId="activeTab"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
