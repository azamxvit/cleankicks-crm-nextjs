"use client";

import * as React from "react";

import {
  loadOrdersFromStorage,
  ordersReducer,
  saveOrdersToStorage,
  type OrdersAction,
} from "@/lib/crm/orders-reducer";
import { normalizePhone } from "@/lib/crm/phone";
import type { Order } from "@/lib/crm/types";

type OrdersContextValue = {
  hydrated: boolean;
  orders: Order[];
  dispatch: React.Dispatch<OrdersAction>;
  getOrder: (id: string) => Order | undefined;
  findOrdersByPhoneQuery: (query: string) => Order[];
};

const OrdersContext = React.createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(ordersReducer, { orders: [] });
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    const loaded = loadOrdersFromStorage();
    if (loaded?.length) {
      dispatch({ type: "HYDRATE", orders: loaded });
    }
    const t = window.setTimeout(() => {
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  React.useEffect(() => {
    if (!hydrated) {
      return;
    }
    saveOrdersToStorage(state.orders);
  }, [state.orders, hydrated]);

  const getOrder = React.useCallback(
    (id: string) => state.orders.find((o) => o.id === id),
    [state.orders]
  );

  const findOrdersByPhoneQuery = React.useCallback(
    (query: string) => {
      const q = normalizePhone(query);
      if (!q) {
        return [];
      }
      return state.orders.filter((o) => o.clientPhone.includes(q));
    },
    [state.orders]
  );

  const value = React.useMemo(
    () => ({
      hydrated,
      orders: state.orders,
      dispatch,
      getOrder,
      findOrdersByPhoneQuery,
    }),
    [hydrated, state.orders, dispatch, getOrder, findOrdersByPhoneQuery]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const ctx = React.useContext(OrdersContext);
  if (!ctx) {
    throw new Error("useOrders must be used within OrdersProvider");
  }
  return ctx;
}
