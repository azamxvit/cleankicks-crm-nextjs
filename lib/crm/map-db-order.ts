import { normalizePhone } from "@/lib/crm/phone";
import type { Order, OrderStatus, ShoeLine } from "@/lib/crm/types";

type DbClient = { id: string; name: string; phone: string };

type DbOrderItemRow = {
  id: string;
  brand: string;
  model: string;
  color: string;
  notes: string;
  photo_urls: string[] | null;
  created_at?: string;
};

export type DbOrderRow = {
  id: string;
  status: string;
  ticket_code: string;
  created_at: string;
  updated_at: string;
  clients: DbClient | DbClient[] | null;
  order_items: DbOrderItemRow[] | null;
};

function firstClient(row: DbOrderRow): DbClient | null {
  const c = row.clients;
  if (!c) {
    return null;
  }
  return Array.isArray(c) ? (c[0] ?? null) : c;
}

export function mapDbOrderToOrder(row: DbOrderRow): Order {
  const client = firstClient(row);
  const itemsRaw = row.order_items ?? [];
  const items: ShoeLine[] = [...itemsRaw]
    .sort((a, b) => String(a.created_at ?? "").localeCompare(String(b.created_at ?? "")))
    .map((i) => ({
      id: i.id,
      brand: i.brand ?? "",
      model: i.model ?? "",
      color: i.color ?? "",
      notes: i.notes ?? "",
      photoUrls: Array.isArray(i.photo_urls) ? i.photo_urls : [],
    }));

  return {
    id: row.id,
    ticketCode: row.ticket_code,
    clientName: client?.name ?? "",
    clientPhone: normalizePhone(client?.phone ?? ""),
    status: row.status as OrderStatus,
    items,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
