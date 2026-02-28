# Digital Certificate Specification — Web Portal Export

---

## Export Formats

| Format | Dimensions | Resolution | Colour space |
|--------|-----------|-----------|--------------|
| PDF (A4 Landscape) | 297mm × 210mm | 300 DPI | CMYK |
| PNG (Digital) | 1920 × 1080px | 96 DPI (screen) | sRGB |

---

## Generation Flow

```
Participant enters name
         ↓
Portal validates score ≥ 75%
         ↓
Server generates Certificate ID (UUID v4)
         ↓
Server registers certificate in Training Registry
         ↓
Client-side: render certificate on HTML Canvas
         ↓
Export: PDF via jsPDF OR PNG via canvas.toDataURL()
         ↓
Download triggered in browser
```

---

## Technical Implementation

### Dependencies

```json
{
  "jspdf": "^2.5.1",
  "html2canvas": "^1.4.1"
}
```

### Canvas Rendering Approach

```typescript
// Certificate canvas dimensions (1920×1080 for PNG)
const canvas = document.createElement('canvas');
canvas.width = 1920;
canvas.height = 1080;
const ctx = canvas.getContext('2d');

// Background
ctx.fillStyle = '#0B1E38';
ctx.fillRect(0, 0, 1920, 1080);

// Outer border (gold)
ctx.strokeStyle = '#B8860B';
ctx.lineWidth = 8;
ctx.strokeRect(20, 20, 1880, 1040);

// Inner border (steel blue)
ctx.strokeStyle = '#1E3A5F';
ctx.lineWidth = 3;
ctx.strokeRect(35, 35, 1850, 1010);

// Title
ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 48px Montserrat';
ctx.textAlign = 'center';
ctx.fillText('CERTIFICATE OF ACHIEVEMENT', 960, 160);

// Participant name (gold for Distinction, white for Pass)
ctx.fillStyle = isDistinction ? '#B8860B' : '#FFFFFF';
ctx.font = 'bold 64px Montserrat';
ctx.fillText(participantName, 960, 380);

// Credential box
ctx.fillStyle = '#091628';
ctx.fillRect(560, 560, 800, 90);
ctx.strokeStyle = '#B8860B';
ctx.lineWidth = 2;
ctx.strokeRect(560, 560, 800, 90);
ctx.fillStyle = '#FFFFFF';
ctx.font = 'bold 28px Montserrat';
const credText = isDistinction
  ? 'NEXARA CERTIFIED PLATFORM ADMINISTRATOR WITH DISTINCTION'
  : 'NEXARA CERTIFIED PLATFORM ADMINISTRATOR';
ctx.fillText(credText, 960, 615);

// Metadata
ctx.fillStyle = '#C0C0C0';
ctx.font = '22px Lato';
ctx.fillText(`Grade: ${grade}  |  Score: ${score}%  |  Date: ${date}  |  ID: ${certId}`, 960, 820);
```

### PDF Export

```typescript
import jsPDF from 'jspdf';

const generatePDF = (canvas: HTMLCanvasElement) => {
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
  pdf.save(`nexara-certificate-${certId}.pdf`);
};
```

### PNG Export

```typescript
const generatePNG = (canvas: HTMLCanvasElement) => {
  const link = document.createElement('a');
  link.download = `nexara-certificate-${certId}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
};
```

---

## Certificate ID Server Registration

```typescript
// Server-side (Next.js API route or server action)
export async function registerCertificate(data: {
  participantName: string;
  organisation: string;
  score: number;
  assessmentDate: string;
  facilitator: string;
}) {
  const certId = `CERT-${new Date().getFullYear()}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

  // Store in registry (database table: training_certificates)
  await prisma.trainingCertificate.create({
    data: {
      certId,
      participantName: data.participantName,
      organisation: data.organisation,
      score: data.score,
      grade: data.score >= 90 ? 'DISTINCTION' : 'PASS',
      assessmentDate: new Date(data.assessmentDate),
      facilitator: data.facilitator,
      issuedAt: new Date(),
    }
  });

  return certId;
}
```

---

## Verification Endpoint

The verification page (`/certificate/verify/[certId]`) calls:

```
GET https://your-instance.nexara.io/api/training/certificates/{certId}
```

Response:
```json
{
  "valid": true,
  "certId": "CERT-2026-A3F2B1C4",
  "participantName": "James Warren",
  "organisation": "Nexara Training Co.",
  "grade": "DISTINCTION",
  "score": 92,
  "assessmentDate": "2026-02-28",
  "issuedAt": "2026-02-28T16:15:00Z"
}
```

---

## Font Loading

Certificates require Montserrat and Lato fonts. For canvas rendering, fonts must be loaded before drawing:

```typescript
await Promise.all([
  document.fonts.load('bold 64px Montserrat'),
  document.fonts.load('22px Lato'),
]);
// Then proceed to canvas rendering
```

Include in layout.tsx:
```html
<link
  href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Lato:wght@400;700&display=swap"
  rel="stylesheet"
/>
```

---

## Client Logo Integration

If an organisation logo is configured:
1. Load image from portal settings API
2. Draw in bottom-right zone: `ctx.drawImage(logo, 1740, 900, 160, 80)`
3. Maintain aspect ratio (max 160×80px)
