import { useEffect, useMemo, useState } from "react";
import {
  RefreshCcw,
  PackageCheck,
  Eye,
  Truck,
  CreditCard,
  Copy,
  MessageCircle,
  Printer,
  X,
  Phone,
  Mail,
  MapPin,
  User,
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { BRAND } from "../../utils/constants";

const ORDER_STATUS_OPTIONS = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUS_OPTIONS = ["pending", "paid", "failed", "refunded"];

const statusStyle = {
  placed: "bg-blue-50 text-blue-700 border-blue-100",
  confirmed: "bg-amber-50 text-amber-700 border-amber-100",
  processing: "bg-purple-50 text-purple-700 border-purple-100",
  shipped: "bg-indigo-50 text-indigo-700 border-indigo-100",
  delivered: "bg-green-50 text-green-700 border-green-100",
  cancelled: "bg-red-50 text-red-700 border-red-100",
  pending: "bg-amber-50 text-amber-700 border-amber-100",
  paid: "bg-green-50 text-green-700 border-green-100",
  failed: "bg-red-50 text-red-700 border-red-100",
  refunded: "bg-stone-50 text-stone-700 border-stone-100",
};

const getStatusClass = (status) =>
  statusStyle[String(status || "").toLowerCase()] ||
  "bg-stone-50 text-stone-700 border-stone-100";

const getOrderNumber = (order) =>
  order?.orderNumber || order?._id || order?.id || "Order";

const getOrderItems = (order) => order?.items || order?.orderItems || [];

const getCustomerName = (order) =>
  order?.shippingAddress?.fullName ||
  order?.user?.name ||
  order?.customerName ||
  "Customer";

const getCustomerPhone = (order) =>
  order?.shippingAddress?.phone || order?.user?.phone || "";

const getCustomerEmail = (order) =>
  order?.shippingAddress?.email || order?.user?.email || "";

const getOrderTotal = (order) =>
  order?.totalAmount || order?.total || order?.grandTotal || 0;

const getOrderStatus = (order) =>
  String(order?.orderStatus || order?.status || "placed").toLowerCase();

const getPaymentStatus = (order) =>
  String(order?.paymentStatus || "pending").toLowerCase();

const getAddressText = (order) => {
  const address = order?.shippingAddress || {};

  return [
    address.addressLine1 || address.line1,
    address.addressLine2 || address.line2,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/admin/orders");

      setOrders(data.orders || data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(
      (order) => getOrderStatus(order) === "placed",
    ).length;
    const processing = orders.filter((order) =>
      ["confirmed", "processing", "shipped"].includes(getOrderStatus(order)),
    ).length;
    const delivered = orders.filter(
      (order) => getOrderStatus(order) === "delivered",
    ).length;

    const revenue = orders.reduce(
      (sum, order) => sum + Number(getOrderTotal(order) || 0),
      0,
    );

    return {
      total,
      pending,
      processing,
      delivered,
      revenue,
    };
  }, [orders]);

  const updateOrder = async (orderId, payload) => {
    try {
      setUpdatingOrderId(orderId);

      const { data } = await api.patch(
        `/admin/orders/${orderId}/status`,
        payload,
      );

      toast.success("Order updated successfully");

      const updatedOrder = data.order || data.updatedOrder || null;

      if (updatedOrder) {
        setOrders((prev) =>
          prev.map((order) => (order._id === orderId ? updatedOrder : order)),
        );

        setSelectedOrder((prev) =>
          prev && prev._id === orderId ? updatedOrder : prev,
        );
      } else {
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Order update failed");
    } finally {
      setUpdatingOrderId("");
    }
  };

  const handleStatusChange = (order, value) => {
    updateOrder(order._id, {
      orderStatus: value,
      status: value,
    });
  };

  const handlePaymentStatusChange = (order, value) => {
    updateOrder(order._id, {
      paymentStatus: value,
    });
  };

  const copyText = async (text, label = "Copied") => {
    if (!text) {
      toast.error("Nothing to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success(label);
    } catch {
      toast.error("Unable to copy");
    }
  };

  const getWhatsAppMessage = (order) => {
    const orderNumber = getOrderNumber(order);
    const customerName = getCustomerName(order);
    const total = formatCurrency(getOrderTotal(order));
    const status = getOrderStatus(order);
    const paymentStatus = getPaymentStatus(order);

    const commonFooter = `

Regards,
${BRAND.displayName}
${BRAND.phone}`;

    if (status === "placed") {
      return `Dear ${customerName},

Thank you for placing your order with ${BRAND.displayName}.

Order No: ${orderNumber}
Order Amount: ${total}
Payment Status: ${paymentStatus}

We have received your order and our team will contact you shortly for confirmation.${commonFooter}`;
    }

    if (status === "confirmed") {
      return `Dear ${customerName},

Your order has been confirmed successfully.

Order No: ${orderNumber}
Order Amount: ${total}

We will now process your order and keep you updated.${commonFooter}`;
    }

    if (status === "processing") {
      return `Dear ${customerName},

Your order is currently being processed.

Order No: ${orderNumber}

Our team is preparing your jewellery with proper care and packaging.${commonFooter}`;
    }

    if (status === "shipped") {
      return `Dear ${customerName},

Good news! Your order has been shipped.

Order No: ${orderNumber}

You will receive delivery updates shortly. Thank you for shopping with us.${commonFooter}`;
    }

    if (status === "delivered") {
      return `Dear ${customerName},

Your order has been delivered successfully.

Order No: ${orderNumber}

Thank you for choosing ${BRAND.displayName}. We hope you loved your jewellery.${commonFooter}`;
    }

    if (status === "cancelled") {
      return `Dear ${customerName},

Your order has been cancelled as per update.

Order No: ${orderNumber}

For any clarification, please contact us.${commonFooter}`;
    }

    return `Dear ${customerName},

Your order update from ${BRAND.displayName}:

Order No: ${orderNumber}
Current Status: ${status}
Order Amount: ${total}

For any assistance, please contact us.${commonFooter}`;
  };

  const openWhatsApp = (order) => {
    const phone = getCustomerPhone(order);

    if (!phone) {
      toast.error("Customer phone number not found");
      return;
    }

    const cleanPhone = String(phone).replace(/\D/g, "");
    const finalPhone = cleanPhone.startsWith("91")
      ? cleanPhone
      : `91${cleanPhone}`;

    const message = getWhatsAppMessage(order);

    window.open(
      `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
  };

  const printOrder = (order) => {
    const orderItems = getOrderItems(order);
    const orderNumber = getOrderNumber(order);
    const address = getAddressText(order);

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${orderNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 32px;
            color: #111;
          }
          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #111;
            padding-bottom: 18px;
            margin-bottom: 24px;
          }
          h1 {
            margin: 0;
            font-size: 28px;
          }
          .muted {
            color: #555;
            font-size: 13px;
          }
          .section {
            margin-top: 24px;
          }
          .box {
            border: 1px solid #ddd;
            padding: 16px;
            border-radius: 10px;
            margin-top: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
          }
          th, td {
            border-bottom: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-size: 14px;
          }
          th {
            background: #f5f5f5;
          }
          .total {
            text-align: right;
            font-size: 20px;
            font-weight: 700;
            margin-top: 20px;
          }
          @media print {
            button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print()">Print</button>

        <div class="header">
          <div>
            <h1>${BRAND.displayName}</h1>
            <p class="muted">${BRAND.address || ""}</p>
            <p class="muted">${BRAND.phone || ""} | ${BRAND.customerEmail || ""}</p>
          </div>
          <div>
            <h2>Order Slip</h2>
            <p><strong>Order:</strong> ${orderNumber}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString("en-IN")}</p>
          </div>
        </div>

        <div class="section">
          <h3>Customer Details</h3>
          <div class="box">
            <p><strong>Name:</strong> ${getCustomerName(order)}</p>
            <p><strong>Phone:</strong> ${getCustomerPhone(order)}</p>
            <p><strong>Email:</strong> ${getCustomerEmail(order)}</p>
            <p><strong>Address:</strong> ${address}</p>
          </div>
        </div>

        <div class="section">
          <h3>Order Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Size</th>
                <th>Material</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems
                .map((item) => {
                  const product = item.product || item;
                  const name = item.name || product.name || "Product";
                  const sku = item.sku || product.sku || "";
                  const quantity = Number(item.quantity || 1);
                  const price = Number(item.price || product.price || 0);

                  return `
                    <tr>
                      <td>${name}</td>
                      <td>${sku}</td>
                      <td>${quantity}</td>
                      <td>${item.selectedSize || ""}</td>
                      <td>${item.selectedMaterial || ""}</td>
                      <td>${formatCurrency(price * quantity)}</td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>

          <div class="total">
            Total: ${formatCurrency(getOrderTotal(order))}
          </div>
        </div>

        <div class="section">
          <h3>Status</h3>
          <div class="box">
            <p><strong>Order Status:</strong> ${getOrderStatus(order)}</p>
            <p><strong>Payment Status:</strong> ${getPaymentStatus(order)}</p>
            <p><strong>Payment Method:</strong> ${order.paymentMethod || "COD"}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=900,height=700");

    if (!printWindow) {
      toast.error("Please allow popups to print order");
      return;
    }

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="px-5 py-8 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
            Admin Orders
          </p>

          <h1 className="mt-3 font-serif text-5xl font-bold text-vjj-black">
            Manage Orders
          </h1>

          <p className="mt-3 max-w-2xl text-stone-600">
            View customer orders, update status, open WhatsApp, copy customer
            details and print order slips.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-vjj-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-vjj-bronze"
        >
          <RefreshCcw size={17} />
          Refresh
        </button>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Orders" value={stats.total} />
        <StatCard label="New Orders" value={stats.pending} />
        <StatCard label="In Progress" value={stats.processing} />
        <StatCard label="Delivered" value={stats.delivered} />
        <StatCard label="Revenue" value={formatCurrency(stats.revenue)} />
      </div>

      <div className="rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-vjj-ivory text-vjj-bronze">
            <PackageCheck />
          </div>

          <div>
            <h2 className="font-serif text-3xl font-bold text-vjj-black">
              Orders
            </h2>
            <p className="text-sm text-stone-600">
              Latest customer orders from the website.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-3xl bg-vjj-ivory"
              />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl bg-vjj-ivory p-8 text-center">
            <h3 className="font-serif text-2xl font-bold">No orders found</h3>
            <p className="mt-2 text-stone-600">
              New customer orders will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => {
              const orderStatus = getOrderStatus(order);
              const paymentStatus = getPaymentStatus(order);
              const items = getOrderItems(order);

              return (
                <div
                  key={order._id}
                  className="rounded-3xl border border-black/10 bg-vjj-ivory p-4"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-2xl font-bold text-vjj-black">
                          {getOrderNumber(order)}
                        </h3>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                            orderStatus,
                          )}`}
                        >
                          {orderStatus}
                        </span>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusClass(
                            paymentStatus,
                          )}`}
                        >
                          {paymentStatus}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-stone-600 md:grid-cols-2 xl:grid-cols-4">
                        <p>
                          <strong className="text-vjj-black">Customer:</strong>{" "}
                          {getCustomerName(order)}
                        </p>

                        <p>
                          <strong className="text-vjj-black">Phone:</strong>{" "}
                          {getCustomerPhone(order) || "N/A"}
                        </p>

                        <p>
                          <strong className="text-vjj-black">Items:</strong>{" "}
                          {items.length}
                        </p>

                        <p>
                          <strong className="text-vjj-black">Total:</strong>{" "}
                          {formatCurrency(getOrderTotal(order))}
                        </p>
                      </div>

                      <p className="mt-2 text-xs text-stone-500">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString("en-IN")
                          : ""}
                      </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 lg:w-[360px]">
                      <select
                        value={orderStatus}
                        disabled={updatingOrderId === order._id}
                        onChange={(event) =>
                          handleStatusChange(order, event.target.value)
                        }
                        className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold capitalize outline-none focus:border-vjj-gold"
                      >
                        {ORDER_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>

                      <select
                        value={paymentStatus}
                        disabled={updatingOrderId === order._id}
                        onChange={(event) =>
                          handlePaymentStatusChange(order, event.target.value)
                        }
                        className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold capitalize outline-none focus:border-vjj-gold"
                      >
                        {PAYMENT_STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <ActionButton
                      icon={<Eye size={16} />}
                      label="View"
                      onClick={() => setSelectedOrder(order)}
                    />

                    <ActionButton
                      icon={<Copy size={16} />}
                      label="Copy Phone"
                      onClick={() =>
                        copyText(getCustomerPhone(order), "Phone copied")
                      }
                    />

                    <ActionButton
                      icon={<MessageCircle size={16} />}
                      label="WhatsApp"
                      onClick={() => openWhatsApp(order)}
                    />

                    <ActionButton
                      icon={<Printer size={16} />}
                      label="Print"
                      onClick={() => printOrder(order)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onCopy={copyText}
          onWhatsApp={openWhatsApp}
          onPrint={printOrder}
          onStatusChange={handleStatusChange}
          onPaymentStatusChange={handlePaymentStatusChange}
          updating={updatingOrderId === selectedOrder._id}
        />
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-stone-400">
        {label}
      </p>
      <p className="mt-3 font-serif text-3xl font-bold text-vjj-black">
        {value}
      </p>
    </div>
  );
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-vjj-black transition hover:bg-vjj-black hover:text-white"
    >
      {icon}
      {label}
    </button>
  );
}

function OrderDetailsModal({
  order,
  onClose,
  onCopy,
  onWhatsApp,
  onPrint,
  onStatusChange,
  onPaymentStatusChange,
  updating,
}) {
  const orderItems = getOrderItems(order);
  const orderStatus = getOrderStatus(order);
  const paymentStatus = getPaymentStatus(order);

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 px-5 py-10 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-vjj-bronze">
              Order Details
            </p>
            <h2 className="mt-2 font-serif text-4xl font-bold text-vjj-black">
              {getOrderNumber(order)}
            </h2>

            <p className="mt-2 text-sm text-stone-500">
              {order.createdAt
                ? new Date(order.createdAt).toLocaleString("en-IN")
                : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-black/10 p-2 transition hover:bg-vjj-ivory"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[1.5rem] border border-black/10 bg-vjj-ivory p-5">
              <h3 className="font-serif text-2xl font-bold text-vjj-black">
                Order Items
              </h3>

              <div className="mt-4 space-y-3">
                {orderItems.map((item, index) => {
                  const product = item.product || item;
                  const image =
                    item.image ||
                    product.image ||
                    product.images?.find((img) => img.isPrimary)?.url ||
                    product.images?.[0]?.url ||
                    "";

                  const name = item.name || product.name || "Product";
                  const sku = item.sku || product.sku || "";
                  const price = Number(item.price || product.price || 0);
                  const quantity = Number(item.quantity || 1);

                  return (
                    <div
                      key={item._id || `${name}-${index}`}
                      className="flex gap-4 rounded-2xl border border-black/10 bg-white p-3"
                    >
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-vjj-ivory">
                        {image ? (
                          <img
                            src={image}
                            alt={name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center">
                            <PackageCheck className="text-vjj-bronze" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-vjj-black">{name}</p>

                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-stone-500">
                          {sku && <span>SKU: {sku}</span>}
                          <span>Qty: {quantity}</span>
                          {item.selectedSize && (
                            <span>Size: {item.selectedSize}</span>
                          )}
                          {item.selectedMaterial && (
                            <span>{item.selectedMaterial}</span>
                          )}
                        </div>

                        <p className="mt-3 font-bold text-vjj-black">
                          {formatCurrency(price * quantity)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-black/10 bg-white p-5">
              <h3 className="font-serif text-2xl font-bold text-vjj-black">
                Update Status
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm font-bold text-stone-600">
                    Order Status
                  </span>
                  <select
                    value={orderStatus}
                    disabled={updating}
                    onChange={(event) =>
                      onStatusChange(order, event.target.value)
                    }
                    className="w-full rounded-2xl border border-black/10 bg-vjj-ivory px-4 py-3 text-sm font-semibold capitalize outline-none focus:border-vjj-gold"
                  >
                    {ORDER_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-stone-600">
                    Payment Status
                  </span>
                  <select
                    value={paymentStatus}
                    disabled={updating}
                    onChange={(event) =>
                      onPaymentStatusChange(order, event.target.value)
                    }
                    className="w-full rounded-2xl border border-black/10 bg-vjj-ivory px-4 py-3 text-sm font-semibold capitalize outline-none focus:border-vjj-gold"
                  >
                    {PAYMENT_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[1.5rem] border border-black/10 bg-white p-5">
              <h3 className="font-serif text-2xl font-bold text-vjj-black">
                Customer
              </h3>

              <div className="mt-4 space-y-3 text-sm">
                <InfoRow
                  icon={<User size={17} />}
                  label={getCustomerName(order)}
                />
                <InfoRow
                  icon={<Phone size={17} />}
                  label={getCustomerPhone(order) || "N/A"}
                />
                <InfoRow
                  icon={<Mail size={17} />}
                  label={getCustomerEmail(order) || "N/A"}
                />
                <InfoRow
                  icon={<MapPin size={17} />}
                  label={getAddressText(order) || "N/A"}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <ActionButton
                  icon={<Copy size={16} />}
                  label="Copy Phone"
                  onClick={() =>
                    onCopy(getCustomerPhone(order), "Phone copied")
                  }
                />

                <ActionButton
                  icon={<MessageCircle size={16} />}
                  label="WhatsApp"
                  onClick={() => onWhatsApp(order)}
                />
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-black/10 bg-vjj-black p-5 text-white">
              <h3 className="font-serif text-2xl font-bold">Payment Summary</h3>

              <div className="mt-5 space-y-3 text-sm">
                <SummaryRow
                  label="Order Total"
                  value={formatCurrency(getOrderTotal(order))}
                />
                <SummaryRow
                  label="Payment Method"
                  value={order.paymentMethod || "COD"}
                />
                <SummaryRow label="Payment Status" value={paymentStatus} />
                <SummaryRow label="Order Status" value={orderStatus} />
              </div>

              <button
                type="button"
                onClick={() => onPrint(order)}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-vjj-champagne px-5 py-3 text-sm font-bold text-vjj-black transition hover:bg-vjj-gold"
              >
                <Printer size={17} />
                Print Order Slip
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-vjj-ivory p-3">
      <span className="shrink-0 text-vjj-bronze">{icon}</span>
      <span className="break-words text-stone-700">{label}</span>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <span className="text-stone-300">{label}</span>
      <strong className="capitalize text-vjj-champagne">{value}</strong>
    </div>
  );
}
