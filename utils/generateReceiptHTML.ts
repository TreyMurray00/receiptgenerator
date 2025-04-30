import type { Receipt } from "@/types"
import { formatCurrency } from "./formatters"
import { format } from "date-fns"
import { loadSettings } from "./storage"

export const generateReceiptHTML = async (receipt: Receipt): Promise<string> => {
  const settings = await loadSettings()

  const calculateSubtotal = () => {
    return receipt.items.reduce((total, item) => {
      return total + item.quantity * item.price
    }, 0)
  }

  const calculateTax = () => {
    const subtotal = calculateSubtotal()
    return subtotal * (receipt.taxRate / 100)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax()
    return subtotal + tax
  }

  const subtotal = calculateSubtotal()
  const tax = calculateTax()
  const total = calculateTotal()

  const itemsHTML = receipt.items
    .map(
      (item) => `
    <tr>
      <td class="item-description">${item.description}</td>
      <td class="item-quantity">${item.quantity}</td>
      <td class="item-price">${formatCurrency(item.price, receipt.currency)}</td>
      <td class="item-total">${formatCurrency(item.quantity * item.price, receipt.currency)}</td>
    </tr>
  `,
    )
    .join("")

  const paymentMethodHTML =
    receipt.paymentMethod === "bank"
      ? `
    <div class="info-row">
      <div class="info-label">Bank Name</div>
      <div class="info-value">${receipt.bankName || "N/A"}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Reference</div>
      <div class="info-value">${receipt.referenceNumber || "N/A"}</div>
    </div>
  `
      : ""

  const businessInfoHTML =
    settings?.businessName != null
      ? `
    <div class="company-header">
      
      <div class="business-details">
        <div class="business-name">${settings.businessName}</div>
        <!-- <div class="logo-container"><img src="$" alt=" Logo" class="company-logo"/></div> : ""} -->
        <div class="business-contact">
          <div class="business-address">${settings.businessAddress}</div>
          <div class="contact-info">
            ${settings.businessPhone}
            ${settings.businessEmail ? ` • ${settings.businessEmail}` : ""}
          </div>
        </div>
      </div>
    </div>
  `
      : ""

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 20px;
          color: #1a1a1a;
          background-color: #f5f5f5;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .receipt {
          position: relative;
          max-width: 800px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .company-header {
          display: flex;
          padding: 24px;
          border-bottom: 1px solid #eee;
          background-color: #f9f9f9;
        }
        .logo-container {
          margin-right: 20px;
          display: flex;
          align-items: center;
        }
        .company-logo {
          max-width: 100px;
          max-height: 80px;
          object-fit: contain;
        }
        .business-details {
          flex: 1;
        }
        .business-name {
          font-size: 20px;
          font-weight: 600;
          color: #1a0066;
          margin-bottom: 4px;
        }
        .receipt-title {
          font-size: 16px;
          font-weight: 500;
          color: #4b5563;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .business-contact {
          color: #4b5563;
          font-size: 14px;
        }
        .business-address {
          margin-bottom: 4px;
        }
        .contact-info {
          color: #6b7280;
        }
        .content {
          padding: 24px;
          position: relative;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .meta-label {
          font-weight: 600;
          color: #1a0066;
          margin-right: 8px;
        }
        .meta-value {
          color: #1a1a1a;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
          font-size: 16px;
        }
        .info-row {
          display: flex;
          margin-bottom: 6px;
        }
        .info-label {
          width: 100px;
          font-weight: 500;
          color: #1a0066;
        }
        .info-value {
          flex: 1;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 14px;
        }
        .items-table th {
          text-align: left;
          padding: 8px;
          border-bottom: 2px solid #1a0066;
          color: #1a0066;
          font-weight: 600;
        }
        .items-table td {
          padding: 8px;
          border-bottom: 1px solid #eee;
        }
        .item-description { width: 40%; }
        .item-quantity { text-align: center; }
        .item-price, .item-total { text-align: right; }
        .totals {
          margin-left: auto;
          width: 250px;
          margin-top: 16px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-bottom: 1px solid #eee;
        }
        .total-row.grand-total {
          border-top: 2px solid #1a0066;
          border-bottom: none;
          padding-top: 12px;
          margin-top: 6px;
          font-weight: 700;
          font-size: 18px;
          color: #1a0066;
        }
        .paid-stamp {
          position: absolute;
          top: 50%;
          right: 10%;
          transform: rotate(-15deg);
          color: #1a0066;
          border: 3px solid #1a0066;
          padding: 10px 20px;
          font-weight: 700;
          font-size: 28px;
          opacity: 0.3;
        }
        .footer {
          margin-top: 32px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .signature {
          margin-top: 48px;
          text-align: right;
        }
        .signature-image {
          width: 160px;
          height: auto;
          margin-bottom: 6px;
        }
        .signature-name {
          font-weight: 600;
          color: #1a0066;
        }
        .signature-title {
          color: #666;
          font-size: 13px;
        }
        .payment-method {
          display: inline-block;
          padding: 4px 10px;
          background-color: #f0f0f0;
          border-radius: 4px;
          font-weight: 500;
          margin-bottom: 6px;
          font-size: 14px;
        }
        .customer-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .customer-details, .payment-details {
          width: 48%;
        }
        @media print {
          body {
            padding: 0;
            background: none;
          }
          .receipt {
            box-shadow: none;
            max-width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        ${businessInfoHTML}
        
        <div class="content">
          <div class="meta-row">
            <div>
              <span class="meta-label">Receipt No:</span>
              <span class="meta-value">${String(receipt.id.slice(0, 3)).padStart(3, "0")}</span>
            </div>
            <div>
              <span class="meta-label">Date:</span>
              <span class="meta-value">${format(new Date(receipt.date), "yyyy-MM-dd")}</span>
            </div>
          </div>

          <div class="customer-section">
            <div class="customer-details">
              <div class="section-title">Received from</div>
              <div class="info-value">${receipt.customerName || "N/A"}</div>
              ${receipt.customerEmail ? `<div class="info-value">${receipt.customerEmail}</div>` : ""}
            </div>
            
            <div class="payment-details">
              <div class="section-title">Payment Details</div>
              <div class="payment-method">
                ${receipt.paymentMethod === "cash" ? "Cash Payment" : "Bank Transfer"}
              </div>
              ${paymentMethodHTML}
            </div>
          </div>

          <div class="section">
            <div class="section-title">For</div>
            <div class="info-value">${receipt.notes || "Services Rendered"}</div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: center">Qty</th>
                <th style="text-align: right">Price</th>
                <th style="text-align: right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>${formatCurrency(subtotal, receipt.currency)}</span>
            </div>
            <div class="total-row">
              <span>Tax (${receipt.taxRate}%)</span>
              <span>${formatCurrency(tax, receipt.currency)}</span>
            </div>
            <div class="total-row grand-total">
              <span>Total</span>
              <span>${formatCurrency(total, receipt.currency)}</span>
            </div>
          </div>

          <div class="paid-stamp">PAID</div>

          <div class="signature">
            ${settings?.signature ? `<img src="${settings.signature}" class="signature-image" alt="Signature" />` : '<div class="signature-line"></div>'}
            <div class="signature-name">Authorized Signature</div>
            <div class="signature-title">Manager</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
