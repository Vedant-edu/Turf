import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Turf } from '../types';

interface TurfCardProps {
  turf: Turf;
}

export default function TurfCard({ turf }: TurfCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % turf.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + turf.images.length) % turf.images.length);
  };

  return (
    <Link to={`/turf/${turf.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <img
            src={turf.images[currentImageIndex]}
            alt={turf.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-1 rounded-full text-white hover:bg-opacity-75"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-1 rounded-full text-white hover:bg-opacity-75"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-2 right-2 bg-white px-2 py-1 rounded-full flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{turf.rating}</span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">{turf.name}</h3>
          <p className="text-gray-600 text-sm mb-2">{turf.address}</p>
          <p className="text-green-600 font-medium">₹{turf.pricePerHour}/hour</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {turf.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="text-xs bg-gray-100 px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}