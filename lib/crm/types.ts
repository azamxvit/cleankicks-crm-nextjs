export type OrderStatus = "received" | "in_progress" | "ready" | "completed";

export type ShoeLine = {
  id: string;
  brand: string;
  model: string;
  color: string;
  notes: string;
  photoUrls: string[];
};

export type Order = {
  id: string;
  ticketCode: string;
  clientName: string;
  clientPhone: string;
  status: OrderStatus;
  items: ShoeLine[];
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  clientName: string;
  clientPhone: string;
  items: Omit<ShoeLine, "id">[];
};
