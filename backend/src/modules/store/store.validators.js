/**
 * Store Management Validators
 * Validate request body cho store management endpoints
 */

/**
 * Validate stock level update
 */
export function validateStockUpdate(data) {
  if (!data) {
    return { ok: false, errors: { data: "Data is required" } };
  }

  const { tonkho, note } = data;

  const errors = {};

  if (tonkho === undefined || tonkho === null) {
    errors.tonkho = "Stock level is required";
  } else if (!Number.isInteger(tonkho)) {
    errors.tonkho = "Stock level must be an integer";
  } else if (tonkho < 0) {
    errors.tonkho = "Stock level cannot be negative";
  }

  if (note && typeof note !== "string") {
    errors.note = "Note must be a string";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { tonkho, note } };
}

/**
 * Validate shipment status update
 */
export function validateShipmentStatusUpdate(data) {
  if (!data) {
    return { ok: false, errors: { data: "Data is required" } };
  }

  const { status } = data;
  const validStatuses = ["SHIPPED", "IN_TRANSIT", "DELIVERED", "FAILED"];

  const errors = {};

  if (!status) {
    errors.status = "Status is required";
  } else if (!validStatuses.includes(status)) {
    errors.status = `Status must be one of: ${validStatuses.join(", ")}`;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { status } };
}

/**
 * Validate store settings update
 */
export function validateStoreSettingsUpdate(data) {
  if (!data) {
    return { ok: false, errors: { data: "Data is required" } };
  }

  const { storeName, storeEmail, storePhone, address, businessHours } = data;
  const errors = {};

  if (storeName && typeof storeName !== "string") {
    errors.storeName = "Store name must be a string";
  }

  if (storeEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(storeEmail)) {
    errors.storeEmail = "Invalid email format";
  }

  if (storePhone && !/^[\d\s\-\+\(\)]+$/.test(storePhone)) {
    errors.storePhone = "Invalid phone format";
  }

  if (address && typeof address !== "string") {
    errors.address = "Address must be a string";
  }

  if (businessHours && typeof businessHours !== "object") {
    errors.businessHours = "Business hours must be an object";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: { storeName, storeEmail, storePhone, address, businessHours },
  };
}

/**
 * Validate date range for reports
 */
export function validateDateRange(startDate, endDate) {
  const errors = {};

  if (startDate && isNaN(Date.parse(startDate))) {
    errors.startDate = "Invalid start date format";
  }

  if (endDate && isNaN(Date.parse(endDate))) {
    errors.endDate = "Invalid end date format";
  }

  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    errors.dateRange = "Start date must be before end date";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: { startDate, endDate } };
}

export default {
  validateStockUpdate,
  validateShipmentStatusUpdate,
  validateStoreSettingsUpdate,
  validateDateRange,
};
