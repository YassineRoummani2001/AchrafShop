import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateOrderPDF = (order) => {
  const doc = new jsPDF();
  
  // Custom styling constants
  const primaryColor = [15, 23, 42]; // Dark slate
  const accentColor = [201, 169, 110]; // Gold
  const textColor = [60, 60, 60];
  const lightText = [120, 120, 120];

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 35, 'F');
  
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text('ACHRAF SHOP', 14, 23);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text('INVOICE / RECEIPT', 150, 23);

  // Line separator
  doc.setDrawColor(230, 230, 230);
  doc.line(14, 45, 196, 45);

  // Order Info (Left)
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text('ORDER DETAILS', 14, 55);
  
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textColor);
  doc.text(`Order ID: #${order._id.slice(-8).toUpperCase()}`, 14, 62);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 69);
  doc.text(`Status: ${order.orderStatus.toUpperCase()}`, 14, 76);
  doc.text(`Payment: ${order.isPaid ? 'Paid' : 'Unpaid'} (${order.paymentMethod === 'cod' ? 'COD' : 'Card'})`, 14, 83);

  // Customer Info (Right)
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text('BILL TO', 110, 55);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textColor);
  
  const customerName = order.shippingInfo?.fullName || order.user?.name || 'Guest';
  const customerEmail = order.shippingInfo?.email || order.user?.email || 'N/A';
  const phone = order.shippingInfo?.phone || 'N/A';
  const addressString = `${order.shippingInfo?.address || 'N/A'}, ${order.shippingInfo?.city || ''}`;
  
  // Wrap address if it's too long
  const splitAddress = doc.splitTextToSize(`Address: ${addressString}`, 85);

  doc.text(`Name: ${customerName}`, 110, 62);
  doc.text(`Email: ${customerEmail}`, 110, 69);
  doc.text(`Phone: ${phone}`, 110, 76);
  doc.text(splitAddress, 110, 83);

  // Calculate dynamic startY for table based on address length
  const tableStartY = 85 + (splitAddress.length * 5) + 5;

  // Table
  const tableColumn = ["Item", "Size", "Color", "Qty", "Unit Price", "Total"];
  const tableRows = [];

  order.orderItems?.forEach(item => {
    tableRows.push([
      item.name,
      item.size || '-',
      item.color || '-',
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]);
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 4, textColor: [40, 40, 40] },
    headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 70 }, // Item Name
      3: { halign: 'center' }, // Qty
      4: { halign: 'right' }, // Unit Price
      5: { halign: 'right' }  // Total
    }
  });

  const finalY = doc.lastAutoTable.finalY || tableStartY + 20;

  // Totals Area
  doc.setDrawColor(200, 200, 200);
  doc.line(120, finalY + 10, 196, finalY + 10);

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  
  // Align right helper
  const rightAlign = (text, y) => {
    const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.text(text, 196 - textWidth, y);
  };

  const itemsPrice = (order.totalPrice - (order.shippingPrice || 0) - (order.taxPrice || 0)).toFixed(2);
  const shippingPrice = (order.shippingPrice || 0).toFixed(2);
  const taxPrice = (order.taxPrice || 0).toFixed(2);

  doc.text('Subtotal:', 140, finalY + 18);
  rightAlign(`$${itemsPrice}`, finalY + 18);

  doc.text('Shipping:', 140, finalY + 25);
  rightAlign(`$${shippingPrice}`, finalY + 25);

  doc.text('Tax:', 140, finalY + 32);
  rightAlign(`$${taxPrice}`, finalY + 32);

  doc.setFillColor(...primaryColor);
  doc.rect(135, finalY + 38, 65, 10, 'F');
  
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...accentColor);
  doc.text('TOTAL:', 140, finalY + 45);
  
  const totalWidth = doc.getStringUnitWidth(`$${order.totalPrice?.toFixed(2)}`) * doc.internal.getFontSize() / doc.internal.scaleFactor;
  doc.text(`$${order.totalPrice?.toFixed(2)}`, 196 - totalWidth - 2, finalY + 45);

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...lightText);
  doc.text('Thank you for shopping with Achraf Shop!', 105, pageHeight - 15, { align: 'center' });
  doc.text('If you have any questions about this invoice, please contact support@achrafshop.com', 105, pageHeight - 10, { align: 'center' });

  // Save the PDF
  doc.save(`invoice_${order._id.slice(-8).toUpperCase()}.pdf`);
};
