import { User } from "../user/user";

export interface Transaction {
  id: string;
  order_code: string;
  user_id: string;
  grand_total: number;
  currency: string;
  status:
    | "pending"
    | "paid"
    | "failed"
    | "cancelled"
    | "expired"
    | "rejected"
    | "waiting_aproval";
  payment_method: string;
  payment_reference: string;
  midtrans_transaction_id: string;
  midtrans_order_id: string;
  paid_at: Date | null;
  approved_at: Date | null;
  approved_by: User | null;
  admin_note: string | null;
  user: User;
  created_at: Date;
  updated_at: Date;
}
