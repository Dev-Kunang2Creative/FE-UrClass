// Types matching BE Package model
export interface PackageBE {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  price: number;
  discount_price: number | null;
  ticket_amount: number;
  currency: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Types matching BE Order model
export interface OrderItemBE {
  id: string;
  order_id: string;
  package_id: string;
  package_name_snapshot: string;
  price: number;
  qty: number;
  subtotal: number;
  package?: PackageBE;
}

export interface OrderBE {
  id: string;
  order_code: string;
  user_id: string;
  grand_total: number;
  currency: string;
  status:
    | "pending"
    | "paid"
    | "cancelled"
    | "rejected"
    | "waiting_approval"
    | "expired";
  payment_method: string;
  payment_reference: string | null;
  midtrans_transaction_id: string | null;
  paid_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  items: OrderItemBE[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateOrderResponse {
  message: string;
  data: OrderBE;
  snap_token: string;
}
