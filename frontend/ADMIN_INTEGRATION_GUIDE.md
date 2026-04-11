# Frontend Integration Guide

## Overview

Hướng dẫn tích hợp Store Management API vào frontend React (Next.js).

## Setup

### 1. Create API Client

File: `src/lib/storeApi.js`

```javascript
import { apiClient } from "./apiClient";

export const storeApi = {
  // Dashboard
  getDashboard: () => apiClient.get("/store/dashboard"),

  getRevenueAnalytics: (period = "daily") =>
    apiClient.get(`/store/analytics/revenue?period=${period}`),

  // Inventory
  getInventory: (page = 1, limit = 20, search = "") =>
    apiClient.get(
      `/store/inventory?page=${page}&limit=${limit}&search=${search}`,
    ),

  updateStock: (bentheid, tonkho, note = "") =>
    apiClient.put(`/store/inventory/${bentheid}`, {
      tonkho,
      note,
    }),

  getLowStockAlerts: (threshold = 10) =>
    apiClient.get(`/store/inventory/alerts/low-stock?threshold=${threshold}`),

  // Shipping
  getPendingShipments: () => apiClient.get("/store/shipping/pending"),

  updateShipmentStatus: (
    donhangid,
    status,
    trackingNumber = "",
    carrier = "",
  ) =>
    apiClient.patch(`/store/shipping/${donhangid}`, {
      status,
      trackingNumber,
      carrier,
    }),

  // Customers
  getCustomers: (page = 1, limit = 20, search = "") =>
    apiClient.get(
      `/store/customers?page=${page}&limit=${limit}&search=${search}`,
    ),

  getCustomerDetail: (userid) => apiClient.get(`/store/customers/${userid}`),

  // Settings
  getStoreSettings: () => apiClient.get("/store/settings"),

  updateStoreSettings: (settings) =>
    apiClient.patch("/store/settings", settings),

  // Reports
  getRevenueReport: (startDate, endDate) =>
    apiClient.get(
      `/store/reports/revenue?startDate=${startDate}&endDate=${endDate}`,
    ),

  getProfitReport: () => apiClient.get("/store/reports/profit"),

  // Audit
  getAuditLogs: (page = 1, limit = 50, action = "", actor = "") =>
    apiClient.get(
      `/store/audit-logs?page=${page}&limit=${limit}&action=${action}&actor=${actor}`,
    ),
};
```

### 2. Create Custom Hooks

#### `src/hooks/useStore.js`

```javascript
import { useState, useEffect, useCallback } from "react";
import { storeApi } from "../lib/storeApi";
import { useAuth } from "./useAuth"; // Assuming you have this

export function useStoreDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.isAdmin) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await storeApi.getDashboard();
        setStats(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  return { stats, loading, error };
}

export function useStoreInventory(page = 1, search = "") {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await storeApi.getInventory(page, 20, search);
        setInventory(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setInventory(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, search]);

  return { inventory, loading, error };
}

export function useStoreCustomers(page = 1, search = "") {
  const [customers, setCustomers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await storeApi.getCustomers(page, 20, search);
        setCustomers(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setCustomers(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, search]);

  return { customers, loading, error };
}

export function useStoreReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRevenueReport = useCallback(async (startDate, endDate) => {
    try {
      setLoading(true);
      const data = await storeApi.getRevenueReport(startDate, endDate);
      setReport(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProfitReport = useCallback(async () => {
    try {
      setLoading(true);
      const data = await storeApi.getProfitReport();
      setReport(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    report,
    loading,
    error,
    fetchRevenueReport,
    fetchProfitReport,
  };
}
```

#### `src/hooks/usePermission.js`

```javascript
import { useAuth } from "./useAuth";

export function usePermission() {
  const { user } = useAuth();

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === "admin") return true;

    // Check user's permissions array
    return user.permissions?.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions) => {
    return permissions.some((perm) => hasPermission(perm));
  };

  const hasAllPermissions = (permissions) => {
    return permissions.every((perm) => hasPermission(perm));
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: user?.role === "admin",
  };
}
```

---

## Component Examples

### Admin Dashboard

File: `src/app/admin/dashboard/page.js`

```javascript
"use client";

import { useStoreDashboard } from "@/hooks/useStore";
import { usePermission } from "@/hooks/usePermission";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardPage() {
  const { stats, loading, error } = useStoreDashboard();
  const { hasPermission } = usePermission();
  const router = useRouter();

  useEffect(() => {
    if (!hasPermission("view:dashboard")) {
      router.push("/");
    }
  }, [hasPermission, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!stats) {
    return <div>No data</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Store Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-value">
            {new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(stats.totalRevenue)}
          </p>
        </div>

        <div className="stat-card">
          <h3>Total Orders</h3>
          <p className="stat-value">{stats.totalOrders}</p>
        </div>

        <div className="stat-card">
          <h3>Total Customers</h3>
          <p className="stat-value">{stats.totalCustomers}</p>
        </div>

        <div className="stat-card warning">
          <h3>Low Stock Items</h3>
          <p className="stat-value">{stats.lowStockItems}</p>
        </div>
      </div>
    </div>
  );
}
```

### Inventory Management

File: `src/app/admin/inventory/page.js`

```javascript
"use client";

import { useState } from "react";
import { useStoreInventory } from "@/hooks/useStore";
import { storeApi } from "@/lib/storeApi";

export default function InventoryPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { inventory, loading, error } = useStoreInventory(page, search);
  const [editingId, setEditingId] = useState(null);
  const [newStock, setNewStock] = useState(0);

  const handleUpdateStock = async (bentheid, tonkho) => {
    try {
      await storeApi.updateStock(bentheid, tonkho, "Updated via admin");
      setEditingId(null);
      // Refresh data
      window.location.reload();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div>Loading inventory...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="inventory-page">
      <h1>Inventory Management</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Variant</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {inventory?.data?.map((item) => (
            <tr key={item.bentheid}>
              <td>{item.sanpham_name}</td>
              <td>{item.sku}</td>
              <td>{item.tenbienthe}</td>
              <td>
                {editingId === item.bentheid ? (
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                  />
                ) : (
                  item.tonkho
                )}
              </td>
              <td>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(item.giaban)}
              </td>
              <td>
                {editingId === item.bentheid ? (
                  <>
                    <button
                      onClick={() => handleUpdateStock(item.bentheid, newStock)}
                    >
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditingId(item.bentheid);
                      setNewStock(item.tonkho);
                    }}
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {inventory?.total > 20 && (
        <div className="pagination">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page * 20 >= inventory.total}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

### Customers List

File: `src/app/admin/customers/page.js`

```javascript
"use client";

import { useState } from "react";
import { useStoreCustomers } from "@/hooks/useStore";

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { customers, loading, error } = useStoreCustomers(page, search);

  if (loading) return <div>Loading customers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="customers-page">
      <h1>Customer Management</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <table className="customers-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Orders</th>
            <th>Total Spent</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          {customers?.data?.map((customer) => (
            <tr key={customer.userid}>
              <td>{customer.hoten}</td>
              <td>{customer.email}</td>
              <td>{customer.sdt}</td>
              <td>{customer.total_orders}</td>
              <td>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(customer.total_spent)}
              </td>
              <td>{new Date(customer.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Revenue Report

File: `src/app/admin/reports/page.js`

```javascript
"use client";

import { useState } from "react";
import { useStoreReports } from "@/hooks/useStore";

export default function ReportsPage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { report, loading, fetchRevenueReport, fetchProfitReport } =
    useStoreReports();

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select date range");
      return;
    }
    await fetchRevenueReport(startDate, endDate);
  };

  return (
    <div className="reports-page">
      <h1>Financial Reports</h1>

      <div className="report-filters">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
        />
        <button onClick={handleGenerateReport} disabled={loading}>
          {loading ? "Loading..." : "Generate Revenue Report"}
        </button>
        <button onClick={fetchProfitReport} disabled={loading}>
          {loading ? "Loading..." : "Get Profit Report"}
        </button>
      </div>

      {report && (
        <div className="report-results">
          {report.totalRevenue !== undefined && (
            <div className="report-section">
              <h2>Revenue Report</h2>
              <div className="report-grid">
                <div className="report-item">
                  <label>Total Revenue</label>
                  <value>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(report.totalRevenue)}
                  </value>
                </div>
                <div className="report-item">
                  <label>Total Orders</label>
                  <value>{report.totalOrders}</value>
                </div>
                <div className="report-item">
                  <label>Average Order Value</label>
                  <value>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(report.averageOrderValue)}
                  </value>
                </div>
              </div>

              {report.topProducts && (
                <div>
                  <h3>Top Products</h3>
                  <ul>
                    {report.topProducts.map((product) => (
                      <li key={product.productName}>
                        {product.productName}: {product.quantity} units -{" "}
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(product.revenue)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {report.profitMargin !== undefined && (
            <div className="report-section">
              <h2>Profit Report</h2>
              <div className="report-grid">
                <div className="report-item">
                  <label>Total Revenue</label>
                  <value>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(report.totalRevenue)}
                  </value>
                </div>
                <div className="report-item">
                  <label>Total Costs</label>
                  <value>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(report.totalCosts)}
                  </value>
                </div>
                <div className="report-item">
                  <label>Profit</label>
                  <value>
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(report.profit)}
                  </value>
                </div>
                <div className="report-item">
                  <label>Profit Margin</label>
                  <value>{report.profitMargin}%</value>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Protected Route Component

File: `src/components/ProtectedRoute.js`

```javascript
"use client";

import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { useEffect } from "react";

export function ProtectedRoute({ children, requiredPermission }) {
  const { hasPermission } = usePermission();
  const router = useRouter();

  useEffect(() => {
    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push("/");
    }
  }, [requiredPermission, hasPermission, router]);

  return <>{children}</>;
}

// Usage:
// <ProtectedRoute requiredPermission="manage:inventory">
//   <InventoryPage />
// </ProtectedRoute>
```

---

## Styling

File: `src/styles/admin.scss`

```scss
.admin-dashboard {
  padding: 2rem;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      h3 {
        color: #666;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }

      .stat-value {
        font-size: 2rem;
        font-weight: bold;
        color: #000;
      }

      &.warning {
        border-left: 4px solid #ff9800;
      }
    }
  }
}

.inventory-table,
.customers-table {
  width: 100%;
  border-collapse: collapse;

  th {
    background: #f5f5f5;
    padding: 1rem;
    text-align: left;
    font-weight: bold;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
  }

  tr:hover {
    background: #f9f9f9;
  }
}

.pagination {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;

  button {
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  }
}
```

---

## Error Handling

File: `src/components/ErrorBoundary.js`

```javascript
"use client";

import { Component } from "react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", color: "red" }}>
          <h1>Oops! Something went wrong</h1>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Next Steps

1. ✅ Create API client functions
2. ✅ Create custom hooks
3. ✅ Build dashboard components
4. 🚀 Create inventory management page
5. 🚀 Create customer management page
6. 🚀 Create reports page
7. 📊 Add charts and visualizations
8. 🧪 Add unit tests
9. 📱 Make responsive for mobile

---

## References

- Backend API: `/backend/STORE_MANAGEMENT_API.md`
- Authorization: `/backend/AUTHORIZATION.md`
- Testing: `/backend/STORE_TESTING_GUIDE.md`
