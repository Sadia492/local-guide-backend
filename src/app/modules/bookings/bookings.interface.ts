import { Types } from "mongoose";

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}
// export type BookingStatus = "PENDING" | "confirmed" | "cancelled";

export interface IBooking {
  _id?: string;
  listing: Types.ObjectId; // Listing ID
  user: Types.ObjectId; // User ID
  date: Date;
  groupSize: number;
  totalPrice: number;
  status: BookingStatus;
}
