"use client";

import { useEffect, useState } from "react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Order {
  id: string;
  created_at: string;
  package_name: string;
  package_price: string;
  recipient_name: string;
  delivery_address: string;
  card_message: string;
  sender_name: string;
  phone_number: string;
  status?: string;
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === "ALL") return true;
    return o.status === filter;
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">Tech Talk Technologies</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">Admin Dashboard — Orders</h1>
          </div>
          <button
            onClick={fetchOrders}
            className="bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
          >
            🔄 Refresh Orders
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {["ALL", "PENDING", "DISPATCHED", "DELIVERED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === status 
                  ? "bg-amber-500 text-slate-950" 
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Content Table / Cards */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Loading incoming orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
            No orders found matching this filter.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20">
                      {order.package_name} ({order.package_price})
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 text-sm pt-2">
                    <div>
                      <strong className="text-slate-400 block text-xs">Recipient:</strong>
                      <span className="text-slate-200 font-semibold">{order.recipient_name}</span>
                    </div>
                    <div>
                      <strong className="text-slate-400 block text-xs">Delivery Address:</strong>
                      <span className="text-slate-200">{order.delivery_address}</span>
                    </div>
                    <div>
                      <strong className="text-slate-400 block text-xs">Sender & Phone:</strong>
                      <span className="text-slate-200">{order.sender_name} ({order.phone_number})</span>
                    </div>
                    <div>
                      <strong className="text-slate-400 block text-xs">Card Message:</strong>
                      <p className="text-slate-300 italic bg-slate-950 p-2 rounded-lg border border-slate-800/80 text-xs mt-0.5">
                        "{order.card_message}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions / Status changer */}
                <div className="flex flex-col gap-2 w-full md:w-auto min-w-[160px]">
                  <span className="text-xs text-slate-400 font-medium text-center md:text-right">
                    Status: <strong className="text-amber-400">{order.status || "PENDING"}</strong>
                  </span>
                  <select
                    value={order.status || "PENDING"}
                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium rounded-xl p-2.5 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}