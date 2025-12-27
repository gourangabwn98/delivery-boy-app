import React, { useState, useEffect, useCallback } from "react";
import {
  Truck,
  Phone,
  MapPin,
  ShoppingBag,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  History,
  X,
} from "lucide-react";

const API_BASE_URL = "https://zombo.onrender.com";
const RINGTONE_URL = "/notification.mp3";

const DeliveryBoyPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previousCount, setPreviousCount] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [confirmOrderId, setConfirmOrderId] = useState(null);

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
        // Filter ONLY "Accepted" status orders
        const acceptedOrders = data.orders
          .filter((o) => o.status === "Accepted")
          .reverse(); // newest first

        setOrders(acceptedOrders);

        if (acceptedOrders.length > previousCount && previousCount > 0) {
          playRingtone();
        }
        setPreviousCount(acceptedOrders.length);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [previousCount]);

  // Fetch delivery history
  const fetchDeliveryHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/orders`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        // Filter only delivered orders
        const delivered = data.orders
          .filter((o) => o.status === "Delivered")
          .reverse(); // newest first
        setDeliveryHistory(delivered);
      }
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Mark as Delivered
  const markAsDelivered = async (orderId) => {
    setUpdatingId(orderId);
    setConfirmOrderId(null);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Delivered" }),
        }
      );
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setUpdatingId(null);
    }
  };

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
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        <RefreshCw size={32} style={{ animation: "spin 1s linear infinite" }} />
        Loading Orders...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        paddingBottom: "40px",
      }}
    >
      {/* Fixed Header */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(12px)",
          borderBottom: "3px solid #667eea",
          padding: "20px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Truck size={32} color="#667eea" />
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1f2937",
              }}
            >
              Delivery Panel
            </h1>
          </div>
          <button
            onClick={() => {
              setShowHistory(true);
              fetchDeliveryHistory();
            }}
            style={{
              background: "#667eea",
              color: "white",
              border: "none",
              padding: "12px 24px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
            }}
          >
            <History size={20} />
            History
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
        {orders.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "24px",
              padding: "60px 20px",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <Truck
              size={64}
              color="#d1d5db"
              style={{ margin: "0 auto 20px" }}
            />
            <h2
              style={{ color: "#6b7280", fontSize: "24px", margin: "0 0 8px" }}
            >
              No Active Orders
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "18px", margin: 0 }}>
              Waiting for new orders... 🚀
            </p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "20px" }}
          >
            {orders.map((order, index) => {
              const addressLines = (order.address || "").split("\n");
              const isNew = index === 0;

              return (
                <div
                  key={order._id}
                  style={{
                    background: "white",
                    borderRadius: "24px",
                    padding: "24px",
                    boxShadow: isNew
                      ? "0 12px 40px rgba(102,126,234,0.4)"
                      : "0 8px 32px rgba(0,0,0,0.12)",
                    border: isNew ? "3px solid #667eea" : "none",
                    position: "relative",
                    animation: isNew ? "pulse 2s ease-in-out infinite" : "none",
                  }}
                >
                  {/* New Badge */}
                  {isNew && (
                    <div
                      style={{
                        position: "absolute",
                        top: "-12px",
                        right: "20px",
                        background: "#ef4444",
                        color: "white",
                        padding: "8px 20px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "bold",
                        boxShadow: "0 4px 12px rgba(239,68,68,0.4)",
                      }}
                    >
                      NEW ORDER!
                    </div>
                  )}

                  {/* Status Badge */}
                  <div
                    style={{
                      display: "inline-block",
                      background: "#10b981",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "12px",
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "16px",
                    }}
                  >
                    {order.status || "Accepted"}
                  </div>

                  {/* Customer + Amount */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "20px",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "22px",
                          fontWeight: "bold",
                          color: "#1f2937",
                          marginBottom: "4px",
                        }}
                      >
                        {order.user?.name || "Customer"}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          color: "#6b7280",
                        }}
                      >
                        <Phone size={16} />
                        {order.user?.phone || "No phone"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "bold",
                          color: "#667eea",
                        }}
                      >
                        ₹{order.totalAmount}
                      </div>
                      <div style={{ fontSize: "14px", color: "#9ca3af" }}>
                        {new Date(order.createdAt).toLocaleTimeString("en-IN")}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div
                    style={{
                      background: "#f9fafb",
                      borderRadius: "16px",
                      padding: "16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "12px",
                        color: "#374151",
                        fontWeight: "600",
                      }}
                    >
                      <ShoppingBag size={20} />
                      Items
                    </div>
                    {(order.items || []).map((item, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "8px 0",
                          borderBottom:
                            i < order.items.length - 1
                              ? "1px solid #e5e7eb"
                              : "none",
                          fontSize: "16px",
                          color: "#1f2937",
                        }}
                      >
                        <strong>{item.name}</strong> × {item.quantity}
                      </div>
                    ))}
                  </div>

                  {/* Clickable Address */}
                  {order.lat && order.lng ? (
                    <a
                      href={`https://www.google.com/maps?q=${order.lat},${order.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        background: "#fef3c7",
                        borderRadius: "16px",
                        padding: "16px",
                        marginBottom: "20px",
                        textDecoration: "none",
                        color: "#92400e",
                        border: "2px solid #fbbf24",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "8px",
                          fontWeight: "600",
                        }}
                      >
                        <MapPin size={20} />
                        Delivery Address
                      </div>
                      {addressLines.map((line, i) => (
                        <div
                          key={i}
                          style={{ fontSize: "15px", lineHeight: 1.6 }}
                        >
                          {line || "—"}
                        </div>
                      ))}
                    </a>
                  ) : (
                    <div
                      style={{
                        background: "#fee",
                        borderRadius: "16px",
                        padding: "16px",
                        marginBottom: "20px",
                        color: "#991b1b",
                        textAlign: "center",
                      }}
                    >
                      ⚠️ No location available
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: "12px" }}>
                    {/* Big Map Button */}
                    {order.lat && order.lng && (
                      <a
                        href={`https://www.google.com/maps?q=${order.lat},${order.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1,
                          background: "#3b82f6",
                          color: "white",
                          fontSize: "24px",
                          fontWeight: "bold",
                          padding: "22px",
                          borderRadius: "24px",
                          border: "none",
                          textDecoration: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "12px",
                          boxShadow: "0 10px 30px rgba(59,130,246,0.4)",
                        }}
                      >
                        <ExternalLink size={28} />
                        OPEN MAP
                      </a>
                    )}

                    {/* Mark Delivered Button */}
                    {confirmOrderId === order._id ? (
                      <button
                        onClick={() => markAsDelivered(order._id)}
                        disabled={updatingId === order._id}
                        style={{
                          flex: 1,
                          background: "#ef4444",
                          color: "white",
                          fontSize: "20px",
                          fontWeight: "bold",
                          padding: "22px",
                          borderRadius: "24px",
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "0 10px 30px rgba(239,68,68,0.4)",
                          opacity: updatingId === order._id ? 0.7 : 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "12px",
                        }}
                      >
                        <CheckCircle size={28} />
                        CONFIRM DELIVERY
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmOrderId(order._id)}
                        style={{
                          flex: 1,
                          background: "#10b981",
                          color: "white",
                          fontSize: "24px",
                          fontWeight: "bold",
                          padding: "22px",
                          borderRadius: "24px",
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "0 10px 30px rgba(16,185,129,0.4)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "12px",
                        }}
                      >
                        <CheckCircle size={28} />
                        MARK DELIVERED
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistory && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setShowHistory(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "24px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                position: "sticky",
                top: 0,
                background: "white",
                borderBottom: "2px solid #e5e7eb",
                padding: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: "24px 24px 0 0",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                Delivery History
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                }}
              >
                <X size={28} color="#6b7280" />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "20px" }}>
              {historyLoading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#6b7280",
                  }}
                >
                  Loading history...
                </div>
              ) : deliveryHistory.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#9ca3af",
                  }}
                >
                  No delivery history yet
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {deliveryHistory.map((order) => (
                    <div
                      key={order._id}
                      style={{
                        background: "#f9fafb",
                        borderRadius: "16px",
                        padding: "16px",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "12px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              color: "#1f2937",
                            }}
                          >
                            {order.user?.name || "Customer"}
                          </div>
                          <div style={{ fontSize: "14px", color: "#6b7280" }}>
                            {order.user?.phone || "No phone"}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div
                            style={{
                              fontSize: "20px",
                              fontWeight: "bold",
                              color: "#10b981",
                            }}
                          >
                            ₹{order.totalAmount}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginTop: "4px",
                            }}
                          >
                            {new Date(order.updatedAt).toLocaleString("en-IN")}
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div
                        style={{
                          background: "white",
                          borderRadius: "12px",
                          padding: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        {(order.items || []).map((item, i) => (
                          <div
                            key={i}
                            style={{
                              padding: "6px 0",
                              borderBottom:
                                i < order.items.length - 1
                                  ? "1px solid #e5e7eb"
                                  : "none",
                              fontSize: "14px",
                              color: "#374151",
                            }}
                          >
                            {item.name} × {item.quantity}
                          </div>
                        ))}
                      </div>

                      {/* Status Badge */}
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: "#d1fae5",
                          color: "#065f46",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        <CheckCircle size={16} />
                        {order.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
        `}
      </style>
    </div>
  );
};

export default DeliveryBoyPanel;
