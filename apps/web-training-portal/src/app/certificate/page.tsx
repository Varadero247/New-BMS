'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Download, Award } from 'lucide-react';

export default function CertificatePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const [grade, setGrade] = useState<'PASS' | 'DISTINCTION'>('PASS');
  const [score, setScore] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [certId] = useState(() => `CERT-2026-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
  const [rendered, setRendered] = useState(false);

  const drawCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !name) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 1920, h = 1080;
    canvas.width = w;
    canvas.height = h;

    // Background
    ctx.fillStyle = '#0B1E38';
    ctx.fillRect(0, 0, w, h);

    // Outer border (gold)
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 10;
    ctx.strokeRect(15, 15, w - 30, h - 30);

    // Inner border (steel blue)
    ctx.strokeStyle = '#1E3A5F';
    ctx.lineWidth = 3;
    ctx.strokeRect(32, 32, w - 64, h - 64);

    // Corner decorations
    const corners = [[45, 45], [w - 45, 45], [45, h - 45], [w - 45, h - 45]];
    corners.forEach(([x, y]) => {
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.stroke();
    });

    // "NEXARA" top-left logo
    ctx.fillStyle = '#B8860B';
    ctx.fillRect(60, 60, 50, 50);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Montserrat, Arial';
    ctx.textAlign = 'left';
    ctx.fillText('N', 76, 94);
    ctx.font = 'bold 24px Montserrat, Arial';
    ctx.fillText('NEXARA', 120, 94);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px Montserrat, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', w / 2, 200);

    // Subtitle
    ctx.fillStyle = '#C0C0C0';
    ctx.font = '22px Lato, Arial';
    ctx.fillText('Nexara IMS Platform', w / 2, 240);

    // Gold divider
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 300, 265);
    ctx.lineTo(w / 2 + 300, 265);
    ctx.stroke();

    // "This is to certify that"
    ctx.fillStyle = '#C0C0C0';
    ctx.font = '24px Lato, Arial';
    ctx.fillText('This is to certify that', w / 2, 330);

    // Participant name
    ctx.fillStyle = grade === 'DISTINCTION' ? '#B8860B' : '#FFFFFF';
    ctx.font = 'bold 64px Montserrat, Arial';
    ctx.fillText(name || 'Participant Name', w / 2, 430);

    // Organisation
    if (org) {
      ctx.fillStyle = '#C0C0C0';
      ctx.font = '24px Lato, Arial';
      ctx.fillText(`representing ${org}`, w / 2, 480);
    }

    // Body text
    ctx.fillStyle = '#C0C0C0';
    ctx.font = '22px Lato, Arial';
    ctx.fillText('has successfully completed the', w / 2, 540);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px Montserrat, Arial';
    ctx.fillText('Nexara IMS Role-Based Administrator Training Programme', w / 2, 580);
    ctx.fillStyle = '#C0C0C0';
    ctx.font = '20px Lato, Arial';
    ctx.fillText('Two-Day Instructor-Led Training  ·  14 CPD Hours', w / 2, 615);

    // Credential box
    const boxX = w / 2 - 420, boxY = 645, boxW = 840, boxH = 80;
    ctx.fillStyle = '#091628';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#B8860B';
    ctx.lineWidth = 2;
    ctx.strokeRect(boxX, boxY, boxW, boxH);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px Montserrat, Arial';
    const credText = grade === 'DISTINCTION'
      ? 'NEXARA CERTIFIED PLATFORM ADMINISTRATOR WITH DISTINCTION'
      : 'NEXARA CERTIFIED PLATFORM ADMINISTRATOR';
    ctx.fillText(credText, w / 2, 695);

    // Metadata
    ctx.fillStyle = '#C0C0C0';
    ctx.font = '20px Lato, Arial';
    const dateFormatted = date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
    ctx.fillText(
      `Grade: ${grade}${score ? '  ·  Score: ' + score + '%' : ''}  ·  Date: ${dateFormatted}  ·  ID: ${certId}`,
      w / 2, 770
    );

    // Signature lines
    ctx.strokeStyle = '#1E3A5F';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(100, 920); ctx.lineTo(380, 920); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w - 380, 920); ctx.lineTo(w - 100, 920); ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Lato, Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Chief Executive Officer', 100, 950);
    ctx.font = '16px Lato, Arial';
    ctx.fillStyle = '#C0C0C0';
    ctx.fillText('Nexara DMCC', 100, 972);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px Lato, Arial';
    ctx.fillText('Authorised Training Facilitator', w - 100, 950);
    ctx.font = '16px Lato, Arial';
    ctx.fillStyle = '#C0C0C0';
    ctx.fillText(dateFormatted, w - 100, 972);

    setRendered(true);
  };

  useEffect(() => {
    if (rendered) setRendered(false);
  }, [name, org, grade, score, date]);

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `nexara-certificate-${certId}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadPDF = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { default: jsPDF } = await import('jspdf');
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
    pdf.save(`nexara-certificate-${certId}.pdf`);
  };

  return (
    <main className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">← Back to Home</Link>
        <h1 className="text-3xl font-bold text-white mt-4 mb-2 flex items-center gap-3">
          <Award className="w-8 h-8 text-[#B8860B]" /> Certificate Generator
        </h1>
        <p className="text-slate-400">Enter your details to generate your Nexara certificate in PNG or PDF format.</p>
      </div>

      {/* Form */}
      <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Full Legal Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name as it should appear"
              className="w-full bg-[#1E3A5F]/30 border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#B8860B] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Organisation
            </label>
            <input
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="Your organisation name"
              className="w-full bg-[#1E3A5F]/30 border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#B8860B] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as 'PASS' | 'DISTINCTION')}
              className="w-full bg-[#1E3A5F]/30 border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#B8860B] transition-colors"
            >
              <option value="PASS">Pass (75–89%)</option>
              <option value="DISTINCTION">Distinction (≥ 90%)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Score (%)</label>
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g. 84"
              min={0} max={100}
              className="w-full bg-[#1E3A5F]/30 border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[#B8860B] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Assessment Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#1E3A5F]/30 border border-[#1E3A5F] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#B8860B] transition-colors"
            />
          </div>
          <div className="flex items-end">
            <div className="text-xs text-slate-500 bg-[#1E3A5F]/20 border border-[#1E3A5F] rounded-lg p-3">
              <div className="text-slate-400 font-medium mb-1">Certificate ID</div>
              <div className="font-mono text-slate-300">{certId}</div>
            </div>
          </div>
        </div>

        <button
          onClick={drawCertificate}
          disabled={!name}
          className="w-full bg-[#B8860B] text-white font-semibold py-3 rounded-lg hover:bg-[#D4A017] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Certificate Preview
        </button>
      </div>

      {/* Canvas preview */}
      <div className="bg-[#091628] border border-[#1E3A5F] rounded-xl p-4 mb-4">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg border border-[#1E3A5F]"
          style={{ aspectRatio: '16/9' }}
        />
        {!rendered && (
          <p className="text-center text-slate-500 text-sm mt-4">Certificate preview will appear here after generation</p>
        )}
      </div>

      {/* Download buttons */}
      {rendered && (
        <div className="flex gap-4">
          <button
            onClick={downloadPNG}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1E3A5F] text-white font-medium py-3 rounded-lg hover:bg-[#1E4A7F] transition-colors"
          >
            <Download className="w-4 h-4" /> Download PNG (1920×1080)
          </button>
          <button
            onClick={downloadPDF}
            className="flex-1 flex items-center justify-center gap-2 bg-[#B8860B] text-white font-medium py-3 rounded-lg hover:bg-[#D4A017] transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF (A4 Landscape)
          </button>
        </div>
      )}

      <div className="mt-6 text-xs text-slate-500 text-center">
        Verification URL: https://certs.nexara.io/verify/{certId}
      </div>
    </main>
  );
}
