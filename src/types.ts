export interface Turf {
  id: string;
  name: string;
  address: string;
  images: string[];
  pricePerHour: number;
  amenities: string[];
  rating: number;
  availableTimeSlots: string[];
}

export interface BookingDetails {
  turfId: string;
  date: Date;
  timeSlot: string;
}