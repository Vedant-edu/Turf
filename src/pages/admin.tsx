"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Pencil, Trash, X, Plus, Search } from "lucide-react";
import { Turf } from "../types";
import { motion, AnimatePresence } from "framer-motion";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminTurfManagement() {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [filteredTurfs, setFilteredTurfs] = useState<Turf[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [turf, setTurf] = useState({
    name: "",
    address: "",
    images: "",
    email: "",
    pricePerHour: "",
    amenities: "",
    rating: "",
    availableTimeSlots: "",
  });

  useEffect(() => {
    fetchTurfs();
  }, []);

  useEffect(() => {
    filterTurfs();
  }, [searchTerm, turfs]);

  async function fetchTurfs() {
    setIsLoading(true);
    const { data, error } = await supabase.from("turf_data").select("*");
    if (!error) {
      setTurfs(data as Turf[]);
      setFilteredTurfs(data as Turf[]);
    }
    setIsLoading(false);
  }

  const filterTurfs = () => {
    let results = [...turfs];
    
    // Filter by name search
    if (searchTerm) {
      results = results.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTurfs(results);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTurf({ ...turf, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      name: turf.name.trim(),
      address: turf.address.trim(),
      images: turf.images.split(",").map((img) => img.trim()),
      email: turf.email.trim(),
      pricePerHour: parseInt(turf.pricePerHour) || 0,
      amenities: turf.amenities.split(",").map((a) => a.trim()),
      rating: parseFloat(turf.rating) || 0,
      availableTimeSlots: turf.availableTimeSlots.split(",").map((s) => s.trim()),
    };

    try {
      if (editingId) {
        await supabase.from("turf_data").update(payload).eq("turf_id_new", editingId);
      } else {
        await supabase.from("turf_data").insert([payload]);
      }
      setShowModal(false);
      setTurf({ name: "", address: "", images: "", email: "", pricePerHour: "", amenities: "", rating: "", availableTimeSlots: "" });
      fetchTurfs();
    } catch (error) {
      console.error("Error saving turf:", error);
    }
  };

  const handleEdit = (t: Turf) => {
    setTurf({
      name: t.name,
      address: t.address,
      images: t.images.join(", "),
      email: t.email || "",
      pricePerHour: t.pricePerHour.toString() || "",
      amenities: t.amenities.join(", "),
      rating: t.rating.toString() || "",
      availableTimeSlots: t.availableTimeSlots.join(", "),
    });
    setEditingId(t.turf_id_new);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this turf?")) {
      await supabase.from("turf_data").delete().eq("turf_id_new", id);
      fetchTurfs();
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-9xl bg-black mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center bg-gray-800 text-white p-4 rounded-xl border border-gray-700 shadow-lg mb-6">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Turf Management
        </h2>
        <button 
          onClick={() => {
            setEditingId(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all shadow-md"
        >
          <Plus size={18} />
          Add Turf
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Name Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search by turf name..."
              className="w-full pl-9 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          
        </div>
      </div>

      {/* Turf List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-medium text-gray-300">
            Listed Turfs
          </h2>
          <span className="text-sm text-gray-400">
            Showing {filteredTurfs.length} of {turfs.length} turfs
          </span>
        </div>
        
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
            <p className="text-gray-400">Loading turfs...</p>
          </div>
        ) : filteredTurfs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-700 mb-3">
              <X className="h-5 w-5 text-gray-500" />
            </div>
            <h3 className="text-sm font-medium text-gray-300 mb-1">
              {searchTerm ? "No matching turfs found" : "No turfs found"}
            </h3>
            <p className="text-xs text-gray-500">
              {searchTerm 
                ? "Try adjusting your search criteria" 
                : "Click 'Add Turf' to create your first turf listing"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-700">
            <AnimatePresence>
              {filteredTurfs.map((t) => (
                <motion.li 
                  key={t.turf_id_new}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-200">{t.name}</h3>
                      <p className="text-sm text-gray-400">
                        {t.address}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-1 rounded">
                          ₹{t.pricePerHour}/hr
                        </span>
                        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                          {t.availableTimeSlots.length} slots
                        </span>
                        <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded">
                          {t.pincode}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEdit(t)}
                        className="p-2 bg-blue-900/50 text-blue-300 rounded-lg hover:bg-blue-800/50 transition-colors"
                        aria-label="Edit"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(t.turf_id_new)}
                        className="p-2 bg-red-900/50 text-red-300 rounded-lg hover:bg-red-800/50 transition-colors"
                        aria-label="Delete"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Modal (same as previous implementation) */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-md w-full"
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-gray-200">
                  {editingId ? "Edit Turf" : "Add New Turf"}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-200"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Turf Name</label>
                    <input 
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                      name="name" 
                      placeholder="Turf Name" 
                      value={turf.name} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                    <textarea 
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                      name="address" 
                      placeholder="Full address" 
                      value={turf.address} 
                      onChange={handleChange} 
                      required 
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Price/Hour (₹)</label>
                    <input 
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                        name="pricePerHour" 
                        type="number" 
                        placeholder="500" 
                        value={turf.pricePerHour} 
                        onChange={handleChange} 
                        required 
                      />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Owner Email</label>
                    <input 
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                      name="email" 
                      type="email" 
                      placeholder="owner@example.com" 
                      value={turf.email} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Image URLs (comma separated)</label>
                    <textarea 
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-gray-200"
                      name="images" 
                      placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" 
                      value={turf.images} 
                      onChange={handleChange} 
                      required 
                      rows={2}
                    />
                  </div>
                </div>
                
                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all font-medium"
                  >
                    {editingId ? "Update Turf" : "Add Turf"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}