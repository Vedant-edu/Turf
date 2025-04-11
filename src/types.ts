export interface Turf {
  turf_id_new: any;
  pincode: string;
  email: string;
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