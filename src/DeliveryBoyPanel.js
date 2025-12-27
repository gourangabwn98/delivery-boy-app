import React, { useState, useEffect, useCallback } from "react";
import {
  Truck,
  Phone,
  MapPin,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

const API_BASE_URL = "https://zombo.onrender.com";
const RINGTONE_URL = "/notification.mp3"; // Place notification.mp3 in public folder

const DeliveryBoyPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previousCount, setPreviousCount] = useState(0);

  const playRingtone = () => {
    const audio = new Audio(RINGTONE_URL);
    audio.volume = 1;
    audio.play().catch(() => {});
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders`);
      const data = await res.json();

      if (data.success && Array.isArray(data.orders)) {
        const pendingOrders = data.orders
          .filter((o) => o.status !== "Delivered" && o.status !== "Cancelled")
          .reverse();

        setOrders(pendingOrders);

        if (pendingOrders.length > previousCount && previousCount > 0) {
          playRingtone();
        }
        setPreviousCount(pendingOrders.length);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [previousCount]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#111827",
          color: "white",
        }}
      >
        <RefreshCw
          size={64}
          style={{ animation: "spin 2s linear infinite", color: "#fbbf24" }}
        />
        <h1 style={{ fontSize: "28px", marginTop: "24px", fontWeight: "bold" }}>
          Loading Orders...
        </h1>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #0f172a, #1e293b)",
        color: "white",
        paddingBottom: "40px",
      }}
    >
      {/* Fixed Header */}
      <header
        style={{
          background: "#000",
          padding: "20px",
          textAlign: "center",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <Truck size={40} style={{ color: "#fbbf24" }} />
          <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
            Delivery Boy Panel
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ marginTop: "100px", padding: "0 16px" }}>
        {orders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <ShoppingBag
              size={100}
              style={{ opacity: 0.3, marginBottom: "24px" }}
            />
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              No Pending Orders
            </h2>
            <p style={{ fontSize: "20px", color: "#94a3b8" }}>
              New orders will appear automatically 🚀
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {orders.map((order, index) => {
              const addressLines = (order.address || "").split("\n");
              const isNew = index === 0;

              return (
                <div
                  key={order._id}
                  style={{
                    position: "relative",
                    background: "white",
                    color: "#000",
                    borderRadius: "24px",
                    padding: "24px",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    border: isNew ? "4px solid #fbbf24" : "none",
                    animation: isNew ? "pulse 2s infinite" : "none",
                  }}
                >
                  {/* New Order Badge */}
                  {isNew && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-16px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#dc2626",
                        color: "white",
                        padding: "8px 24px",
                        borderRadius: "50px",
                        fontWeight: "bold",
                        fontSize: "18px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                      }}
                    >
                      NEW ORDER!
                    </div>
                  )}

                  {/* Customer Info */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          margin: "0 0 8px 0",
                        }}
                      >
                        {order.user?.name || "Customer"}
                      </h3>
                      <a
                        href={`tel:${order.user?.phone}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          color: "#2563eb",
                          fontSize: "20px",
                          fontWeight: "600",
                          textDecoration: "none",
                        }}
                      >
                        <Phone size={24} />
                        {order.user?.phone || "No phone"}
                      </a>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "36px",
                          fontWeight: "bold",
                          color: "#059669",
                        }}
                      >
                        ₹{order.totalAmount}
                      </div>
                      <div style={{ color: "#6b7280", fontSize: "14px" }}>
                        {new Date(order.createdAt).toLocaleTimeString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div
                    style={{
                      background: "#f3f4f6",
                      borderRadius: "16px",
                      padding: "16px",
                      marginBottom: "24px",
                    }}
                  >
                    <h4
                      style={{
                        fontWeight: "bold",
                        fontSize: "18px",
                        margin: "0 0 12px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <ShoppingBag size={20} />
                      Order Items
                    </h4>
                    {(order.items || []).map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          borderBottom:
                            i < order.items.length - 1
                              ? "1px solid #e5e7eb"
                              : "none",
                        }}
                      >
                        <span style={{ fontWeight: "500" }}>{item.name}</span>
                        <span style={{ color: "#4b5563", fontWeight: "bold" }}>
                          × {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  <div style={{ marginBottom: "32px" }}>
                    <h4
                      style={{
                        fontWeight: "bold",
                        fontSize: "18px",
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <MapPin size={24} style={{ color: "#dc2626" }} />
                      Delivery Address
                    </h4>
                    <div
                      style={{
                        background: "#f3f4f6",
                        padding: "16px",
                        borderRadius: "16px",
                        color: "#374151",
                        lineHeight: "1.6",
                      }}
                    >
                      {addressLines.map((line, i) => (
                        <div key={i}>{line || "—"}</div>
                      ))}
                    </div>
                  </div>

                  {/* Map Button */}
                  {order.lat && order.lng ? (
                    <a
                      href={`https://www.google.com/maps?q=${order.lat},${order.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        width: "100%",
                        background: "#2563eb",
                        color: "white",
                        fontSize: "22px",
                        fontWeight: "bold",
                        padding: "20px",
                        borderRadius: "20px",
                        textAlign: "center",
                        textDecoration: "none",
                        boxShadow: "0 8px 20px rgba(37,99,235,0.4)",
                        transition: "all 0.3s",

                        alignItems: "center",
                        justifyContent: "center",
                        gap: "16px",
                      }}
                      onMouseOver={(e) =>
                        (e.target.style.background = "#1d4ed8")
                      }
                      onMouseOut={(e) =>
                        (e.target.style.background = "#2563eb")
                      }
                    >
                      <ExternalLink size={32} />
                      OPEN IN GOOGLE MAPS
                    </a>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        background: "#fee2e2",
                        color: "#991b1b",
                        fontWeight: "bold",
                        padding: "16px",
                        borderRadius: "16px",
                      }}
                    >
                      ⚠️ No GPS location available
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default DeliveryBoyPanel;
