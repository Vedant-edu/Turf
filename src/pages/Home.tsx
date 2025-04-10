import { useState, useEffect } from "react";
import TurfCard from "../components/TurfCard";
import SearchBar from "../components/SearchBar";
import PincodePage from "./PincodePage";
import { createClient } from "@supabase/supabase-js";
import { MapPin } from "lucide-react";
import BottomBar from "../components/BottomBar";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Turf {
  id: string;
  name: string;
  address: string;
  pincode: string;
  images: string[];
  pricePerHour: number;
  amenities: string[];
  rating: number;
  availableTimeSlots: string[];
}

export default function Home() {
  const [needsPincode, setNeedsPincode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [filteredTurfs, setFilteredTurfs] = useState<Turf[]>([]);
  const [pincode, setPincode] = useState<string | null>(localStorage.getItem("pincode") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedPincode = localStorage.getItem("pincode");
    if (!storedPincode) {
      setNeedsPincode(true);
    } else {
      setPincode(storedPincode);
      fetchTurfs(storedPincode);
    }
  }, []);

  useEffect(() => {
    filterTurfs();
  }, [searchQuery, pincode, turfs]);

  async function fetchTurfs(selectedPincode: string) {
    setLoading(true);
    const { data, error } = await supabase.from("turf_data").select("*").eq("pincode", selectedPincode);
    if (!error) {
      setTurfs(data);
    }
    setLoading(false);
  }

  const filterTurfs = () => {
    const filtered = turfs.filter((turf) =>
      searchQuery
        ? turf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          turf.address.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    );
    setFilteredTurfs(filtered);
  };

  const handlePincodeSubmit = (newPincode: string) => {
    localStorage.setItem("pincode", newPincode);
    setPincode(newPincode);
    setNeedsPincode(false);
    fetchTurfs(newPincode);
  };

  const handleChangePincode = () => {
    setNeedsPincode(true);
  };

  if (needsPincode) {
    return <PincodePage onSubmit={handlePincodeSubmit} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div
          className="max-w-3xl mx-auto h-36 rounded-b-sm home-page-content"
          style={{
            backgroundImage:
              "url(https://img.freepik.com/free-photo/abstract-gradient-neon-lights_23-2149279092.jpg?ga=GA1.1.1761220439.1741347886&semt=ais_hybrid&w=740)",
            backgroundSize: "cover",
            transition: "transform 0.5s ease-in-out",
            transitionTimingFunction: "ease-in-out",
            position: "relative",
            borderRadius: "0 0 20px 20px",
          }}
        >
          <h1 className="text-[56px] px-4 flex justify-between text-white font-mono relative z-10">
            Turfer
            <span className="text-sm text-white flex items-end ml-2 mb-6">
              <MapPin />
              <button onClick={handleChangePincode} className="ml-2 underline">
                {pincode}
              </button>
            </span>
          </h1>

          <div className="absolute inset-0 backdrop-blur-md"></div>

          <div className="mb-8 relative z-10 px-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 px-4 py-8">
            {loading ? (
              <p className="text-center text-gray-500">Loading turfs...</p>
            ) : filteredTurfs.length > 0 ? (
              filteredTurfs.map((turf) => <TurfCard key={turf.id} turf={turf} />)
            ) : (
              <p className="text-center text-gray-500">No turfs found for this pincode.</p>
            )}
          </div>
        </div>
      </div>
      <BottomBar />
    </div>
  );
}
