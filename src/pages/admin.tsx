"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Pencil, Trash, X } from "lucide-react";
import { Turf } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AdminTurfManagement() {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [turf, setTurf] = useState({
    name: "",
    address: "",
    pincode: "",
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

  async function fetchTurfs() {
    const { data, error } = await supabase.from("turf_data").select("*");
    if (!error) setTurfs(data as Turf[]);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTurf({ ...turf, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const payload = {
      name: turf.name.trim(),
      address: turf.address.trim(),
      pincode: turf.pincode.toString().trim(),
      images: turf.images.split(",").map((img) => img.trim()),
      email: turf.email.trim(),
      pricePerHour: parseInt(turf.pricePerHour) || 0,
      amenities: turf.amenities.split(",").map((a) => a.trim()),
      rating: parseFloat(turf.rating) || 0,
      availableTimeSlots: turf.availableTimeSlots.split(",").map((s) => s.trim()),
    };

    if (editingId) {
      await supabase.from("turf_data").update(payload).eq("turf_id", editingId);
      setEditingId(null);
    } else {
      await supabase.from("turf_data").insert([payload]);
    }
    setShowModal(false);
    setTurf({ name: "", address: "", pincode: "", images: "", email: "", pricePerHour: "", amenities: "", rating: "", availableTimeSlots: "" });
    fetchTurfs();
  };

  const handleEdit = (t: Turf) => {
    setTurf({
      name: t.name,
      address: t.address,
      pincode: t.pincode,
      images: t.images.join(", "),
      email: t.email || "",
      pricePerHour: t.pricePerHour.toString() || "",
      amenities: t.amenities.join(", "),
      rating: t.rating.toString() || "",
      availableTimeSlots: t.availableTimeSlots.join(", "),
    });
    setEditingId(t.turf_id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    await supabase.from("turf_data").delete().eq("turf_id", id);
    fetchTurfs();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Navbar */}
      <div className="flex justify-between items-center bg-gray-800 text-white p-4 rounded-lg">
        <h2 className="text-lg font-semibold">Admin</h2>
        <button onClick={() => setShowModal(true)} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
          Add Turf
        </button>
      </div>

      {/* Turf List */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Listed turfs</h2>
      <ul className="space-y-4">
        {turfs.map((t) => (
          <li key={t.turf_id} className="p-4 bg-gray-100 rounded-lg flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{t.name}</h3>
              <p className="text-sm text-gray-600">{t.address}, {t.pincode}</p>
            </div>
            <div className="flex space-x-4">
              <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEdit(t)}>
                <Pencil size={20} />
              </button>
              <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(t.turf_id)}>
                <Trash size={20} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Turf" : "Edit Turf"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-600 hover:text-gray-800">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full p-2 border rounded" name="name" placeholder="Turf Name" value={turf.name} onChange={handleChange} required />
              <textarea className="w-full p-2 border rounded" name="address" placeholder="Address" value={turf.address} onChange={handleChange} required />
              <input className="w-full p-2 border rounded" name="pincode" placeholder="Pincode" value={turf.pincode} onChange={handleChange} required />
              <input className="w-full p-2 border rounded" name="images" placeholder="Images (comma-separated URLs)" value={turf.images} onChange={handleChange} required />
              <input className="w-full p-2 border rounded" name="email" placeholder="Owner Email" value={turf.email} onChange={handleChange} required />
              <input className="w-full p-2 border rounded" name="pricePerHour" type="number" placeholder="Price per Hour" value={turf.pricePerHour} onChange={handleChange} required />
              <button type="submit" className="w-full p-2 bg-green-600 text-white rounded hover:bg-green-700">
                {editingId ? "Update Turf" : "Add Turf"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
