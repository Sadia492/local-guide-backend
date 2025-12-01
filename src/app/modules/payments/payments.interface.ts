import { Types } from "mongoose";

export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  FAILED = "FAILED",
}
export interface IPayment {
  booking: Types.ObjectId;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentIntentId: string;
  createdAt?: Date;
}
