import axios from 'axios';
import PDFDocument from 'pdfkit';

const cleanEnv = (value) => String(value || '').trim().replace(/^"|"$/g, '');

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
};

const formatAmount = (amount, currency = 'INR') => {
  const numericAmount = Number(amount || 0);
  return `${currency || 'INR'} ${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(numericAmount)}`;
};

const receiptStyles = `
  body { margin: 0; background: #f4f7fb; color: #111827; font-family: Arial, sans-serif; }
  .receipt { max-width: 840px; margin: 28px auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 14px; overflow: hidden; }
  .header { background: #0a2540; color: white; padding: 28px 32px; display: flex; justify-content: space-between; gap: 24px; }
  .brand { font-size: 24px; font-weight: 800; letter-spacing: .04em; }
  .muted { color: #6b7280; }
  .header .muted { color: rgba(255,255,255,.76); }
  .status { display: inline-block; margin-top: 10px; padding: 7px 12px; border-radius: 999px; background: #dcfce7; color: #166534; font-weight: 700; font-size: 12px; }
  .body { padding: 32px; }
  h1 { margin: 0 0 6px; font-size: 28px; }
  h2 { margin: 28px 0 12px; font-size: 16px; color: #0a2540; }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
  .box { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; background: #fafafa; }
  .label { color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
  .value { font-size: 15px; font-weight: 700; word-break: break-word; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th, td { padding: 14px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; vertical-align: top; }
  th { background: #f9fafb; color: #374151; font-size: 12px; text-transform: uppercase; letter-spacing: .05em; }
  .amount { text-align: right; font-weight: 800; }
  .total-row td { border-bottom: 0; font-size: 17px; }
  .footer { padding: 22px 32px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
  @media print { body { background: #fff; } .receipt { margin: 0; border: 0; border-radius: 0; } }
`;

export function buildReceiptHtml({
  receiptNo,
  title,
  payer,
  itemName,
  itemDescription,
  amount,
  currency,
  paymentId,
  orderId,
  paidAt,
  metadata = [],
}) {
  const safeReceiptNo = escapeHtml(receiptNo);
  const safeCurrency = currency || 'INR';

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Receipt ${safeReceiptNo}</title>
  <style>${receiptStyles}</style>
</head>
<body>
  <main class="receipt">
    <section class="header">
      <div>
        <div class="brand">VSS SOFTWARE</div>
        <div class="muted">VATE Software Systems Pvt. Ltd.</div>
      </div>
      <div>
        <div class="muted">Receipt No.</div>
        <strong>${safeReceiptNo}</strong>
        <div class="status">PAID</div>
      </div>
    </section>
    <section class="body">
      <h1>${escapeHtml(title)}</h1>
      <p class="muted">Payment receipt generated on ${escapeHtml(formatDate(new Date()))}</p>

      <div class="grid">
        <div class="box">
          <div class="label">Paid By</div>
          <div class="value">${escapeHtml(payer?.name || '-')}</div>
          <div class="muted">${escapeHtml(payer?.email || '-')}</div>
          <div class="muted">${escapeHtml(payer?.phone || '-')}</div>
        </div>
        <div class="box">
          <div class="label">Payment Date</div>
          <div class="value">${escapeHtml(formatDate(paidAt))}</div>
          <div class="muted">Payment ID: ${escapeHtml(paymentId || '-')}</div>
          <div class="muted">Order ID: ${escapeHtml(orderId || '-')}</div>
        </div>
      </div>

      <h2>Payment Details</h2>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>${escapeHtml(itemName)}</strong>
              <div class="muted">${escapeHtml(itemDescription || '')}</div>
            </td>
            <td class="amount">${escapeHtml(formatAmount(amount, safeCurrency))}</td>
          </tr>
          <tr class="total-row">
            <td><strong>Total Paid</strong></td>
            <td class="amount">${escapeHtml(formatAmount(amount, safeCurrency))}</td>
          </tr>
        </tbody>
      </table>

      ${metadata.length ? `
      <h2>Additional Details</h2>
      <div class="grid">
        ${metadata.map((item) => `
          <div class="box">
            <div class="label">${escapeHtml(item.label)}</div>
            <div class="value">${escapeHtml(item.value || '-')}</div>
          </div>
        `).join('')}
      </div>` : ''}
    </section>
    <section class="footer">
      This is a computer-generated receipt. For support, contact sales@vatedigi.com.
    </section>
  </main>
</body>
</html>`;
}

export function buildReceiptPdf({
  receiptNo,
  title,
  payer,
  itemName,
  itemDescription,
  amount,
  currency,
  paymentId,
  orderId,
  paidAt,
  metadata = [],
}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 48;
    const contentWidth = pageWidth - (margin * 2);
    const left = margin;
    const right = pageWidth - margin;

    const safeText = (value) => String(value || '-');

    const drawLabel = (label, x, y, width) => {
      doc
        .fillColor('#6B7280')
        .font('Helvetica-Bold')
        .fontSize(7)
        .text(safeText(label).toUpperCase(), x, y, { width, lineBreak: false });
    };

    const drawValue = (value, x, y, width, options = {}) => {
      doc
        .fillColor(options.color || '#111827')
        .font(options.bold ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(options.size || 9)
        .text(safeText(value), x, y, {
          width,
          align: options.align || 'left',
          lineGap: 2,
        });
    };

    doc
      .rect(0, 0, pageWidth, 110)
      .fill('#0A2540');

    doc
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .fontSize(22)
      .text('VSS SOFTWARE', left, 34, { width: 240, lineBreak: false })
      .font('Helvetica')
      .fontSize(10)
      .text('VATE Software Systems Pvt. Ltd.', left, 62, { width: 240, lineBreak: false });

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('RECEIPT NO.', 330, 34, { width: 185, align: 'right', lineBreak: false })
      .fontSize(12)
      .text(String(receiptNo || '-'), 330, 51, { width: 185, align: 'right', lineBreak: false })
      .roundedRect(445, 72, 70, 22, 11)
      .fill('#DCFCE7')
      .fillColor('#166534')
      .fontSize(10)
      .text('PAID', 445, 78, { width: 70, align: 'center', lineBreak: false });

    doc
      .fillColor('#111827')
      .font('Helvetica-Bold')
      .fontSize(22)
      .text(title || 'Payment Receipt', left, 145, { width: 340, lineBreak: false })
      .fillColor('#6B7280')
      .font('Helvetica')
      .fontSize(10)
      .text(`Generated on ${formatDate(new Date())}`, left, 174, { width: 340, lineBreak: false });

    const startY = 214;
    const boxWidth = (contentWidth - 16) / 2;

    const drawInfoBox = (x, y, heading, lines) => {
      doc
        .roundedRect(x, y, boxWidth, 88, 8)
        .fillAndStroke('#FAFAFA', '#E5E7EB');
      drawLabel(heading, x + 14, y + 14, boxWidth - 28);
      drawValue(lines[0], x + 14, y + 32, boxWidth - 28, { bold: true, size: 10 });
      lines.slice(1).forEach((line, index) => {
        drawValue(line, x + 14, y + 50 + (index * 14), boxWidth - 28, { color: '#6B7280', size: 8 });
      });
    };

    drawInfoBox(left, startY, 'Paid By', [
      payer?.name || '-',
      payer?.email || '-',
      payer?.phone || '-',
    ]);
    drawInfoBox(left + boxWidth + 16, startY, 'Payment', [
      formatDate(paidAt),
      `Payment ID: ${paymentId || '-'}`,
      `Order ID: ${orderId || '-'}`,
    ]);

    doc
      .fillColor('#0A2540')
      .font('Helvetica-Bold')
      .fontSize(13)
      .text('Payment Details', left, startY + 122, { width: contentWidth, lineBreak: false });

    const tableY = startY + 146;
    doc
      .rect(left, tableY, contentWidth, 28)
      .fill('#F9FAFB')
      .stroke('#E5E7EB');
    drawValue('DESCRIPTION', left + 12, tableY + 10, 230, { bold: true, size: 8, color: '#374151' });
    drawValue('AMOUNT', right - 120, tableY + 10, 108, { bold: true, size: 8, color: '#374151', align: 'right' });

    doc
      .rect(left, tableY + 28, contentWidth, 76)
      .fillAndStroke('#FFFFFF', '#E5E7EB');
    drawValue(itemName, left + 12, tableY + 44, 330, { bold: true, size: 11 });
    drawValue(itemDescription || '', left + 12, tableY + 62, 330, { size: 9, color: '#6B7280' });
    drawValue(formatAmount(amount, currency || 'INR'), right - 120, tableY + 48, 108, { bold: true, size: 12, align: 'right' });

    doc
      .rect(left, tableY + 104, contentWidth, 34)
      .fillAndStroke('#FFFFFF', '#E5E7EB');
    drawValue('Total Paid', left + 12, tableY + 116, 200, { bold: true, size: 12 });
    drawValue(formatAmount(amount, currency || 'INR'), right - 120, tableY + 116, 108, { bold: true, size: 12, align: 'right' });

    let detailsY = tableY + 166;

    if (metadata.length) {
      doc
        .fillColor('#0A2540')
        .font('Helvetica-Bold')
        .fontSize(13)
        .text('Additional Details', left, detailsY, { width: contentWidth, lineBreak: false });

      detailsY += 24;
      const detailBoxWidth = (contentWidth - 16) / 2;
      metadata.forEach((item, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = left + (col * (detailBoxWidth + 16));
        const y = detailsY + (row * 54);
        doc
          .roundedRect(x, y, detailBoxWidth, 42, 6)
          .fillAndStroke('#FAFAFA', '#E5E7EB');
        drawLabel(item.label, x + 12, y + 10, detailBoxWidth - 24);
        drawValue(item.value || '-', x + 12, y + 24, detailBoxWidth - 24, { size: 9 });
      });
      detailsY += Math.ceil(metadata.length / 2) * 54;
    }

    const footerY = Math.max(detailsY + 18, pageHeight - 82);
    doc
      .strokeColor('#E5E7EB')
      .moveTo(left, footerY)
      .lineTo(right, footerY)
      .stroke()
      .fillColor('#6B7280')
      .font('Helvetica')
      .fontSize(9)
      .text('This is a computer-generated receipt. For support, contact sales@vatedigi.com.', left, footerY + 14, {
        width: contentWidth,
        align: 'center',
        lineBreak: false,
      });

    doc.end();
  });
}

export function sendReceiptDownload(res, fileName, content) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.send(content);
}

export async function sendReceiptEmail({ to, name, subject, receiptNo, attachmentContent, fileName }) {
  const BREVO_API_KEY = cleanEnv(process.env.BREVO_API_KEY);
  const FROM_EMAIL = cleanEnv(process.env.FROM_EMAIL);

  if (!BREVO_API_KEY || !FROM_EMAIL || !to) {
    throw new Error('Receipt email configuration is missing');
  }

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: {
        email: FROM_EMAIL,
        name: 'VSS SOFTWARE',
      },
      to: [{ email: to, name }],
      subject,
      htmlContent: `
        <div style="font-family:Arial,sans-serif;padding:20px;max-width:560px;margin:auto;color:#111;">
          <h2 style="margin-bottom:10px;">Payment receipt</h2>
          <p>Hi ${escapeHtml(name || 'Student')},</p>
          <p>Your payment has been confirmed. Your receipt number is <b>${escapeHtml(receiptNo)}</b>.</p>
          <p>The full receipt PDF is attached to this email.</p>
          <p style="color:#666;font-size:12px;margin-top:24px;">VSS SOFTWARE</p>
        </div>
      `,
      attachment: [
        {
          name: fileName,
          content: Buffer.from(attachmentContent).toString('base64'),
        },
      ],
    },
    {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
}
