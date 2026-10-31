import PDFDocument from 'pdfkit';
import Complaint from '../models/Complaint.js';
import { buildFilter } from './complaint.service.js';

const esc = (v) => {
  const s = v === undefined || v === null ? '' : String(v);
  // Neutralise spreadsheet formula injection and quote safely
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

async function fetchRows(query, user) {
  const filter = buildFilter({ ...query }, user);
  return Complaint.find(filter)
    .sort('-createdAt')
    .limit(5000)
    .populate('citizen', 'name')
    .populate('assignedTo', 'name')
    .lean();
}

const HEADERS = ['Ticket', 'Title', 'Category', 'Urgency', 'Area', 'Status', 'Citizen', 'Assigned To', 'Created', 'Due', 'Resolved', 'Overdue', 'Escalation'];

const toRow = (c) => [
  c.ticketId, c.title, c.category, c.urgency, c.area, c.status,
  c.citizen?.name, c.assignedTo?.name,
  c.createdAt?.toISOString(), c.slaDueAt?.toISOString(), c.resolvedAt?.toISOString(),
  c.isOverdue ? 'YES' : 'NO', c.escalationLevel,
];

async function buildCsv(query, user) {
  const rows = await fetchRows(query, user);
  return [HEADERS.map(esc).join(','), ...rows.map((c) => toRow(c).map(esc).join(','))].join('\n');
}

async function streamPdf(query, user, res) {
  const rows = await fetchRows(query, user);
  const doc = new PDFDocument({ margin: 36, size: 'A4', layout: 'landscape' });
  doc.pipe(res);

  doc.fontSize(18).text('RingFix - Complaint Report', { align: 'left' });
  doc.fontSize(9).fillColor('#555').text(`Generated ${new Date().toLocaleString()}  |  ${rows.length} complaints`);
  doc.moveDown();

  const cols = [
    ['Ticket', 95], ['Title', 190], ['Category', 80], ['Urgency', 55],
    ['Area', 100], ['Status', 75], ['Assigned', 90], ['Overdue', 45],
  ];
  const drawRow = (vals, bold = false) => {
    let x = doc.page.margins.left;
    const y = doc.y;
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8).fillColor('#000');
    vals.forEach((v, i) => {
      doc.text(String(v ?? ''), x, y, { width: cols[i][1] - 4, height: 11, ellipsis: true, lineBreak: false });
      x += cols[i][1];
    });
    doc.y = y + 14;
  };

  drawRow(cols.map((c) => c[0]), true);
  rows.forEach((c) => {
    if (doc.y > doc.page.height - 60) { doc.addPage(); drawRow(cols.map((x) => x[0]), true); }
    drawRow([c.ticketId, c.title, c.category, c.urgency, c.area, c.status, c.assignedTo?.name, c.isOverdue ? 'YES' : '']);
  });
  doc.end();
}

export { buildCsv, streamPdf };
