import { useState, useEffect } from 'react';
import TurfCard from '../components/TurfCard';
import SearchBar from '../components/SearchBar';
import PincodePage from './PincodePage';
import { turfs } from '../data/turfs';
import { MapPin } from 'lucide-react';
import BottomBar from '../components/BottomBar';

export default function Home() {
  const [needsPincode, setNeedsPincode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTurfs, setFilteredTurfs] = useState(turfs);
  const [pincode, setPincode] = useState(localStorage.getItem('pincode') || '');

  useEffect(() => {
    const storedPincode = localStorage.getItem('pincode');
    if (!storedPincode) {
      setNeedsPincode(true);
    } else {
      setPincode(storedPincode);
    }
  }, []);

  useEffect(() => {
    const filtered = turfs.filter(turf => 
      searchQuery
        ? (turf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           turf.address.toLowerCase().includes(searchQuery.toLowerCase()))
        : turf.address.toLowerCase().includes(pincode.toLowerCase())
    );
    setFilteredTurfs(filtered);
  }, [searchQuery, pincode]);
  

  const handlePincodeSubmit = (pincode: string) => {
    localStorage.setItem('pincode', pincode);
    setPincode(pincode);
    setNeedsPincode(false);
  };

  const handleChangePincode = () => {
    setNeedsPincode(true);
  };

  if (needsPincode) {
    return <PincodePage onSubmit={handlePincodeSubmit} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      <div className="max-w-7xl mx-auto">
        <div className='max-w-3xl mx-auto h-36 rounded-b-sm home-page-content '
          style={{
            backgroundImage: 'url(https://img.freepik.com/free-photo/abstract-gradient-neon-lights_23-2149279092.jpg?ga=GA1.1.1761220439.1741347886&semt=ais_hybrid&w=740)',
            backgroundSize: 'cover',
            transition: 'transform 0.5s ease-in-out',
            transitionTimingFunction: 'ease-in-out',
            position: 'relative',
            borderRadius: '0 0 20px 20px',
          }}>
          <h1 className='text-[56px] px-4 flex justify-between text-white font-mono relative z-10'>
            Turfer 
            <span className='text-sm text-white flex items-end ml-2 mb-6'>
              <MapPin/>
              
              <button onClick={handleChangePincode} className="ml-2 underline">
              {pincode} 
              </button>
            </span>
          </h1>
          
          <div className="absolute inset-0 backdrop-blur-md"></div>

          <div className="mb-8 relative z-10  px-4 ">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 px-4 py-8 ">
            {filteredTurfs.map(turf => (
              <TurfCard key={turf.id} turf={turf} />
            ))}
          </div>
        </div>

      </div>
      <BottomBar />
    </div>
  );
}