import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomBar from '../components/BottomBar';
import AppBarComponent from '../components/AppBar';

interface Category {
  id: string;
  name: string;
  image: string;
}

interface Amenity {
  id: string;
  name: string;
  icon: string;
}

const categories: Category[] = [
  {
    id: 'football',
    name: 'Football',
    image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1000',
  },
  {
    id: 'cricket',
    name: 'Cricket',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1000',
  },
  {
    id: 'basketball',
    name: 'Basketball',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000',
  },
  {
    id: 'tennis',
    name: 'Tennis',
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=1000',
  },
  {
    id: 'badminton',
    name: 'Badminton',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1000',
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?q=80&w=1000',
  },
];

const amenities: Amenity[] = [
  {
    id: 'floodlights',
    name: 'Floodlights',
    icon: '💡',
  },
  {
    id: 'changing-rooms',
    name: 'Changing Rooms',
    icon: '🚪',
  },
  {
    id: 'parking',
    name: 'Parking',
    icon: '🅿️',
  },
  {
    id: 'cafeteria',
    name: 'Cafeteria',
    icon: '☕',
  },
  {
    id: 'coaching',
    name: 'Coaching',
    icon: '👨‍🏫',
  },
  {
    id: 'equipment',
    name: 'Equipment Rental',
    icon: '⚽',
  },
];

const CategoriesScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleCategoryPress = (_category: string) => {
    navigate('/');
  };

  const handleAmenityPress = (_amenity: string) => {
    navigate('/');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <AppBarComponent appbartitle='Categories'/>
      <div className="max-w-3xl mx-auto px-4">
        
        <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative h-32 rounded-xl overflow-hidden cursor-pointer"
              onClick={() => handleCategoryPress(category.name)}
            >
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30" />
              <span className="absolute bottom-3 left-3 text-white font-semibold text-base">
                {category.name}
              </span>
            </div>
          ))}
        </div>
        
        <h2 className="text-lg font-semibold text-gray-800 mt-4 mb-3">Amenities</h2>
        <div className="grid grid-cols-3 gap-3 mb-6 md:grid-cols-6">
          {amenities.map((amenity) => (
            <div
              key={amenity.id}
              className="bg-white rounded-xl h-24 flex flex-col items-center justify-center p-2 shadow-sm cursor-pointer"
              onClick={() => handleAmenityPress(amenity.name)}
            >
              <span className="text-2xl mb-2">{amenity.icon}</span>
              <span className="text-xs text-gray-800 text-center">{amenity.name}</span>
            </div>
          ))}
        </div>
        
        <h2 className="text-lg font-semibold text-gray-800 mt-4 mb-3">Price Range</h2>
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div 
            className="bg-white rounded-xl p-3 shadow-sm cursor-pointer"
            onClick={() => navigate('/')}
          >
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Budget</h3>
            <p className="text-xs text-gray-600">₹500 - ₹1000</p>
          </div>
          
          <div 
            className="bg-white rounded-xl p-3 shadow-sm cursor-pointer"
            onClick={() => navigate('/')}
          >
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Standard</h3>
            <p className="text-xs text-gray-600">₹1000 - ₹1500</p>
          </div>
          
          <div 
            className="bg-white rounded-xl p-3 shadow-sm cursor-pointer"
            onClick={() => navigate('/')}
          >
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Premium</h3>
            <p className="text-xs text-gray-600">₹1500+</p>
          </div>
        </div>
      </div>
      <BottomBar/>
    </div>
  );
};

export default CategoriesScreen;