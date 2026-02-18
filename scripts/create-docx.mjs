#!/usr/bin/env node
/**
 * Nexara IMS — DOCX Template Generator
 *
 * Usage: node scripts/create-docx.mjs <config-json-file>
 *
 * Config JSON format:
 * {
 *   "outputPath": "docs/compliance-templates/policies/POL-001-Quality-Policy.docx",
 *   "docNumber": "POL-001",
 *   "title": "Quality Policy",
 *   "version": "1.0",
 *   "owner": "[Quality Manager]",
 *   "approvedBy": "[Managing Director]",
 *   "isoRef": "ISO 9001:2015 Clause 5.2",
 *   "sections": [
 *     { "heading": "1. Purpose", "content": "..." },
 *     { "heading": "2. Scope", "content": "..." },
 *     { "heading": "2.1 Sub Section", "level": 2, "content": "..." },
 *     { "heading": null, "bullets": ["item 1", "item 2"] },
 *     { "table": { "headers": ["Col1","Col2"], "rows": [["a","b"],["c","d"]] } }
 *   ]
 * }
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  Footer,
  Header,
  PageNumber,
  NumberFormat,
  ShadingType,
  TabStopPosition,
  TabStopType,
  convertInchesToTwip,
  PageBreak,
} from 'docx';
import fs from 'fs';
import path from 'path';

const BLUE = '1B3A5C';
const LIGHT_BLUE = 'E8EFF7';
const DARK_GREY = '333333';
const MED_GREY = '666666';
const LIGHT_GREY = 'F5F5F5';
const WHITE = 'FFFFFF';
const GREEN = '2E7D32';

function makeHeader(title, docNumber, version, isoRef) {
  return new Header({
    children: [
      new Paragraph({
        children: [
          new TextRun({ text: 'NEXARA IMS', bold: true, size: 16, color: BLUE, font: 'Calibri' }),
          new TextRun({
            text: `    ${docNumber}  |  v${version}  |  ${isoRef}`,
            size: 14,
            color: MED_GREY,
            font: 'Calibri',
          }),
        ],
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BLUE } },
        spacing: { after: 100 },
      }),
    ],
  });
}

function makeFooter() {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: 'Confidential — [Company Name]',
            size: 14,
            color: MED_GREY,
            font: 'Calibri',
          }),
          new TextRun({ text: '    ', size: 14 }),
          new TextRun({
            text: '© 2026 [Company Name] — Nexara IMS',
            size: 14,
            color: MED_GREY,
            font: 'Calibri',
          }),
          new TextRun({ text: '    Page ', size: 14, color: MED_GREY, font: 'Calibri' }),
        ],
        border: { top: { style: BorderStyle.SINGLE, size: 1, color: BLUE } },
        spacing: { before: 100 },
        alignment: AlignmentType.CENTER,
      }),
    ],
  });
}

function makeCoverPage(title, docNumber, version, owner, approvedBy, isoRef) {
  return [
    new Paragraph({ spacing: { before: 2000 } }),
    new Paragraph({
      children: [
        new TextRun({ text: 'NEXARA', bold: true, size: 60, color: BLUE, font: 'Calibri' }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Integrated Management System',
          size: 28,
          color: MED_GREY,
          font: 'Calibri',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    }),
    new Paragraph({
      children: [new TextRun({ text: '', size: 2 })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BLUE } },
      spacing: { after: 600 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: title, bold: true, size: 44, color: DARK_GREY, font: 'Calibri' }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: isoRef, size: 24, color: MED_GREY, font: 'Calibri' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
    // Metadata table
    makeSimpleTable(
      [
        ['Document Number:', docNumber],
        ['Version:', version],
        ['Date:', '[DD/MM/YYYY]'],
        ['Owner:', owner],
        ['Approved By:', approvedBy],
        ['Classification:', 'Confidential'],
      ],
      true
    ),
    new Paragraph({ spacing: { after: 600 } }),
    // Revision history
    new Paragraph({
      children: [
        new TextRun({
          text: 'Revision History',
          bold: true,
          size: 24,
          color: BLUE,
          font: 'Calibri',
        }),
      ],
      spacing: { before: 400, after: 200 },
    }),
    makeDataTable(
      ['Version', 'Date', 'Description', 'Author', 'Approved By'],
      [
        [version, '[DD/MM/YYYY]', 'Initial Issue', '[Author Name]', '[Approver Name]'],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
      ]
    ),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

function makeSimpleTable(rows, isMetadata = false) {
  return new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    rows: rows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: label,
                      bold: true,
                      size: 20,
                      color: WHITE,
                      font: 'Calibri',
                    }),
                  ],
                  spacing: { before: 40, after: 40 },
                }),
              ],
              width: { size: 35, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: BLUE },
              margins: { top: 40, bottom: 40, left: 100, right: 100 },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: value, size: 20, font: 'Calibri' })],
                  spacing: { before: 40, after: 40 },
                }),
              ],
              width: { size: 65, type: WidthType.PERCENTAGE },
              margins: { top: 40, bottom: 40, left: 100, right: 100 },
            }),
          ],
        })
    ),
  });
}

function makeDataTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: headers.map(
          (h) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: h, bold: true, size: 18, color: WHITE, font: 'Calibri' }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 30, after: 30 },
                }),
              ],
              shading: { type: ShadingType.CLEAR, fill: BLUE },
              margins: { top: 30, bottom: 30, left: 60, right: 60 },
            })
        ),
      }),
      ...rows.map(
        (row, i) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: String(cell), size: 18, font: 'Calibri' })],
                      spacing: { before: 20, after: 20 },
                    }),
                  ],
                  shading: i % 2 === 1 ? { type: ShadingType.CLEAR, fill: LIGHT_GREY } : undefined,
                  margins: { top: 20, bottom: 20, left: 60, right: 60 },
                })
            ),
          })
      ),
    ],
  });
}

function parseSections(sections) {
  const children = [];
  for (const section of sections) {
    if (section.table) {
      if (section.tableTitle) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.tableTitle,
                bold: true,
                size: 22,
                color: BLUE,
                font: 'Calibri',
              }),
            ],
            spacing: { before: 200, after: 100 },
          })
        );
      }
      children.push(makeDataTable(section.table.headers, section.table.rows));
      children.push(new Paragraph({ spacing: { after: 200 } }));
      continue;
    }
    if (section.pageBreak) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
      continue;
    }
    if (section.heading) {
      const level = section.level || 1;
      const headingLevel =
        level === 1
          ? HeadingLevel.HEADING_1
          : level === 2
            ? HeadingLevel.HEADING_2
            : HeadingLevel.HEADING_3;
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.heading,
              bold: true,
              size: level === 1 ? 28 : level === 2 ? 24 : 22,
              color: BLUE,
              font: 'Calibri',
            }),
          ],
          heading: headingLevel,
          spacing: { before: level === 1 ? 400 : 200, after: 100 },
          ...(level === 1
            ? { border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: LIGHT_BLUE } } }
            : {}),
        })
      );
    }
    if (section.content) {
      const paragraphs = section.content.split('\n\n');
      for (const para of paragraphs) {
        if (para.trim()) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: para.trim(), size: 21, font: 'Calibri', color: DARK_GREY }),
              ],
              spacing: { after: 120, line: 300 },
            })
          );
        }
      }
    }
    if (section.bullets) {
      for (const bullet of section.bullets) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: bullet, size: 21, font: 'Calibri', color: DARK_GREY })],
            bullet: { level: 0 },
            spacing: { after: 60, line: 280 },
          })
        );
      }
    }
    if (section.numberedList) {
      for (const item of section.numberedList) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: item, size: 21, font: 'Calibri', color: DARK_GREY })],
            bullet: { level: 0 },
            spacing: { after: 60, line: 280 },
          })
        );
      }
    }
  }
  return children;
}

async function main() {
  const configFile = process.argv[2];
  if (!configFile) {
    console.error('Usage: node scripts/create-docx.mjs <config-json-file>');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  const {
    outputPath,
    docNumber,
    title,
    version = '1.0',
    owner = '[Document Owner]',
    approvedBy = '[Approver]',
    isoRef = '',
    sections = [],
  } = config;

  const coverPage = makeCoverPage(title, docNumber, version, owner, approvedBy, isoRef);
  const bodyContent = parseSections(sections);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Calibri', size: 21, color: DARK_GREY },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 },
          },
        },
        headers: { default: makeHeader(title, docNumber, version, isoRef) },
        footers: { default: makeFooter() },
        children: [...coverPage, ...bodyContent],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.resolve('/home/dyl/New-BMS', outputPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buffer);
  console.log(`Created: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
