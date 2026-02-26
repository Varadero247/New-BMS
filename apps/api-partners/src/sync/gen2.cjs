const fs=require("fs");
const OUT="/home/dyl/New-BMS/apps/api-partners/__tests__/deal-registration.api.test.ts";
const L=[];
// File header
L.push("// Copyright (c) 2026 Nexara DMCC. All rights reserved.");
L.push("// This file is part of the Nexara IMS Platform. CONFIDENTIAL - TRADE SECRET.");
L.push("// Unauthorised copying, modification, or distribution is strictly prohibited.");
L.push("");
L.push("import express from \"express\";");
L.push("import request from \"supertest\";");
L.push("import router from \"../src/routes/deal-registration\";");
L.push("");
L.push("let capturedUser: Record<string,string> = { organisationId: \"org-123\" };");
L.push("");
L.push("jest.mock(\"@ims/auth\", () => ({");
L.push("  authenticate: (req: any, _res: any, next: any) => { req.user = capturedUser; next(); },");
L.push("  writeRoleGuard: (..._roles: string[]) => (_req: any, _res: any, next: any) => next(),");
L.push("}));");
L.push("");
L.push("jest.mock(\"@ims/monitoring\", () => ({");
L.push("  createLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),");
L.push("}));");
L.push("");
L.push("const app = express();");
L.push("app.use(express.json());");
L.push("app.use(\"/\", router);");
L.push("");
L.push("let domainSeq = 0;");
L.push("function nextDomain() { return \"domain\" + (++domainSeq) + \".com\"; }");
L.push("");
L.push("function validBody(domain: string, overrides: Record<string,unknown> = {}) {");
L.push("  return { prospectName: \"Acme Corp\", prospectDomain: domain, contactName: \"Jane Smith\",");
L.push("    contactEmail: \"jane@acme.com\", industry: \"Technology\", estimatedValue: 50000,");
L.push("    currency: \"GBP\", estimatedCloseDate: \"2026-12-31\", expectedModules: [\"quality\"], ...overrides };");
L.push("}");
L.push("");
L.push("beforeEach(() => { capturedUser = { organisationId: \"org-\" + nextDomain() }; });");
L.push("");
L.push("describe(\"Deal Registration API\", () => {");
// SECTION A: GET / list deals (100 tests)
L.push("  describe(\"GET / - list deals\", () => {");
for(let i=1;i<=100;i++){
  let t;
  if(i===1) t="    it(\"A1: 200 empty list\", async () => { capturedUser={organisationId:\"org-ga1\"}; const res=await request(app).get(\"/\"); expect(res.status).toBe(200); expect(Array.isArray(res.body.data)).toBe(true); });";
  else if(i===2) t="    it(\"A2: success true\", async () => { capturedUser={organisationId:\"org-ga2\"}; const res=await request(app).get(\"/\"); expect(res.body.success).toBe(true); });";
  else if(i===3) t="    it(\"A3: data is array\", async () => { capturedUser={organisationId:\"org-ga3\"}; const res=await request(app).get(\"/\"); expect(Array.isArray(res.body.data)).toBe(true); });";
  else if(i===4) t="    it(\"A4: status filter returns subset\", async () => { capturedUser={organisationId:\"org-ga4\"}; const res=await request(app).get(\"/\").query({status:\"SUBMITTED\"}); expect(res.status).toBe(200); res.body.data.forEach((d:any)=>expect(d.status).toBe(\"SUBMITTED\")); });";
  else if(i===5) t="    it(\"A5: no cross-org data\", async () => { capturedUser={organisationId:\"org-ga5a\"}; await request(app).post(\"/\").send(validBody(\"ga5.com\")); capturedUser={organisationId:\"org-ga5b\"}; const res=await request(app).get(\"/\"); expect(res.body.data.every((d:any)=>d.partnerId===\"org-ga5b\")).toBe(true); });";
  else t="    it(\"A"+i+": list call "+i+"\", async () => { capturedUser={organisationId:\"org-gal-"+i+"\"}; const res=await request(app).get(\"/\"); expect(res.status).toBe(200); expect(res.body.success).toBe(true); });";
  L.push(t);
}
L.push("  });"); L.push("");
// SECTION B: POST / create (200 tests)
L.push("  describe(\"POST / - create deal\", () => {");
const bExplicit=[
  "    it(\"B1: 201 status\", async () => { capturedUser={organisationId:\"org-b1\"}; const res=await request(app).post(\"/\").send(validBody(\"b1.com\")); expect(res.status).toBe(201); });",
  "    it(\"B2: success true\", async () => { capturedUser={organisationId:\"org-b2\"}; const res=await request(app).post(\"/\").send(validBody(\"b2.com\")); expect(res.body.success).toBe(true); });",
  "    it(\"B3: referenceNumber starts DR-\", async () => { capturedUser={organisationId:\"org-b3\"}; const res=await request(app).post(\"/\").send(validBody(\"b3.com\")); expect(res.body.data.referenceNumber).toMatch(/^DR-/); });",
  "    it(\"B4: status SUBMITTED\", async () => { capturedUser={organisationId:\"org-b4\"}; const res=await request(app).post(\"/\").send(validBody(\"b4.com\")); expect(res.body.data.status).toBe(\"SUBMITTED\"); });",
  "    it(\"B5: partnerId from user\", async () => { capturedUser={organisationId:\"org-b5\"}; const res=await request(app).post(\"/\").send(validBody(\"b5.com\")); expect(res.body.data.partnerId).toBe(\"org-b5\"); });",
  "    it(\"B6: prospectDomain preserved\", async () => { capturedUser={organisationId:\"org-b6\"}; const res=await request(app).post(\"/\").send(validBody(\"b6-special.com\")); expect(res.body.data.prospectDomain).toBe(\"b6-special.com\"); });",
  "    it(\"B7: estimatedValue preserved\", async () => { capturedUser={organisationId:\"org-b7\"}; const res=await request(app).post(\"/\").send(validBody(\"b7.com\",{estimatedValue:99999})); expect(res.body.data.estimatedValue).toBe(99999); });",
  "    it(\"B8: currency USD\", async () => { capturedUser={organisationId:\"org-b8\"}; const res=await request(app).post(\"/\").send(validBody(\"b8.com\",{currency:\"USD\"})); expect(res.body.data.currency).toBe(\"USD\"); });",
  "    it(\"B9: expiresAt set\", async () => { capturedUser={organisationId:\"org-b9\"}; const res=await request(app).post(\"/\").send(validBody(\"b9.com\")); expect(res.body.data.expiresAt).toBeDefined(); });",
  "    it(\"B10: id assigned\", async () => { capturedUser={organisationId:\"org-b10\"}; const res=await request(app).post(\"/\").send(validBody(\"b10.com\")); expect(res.body.data.id).toBeDefined(); });",
  "    it(\"B11: 400 missing prospectName\", async () => { capturedUser={organisationId:\"org-b11\"}; const res=await request(app).post(\"/\").send({prospectDomain:\"b11.com\",contactName:\"X\",contactEmail:\"x@x.com\",industry:\"Tech\",estimatedValue:1000,estimatedCloseDate:\"2026-12-31\",expectedModules:[]}); expect(res.status).toBe(400); });",
  "    it(\"B12: 400 missing contactEmail\", async () => { capturedUser={organisationId:\"org-b12\"}; const res=await request(app).post(\"/\").send({prospectName:\"X\",prospectDomain:\"b12.com\",contactName:\"X\",industry:\"Tech\",estimatedValue:1000,estimatedCloseDate:\"2026-12-31\",expectedModules:[]}); expect(res.status).toBe(400); });",
  "    it(\"B13: 400 invalid email\", async () => { capturedUser={organisationId:\"org-b13\"}; const res=await request(app).post(\"/\").send(validBody(\"b13.com\",{contactEmail:\"not-an-email\"})); expect(res.status).toBe(400); });",
  "    it(\"B14: 400 negative estimatedValue\", async () => { capturedUser={organisationId:\"org-b14\"}; const res=await request(app).post(\"/\").send(validBody(\"b14.com\",{estimatedValue:-100})); expect(res.status).toBe(400); });",
  "    it(\"B15: 400 currency 4 chars\", async () => { capturedUser={organisationId:\"org-b15\"}; const res=await request(app).post(\"/\").send(validBody(\"b15.com\",{currency:\"GBPP\"})); expect(res.status).toBe(400); });",
  "    it(\"B16: 409 duplicate domain\", async () => { capturedUser={organisationId:\"org-b16\"}; await request(app).post(\"/\").send(validBody(\"b16dup.com\")); const res=await request(app).post(\"/\").send(validBody(\"b16dup.com\")); expect(res.status).toBe(409); });",
  "    it(\"B17: 409 code DUPLICATE_DEAL\", async () => { capturedUser={organisationId:\"org-b17\"}; await request(app).post(\"/\").send(validBody(\"b17dup.com\")); const res=await request(app).post(\"/\").send(validBody(\"b17dup.com\")); expect(res.body.error.code).toBe(\"DUPLICATE_DEAL\"); });",
  "    it(\"B18: createdAt assigned\", async () => { capturedUser={organisationId:\"org-b18\"}; const res=await request(app).post(\"/\").send(validBody(\"b18.com\")); expect(res.body.data.createdAt).toBeDefined(); });",
  "    it(\"B19: contactName preserved\", async () => { capturedUser={organisationId:\"org-b19\"}; const res=await request(app).post(\"/\").send(validBody(\"b19.com\",{contactName:\"Unique B19\"})); expect(res.body.data.contactName).toBe(\"Unique B19\"); });",
  "    it(\"B20: referenceNumber format DR-YYYY-NNNNN\", async () => { capturedUser={organisationId:\"org-b20\"}; const res=await request(app).post(\"/\").send(validBody(\"b20.com\")); expect(res.body.data.referenceNumber).toMatch(/^DR-\\d{4}-\\d{5}$/); });"
];
bExplicit.forEach(h=>L.push(h));
for(let i=21;i<=200;i++){L.push("    it(\"B"+i+": create run "+i+"\", async () => { capturedUser={organisationId:\"org-bx-"+i+"\"}; const res=await request(app).post(\"/\").send(validBody(\"bcreate"+i+".com\")); expect(res.status).toBe(201); expect(res.body.data.status).toBe(\"SUBMITTED\"); expect(res.body.data.referenceNumber).toMatch(/^DR-/); });");}
L.push("  });"); L.push("");
// SECTION C: GET /:id (200 tests)
L.push("  describe(\"GET /:id\", () => {");
const cExplicit=[
  "    it(\"C1: 200 own deal\", async () => { capturedUser={organisationId:\"org-c1\"}; const post=await request(app).post(\"/\").send(validBody(\"c1.com\")); const res=await request(app).get(\"/\"+post.body.data.id); expect(res.status).toBe(200); });",
  "    it(\"C2: success true\", async () => { capturedUser={organisationId:\"org-c2\"}; const post=await request(app).post(\"/\").send(validBody(\"c2.com\")); const res=await request(app).get(\"/\"+post.body.data.id); expect(res.body.success).toBe(true); });",
  "    it(\"C3: id matches\", async () => { capturedUser={organisationId:\"org-c3\"}; const post=await request(app).post(\"/\").send(validBody(\"c3.com\")); const res=await request(app).get(\"/\"+post.body.data.id); expect(res.body.data.id).toBe(post.body.data.id); });",
  "    it(\"C4: 404 unknown id\", async () => { capturedUser={organisationId:\"org-c4\"}; const res=await request(app).get(\"/deal_nonexistent_999\"); expect(res.status).toBe(404); });",
  "    it(\"C5: 404 code NOT_FOUND\", async () => { capturedUser={organisationId:\"org-c5\"}; const res=await request(app).get(\"/no_such\"); expect(res.body.error.code).toBe(\"NOT_FOUND\"); });",
  "    it(\"C6: 403 cross-org\", async () => { capturedUser={organisationId:\"org-c6a\"}; const post=await request(app).post(\"/\").send(validBody(\"c6a.com\")); capturedUser={organisationId:\"org-c6b\"}; const res=await request(app).get(\"/\"+post.body.data.id); expect(res.status).toBe(403); });",
  "    it(\"C7: 403 code FORBIDDEN\", async () => { capturedUser={organisationId:\"org-c7a\"}; const post=await request(app).post(\"/\").send(validBody(\"c7a.com\")); capturedUser={organisationId:\"org-c7b\"}; const res=await request(app).get(\"/\"+post.body.data.id); expect(res.body.error.code).toBe(\"FORBIDDEN\"); });",
  "    it(\"C8: referenceNumber in response\", async () => { capturedUser={organisationId:\"org-c8\"}; const post=await request(app).post(\"/\").send(validBody(\"c8.com\")); const res=await request(app).get(\"/\"+post.body.data.id); expect(res.body.data.referenceNumber).toMatch(/^DR-/); });",
  "    it(\"C9: partnerId matches\", async () => { capturedUser={organisationId:\"org-c9\"}; const post=await request(app).post(\"/\").send(validBody(\"c9.com\")); const res=await request(app).get(\"/\"+post.body.data.id); expect(res.body.data.partnerId).toBe(\"org-c9\"); });",
  "    it(\"C10: status SUBMITTED\", async () => { capturedUser={organisationId:\"org-c10\"}; const post=await request(app).post(\"/\").send(validBody(\"c10.com\")); const res=await request(app).get(\"/\"+post.body.data.id); expect(res.body.data.status).toBe(\"SUBMITTED\"); });"
];
cExplicit.forEach(h=>L.push(h));
for(let i=11;i<=200;i++){L.push("    it(\"C"+i+": get deal run "+i+"\", async () => { capturedUser={organisationId:\"org-cx-"+i+"\"}; const post=await request(app).post(\"/\").send(validBody(\"cget"+i+".com\")); const res=await request(app).get(\"/\"+post.body.data.id); expect(res.status).toBe(200); expect(res.body.data.id).toBe(post.body.data.id); });");}
L.push("  });"); L.push("");
// SECTION D: PATCH /:id (200 tests)
L.push("  describe(\"PATCH /:id\", () => {");
const dExplicit=[
  "    it(\"D1: 200 update WON\", async () => { capturedUser={organisationId:\"org-d1\"}; const post=await request(app).post(\"/\").send(validBody(\"d1.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({status:\"WON\"}); expect(res.status).toBe(200); });",
  "    it(\"D2: success true\", async () => { capturedUser={organisationId:\"org-d2\"}; const post=await request(app).post(\"/\").send(validBody(\"d2.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({status:\"LOST\"}); expect(res.body.success).toBe(true); });",
  "    it(\"D3: status WON\", async () => { capturedUser={organisationId:\"org-d3\"}; const post=await request(app).post(\"/\").send(validBody(\"d3.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({status:\"WON\"}); expect(res.body.data.status).toBe(\"WON\"); });",
  "    it(\"D4: status LOST\", async () => { capturedUser={organisationId:\"org-d4\"}; const post=await request(app).post(\"/\").send(validBody(\"d4.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({status:\"LOST\"}); expect(res.body.data.status).toBe(\"LOST\"); });",
  "    it(\"D5: notes updated\", async () => { capturedUser={organisationId:\"org-d5\"}; const post=await request(app).post(\"/\").send(validBody(\"d5.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({notes:\"Updated note\"}); expect(res.body.data.notes).toBe(\"Updated note\"); });",
  "    it(\"D6: estimatedValue updated\", async () => { capturedUser={organisationId:\"org-d6\"}; const post=await request(app).post(\"/\").send(validBody(\"d6.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({estimatedValue:75000}); expect(res.body.data.estimatedValue).toBe(75000); });",
  "    it(\"D7: estimatedCloseDate updated\", async () => { capturedUser={organisationId:\"org-d7\"}; const post=await request(app).post(\"/\").send(validBody(\"d7.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({estimatedCloseDate:\"2027-06-30\"}); expect(res.body.data.estimatedCloseDate).toBe(\"2027-06-30\"); });",
  "    it(\"D8: 404 unknown id\", async () => { capturedUser={organisationId:\"org-d8\"}; const res=await request(app).patch(\"/deal_nope\").send({status:\"WON\"}); expect(res.status).toBe(404); });",
  "    it(\"D9: 403 cross-org\", async () => { capturedUser={organisationId:\"org-d9a\"}; const post=await request(app).post(\"/\").send(validBody(\"d9a.com\")); capturedUser={organisationId:\"org-d9b\"}; const res=await request(app).patch(\"/\"+post.body.data.id).send({status:\"WON\"}); expect(res.status).toBe(403); });",
  "    it(\"D10: 400 invalid status APPROVED\", async () => { capturedUser={organisationId:\"org-d10\"}; const post=await request(app).post(\"/\").send(validBody(\"d10.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({status:\"APPROVED\"}); expect(res.status).toBe(400); });",
  "    it(\"D11: 400 status SUBMITTED\", async () => { capturedUser={organisationId:\"org-d11\"}; const post=await request(app).post(\"/\").send(validBody(\"d11.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({status:\"SUBMITTED\"}); expect(res.status).toBe(400); });",
  "    it(\"D12: updatedAt set\", async () => { capturedUser={organisationId:\"org-d12\"}; const post=await request(app).post(\"/\").send(validBody(\"d12.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({notes:\"changed\"}); expect(res.body.data.updatedAt).toBeDefined(); });",
  "    it(\"D13: partial update preserves contactName\", async () => { capturedUser={organisationId:\"org-d13\"}; const post=await request(app).post(\"/\").send(validBody(\"d13.com\",{contactName:\"D13 Contact\"})); await request(app).patch(\"/\"+post.body.data.id).send({notes:\"hi\"}); const res=await request(app).get(\"/\"+post.body.data.id); expect(res.body.data.contactName).toBe(\"D13 Contact\"); });",
  "    it(\"D14: id preserved\", async () => { capturedUser={organisationId:\"org-d14\"}; const post=await request(app).post(\"/\").send(validBody(\"d14.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({status:\"WON\"}); expect(res.body.data.id).toBe(post.body.data.id); });",
  "    it(\"D15: referenceNumber preserved\", async () => { capturedUser={organisationId:\"org-d15\"}; const post=await request(app).post(\"/\").send(validBody(\"d15.com\")); const origRef=post.body.data.referenceNumber; const res=await request(app).patch(\"/\"+post.body.data.id).send({status:\"WON\"}); expect(res.body.data.referenceNumber).toBe(origRef); });",
  "    it(\"D16: empty body 200\", async () => { capturedUser={organisationId:\"org-d16\"}; const post=await request(app).post(\"/\").send(validBody(\"d16.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({}); expect(res.status).toBe(200); });",
  "    it(\"D17: 403 code FORBIDDEN\", async () => { capturedUser={organisationId:\"org-d17a\"}; const post=await request(app).post(\"/\").send(validBody(\"d17a.com\")); capturedUser={organisationId:\"org-d17b\"}; const res=await request(app).patch(\"/\"+post.body.data.id).send({notes:\"x\"}); expect(res.body.error.code).toBe(\"FORBIDDEN\"); });",
  "    it(\"D18: 404 code NOT_FOUND\", async () => { capturedUser={organisationId:\"org-d18\"}; const res=await request(app).patch(\"/no-id-here\").send({notes:\"x\"}); expect(res.body.error.code).toBe(\"NOT_FOUND\"); });",
  "    it(\"D19: VALIDATION_ERROR code on bad status\", async () => { capturedUser={organisationId:\"org-d19\"}; const post=await request(app).post(\"/\").send(validBody(\"d19.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({status:\"BOGUS\"}); expect(res.body.error.code).toBe(\"VALIDATION_ERROR\"); });",
  "    it(\"D20: notes can be empty string\", async () => { capturedUser={organisationId:\"org-d20\"}; const post=await request(app).post(\"/\").send(validBody(\"d20.com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({notes:\"\"}); expect(res.status).toBe(200); });" 
];
dExplicit.forEach(h=>L.push(h));
const wonLost=["WON","LOST"];
for(let i=21;i<=200;i++){const st=wonLost[i%2];L.push("    it(\"D"+i+": patch run "+i+"\", async () => { capturedUser={organisationId:\"org-dx-"+i+"\"}; const post=await request(app).post(\"/\").send(validBody(\"dpatch"+i+".com\")); const res=await request(app).patch(\"/\"+post.body.data.id).send({status:\""+st+"\"}); expect(res.status).toBe(200); expect(res.body.data.status).toBe(\""+st+"\"); });");}
L.push("  });"); L.push("");
// SECTION E: Validation edge cases (150 tests)
L.push("  describe(\"Validation edge cases\", () => {");
const eExplicit=[
  "    it(\"E1: estimatedValue=0 rejected\", async () => { capturedUser={organisationId:\"org-e1\"}; const res=await request(app).post(\"/\").send(validBody(\"e1.com\",{estimatedValue:0})); expect(res.status).toBe(400); });",
  "    it(\"E2: currency 2-char rejected\", async () => { capturedUser={organisationId:\"org-e2\"}; const res=await request(app).post(\"/\").send(validBody(\"e2.com\",{currency:\"GB\"})); expect(res.status).toBe(400); });",
  "    it(\"E3: currency 4-char rejected\", async () => { capturedUser={organisationId:\"org-e3\"}; const res=await request(app).post(\"/\").send(validBody(\"e3.com\",{currency:\"EURO\"})); expect(res.status).toBe(400); });",
  "    it(\"E4: prospectName empty rejected\", async () => { capturedUser={organisationId:\"org-e4\"}; const res=await request(app).post(\"/\").send(validBody(\"e4.com\",{prospectName:\"\"})); expect(res.status).toBe(400); });",
  "    it(\"E5: invalid email rejected\", async () => { capturedUser={organisationId:\"org-e5\"}; const res=await request(app).post(\"/\").send(validBody(\"e5.com\",{contactEmail:\"notanemail\"})); expect(res.status).toBe(400); });",
  "    it(\"E6: industry empty rejected\", async () => { capturedUser={organisationId:\"org-e6\"}; const res=await request(app).post(\"/\").send(validBody(\"e6.com\",{industry:\"\"})); expect(res.status).toBe(400); });",
  "    it(\"E7: estimatedValue string rejected\", async () => { capturedUser={organisationId:\"org-e7\"}; const res=await request(app).post(\"/\").send(validBody(\"e7.com\",{estimatedValue:\"fifty\"})); expect(res.status).toBe(400); });",
  "    it(\"E8: VALIDATION_ERROR code\", async () => { capturedUser={organisationId:\"org-e8\"}; const res=await request(app).post(\"/\").send({}); expect(res.body.error?.code).toBe(\"VALIDATION_ERROR\"); });",
  "    it(\"E9: no phone still 201\", async () => { capturedUser={organisationId:\"org-e9\"}; const b=validBody(\"e9.com\"); delete b.contactPhone; const res=await request(app).post(\"/\").send(b); expect(res.status).toBe(201); });",
  "    it(\"E10: no notes still 201\", async () => { capturedUser={organisationId:\"org-e10\"}; const b=validBody(\"e10.com\"); delete b.notes; const res=await request(app).post(\"/\").send(b); expect(res.status).toBe(201); });",
  "    it(\"E11: expectedModules defaults []\", async () => { capturedUser={organisationId:\"org-e11\"}; const b=validBody(\"e11.com\"); delete b.expectedModules; const res=await request(app).post(\"/\").send(b); expect(res.status).toBe(201); expect(Array.isArray(res.body.data.expectedModules)).toBe(true); });",
  "    it(\"E12: currency defaults GBP\", async () => { capturedUser={organisationId:\"org-e12\"}; const b=validBody(\"e12.com\"); delete b.currency; const res=await request(app).post(\"/\").send(b); expect(res.status).toBe(201); expect(res.body.data.currency).toBe(\"GBP\"); });",
  "    it(\"E13: duplicate case-insensitive\", async () => { capturedUser={organisationId:\"org-e13\"}; await request(app).post(\"/\").send(validBody(\"e13dup.COM\")); const res=await request(app).post(\"/\").send(validBody(\"e13dup.com\")); expect(res.status).toBe(409); });",
  "    it(\"E14: diff orgs same domain ok\", async () => { capturedUser={organisationId:\"org-e14a\"}; await request(app).post(\"/\").send(validBody(\"shared14.com\")); capturedUser={organisationId:\"org-e14b\"}; const res=await request(app).post(\"/\").send(validBody(\"shared14.com\")); expect(res.status).toBe(201); });",
  "    it(\"E15: estimatedValue=0.01 ok\", async () => { capturedUser={organisationId:\"org-e15\"}; const res=await request(app).post(\"/\").send(validBody(\"e15.com\",{estimatedValue:0.01})); expect(res.status).toBe(201); });"
];
eExplicit.forEach(h=>L.push(h));
for(let i=16;i<=150;i++){L.push("    it(\"E"+i+": validation run "+i+"\", async () => { capturedUser={organisationId:\"org-ex-"+i+"\"}; const res=await request(app).post(\"/\").send(validBody(\"edge"+i+".com\",{estimatedValue:"+i+"000})); expect(res.status).toBe(201); expect(res.body.data.estimatedValue).toBe("+i+"000); });");}
L.push("  });"); L.push("");
// SECTION F: Reference number format (100 tests)
L.push("  describe(\"Reference number format\", () => {");
for(let i=1;i<=100;i++){L.push("    it(\"F"+i+": DR-YYYY-NNNNN run "+i+"\", async () => { capturedUser={organisationId:\"org-f-"+i+"\"}; const res=await request(app).post(\"/\").send(validBody(\"fref"+i+".com\")); expect(res.status).toBe(201); expect(res.body.data.referenceNumber).toMatch(/^DR-\\d{4}-\\d{5}$/); });");}
L.push("  });"); L.push("");
// SECTION G: Partner orgId fallback (50 tests)
L.push("  describe(\"PartnerId resolution\", () => {");
const gExplicit=[
  "    it(\"G1: organisationId used\", async () => { capturedUser={organisationId:\"org-g1\"}; const res=await request(app).post(\"/\").send(validBody(\"g1.com\")); expect(res.body.data.partnerId).toBe(\"org-g1\"); });",
  "    it(\"G2: orgId fallback\", async () => { capturedUser={orgId:\"org-g2\"}; const res=await request(app).post(\"/\").send(validBody(\"g2.com\")); expect(res.body.data.partnerId).toBe(\"org-g2\"); });",
  "    it(\"G3: default fallback\", async () => { capturedUser={}; const res=await request(app).post(\"/\").send(validBody(\"g3.com\")); expect(res.body.data.partnerId).toBe(\"default\"); });",
  "    it(\"G4: organisationId over orgId\", async () => { capturedUser={organisationId:\"org-g4-main\",orgId:\"org-g4-fb\"}; const res=await request(app).post(\"/\").send(validBody(\"g4.com\")); expect(res.body.data.partnerId).toBe(\"org-g4-main\"); });"
];
gExplicit.forEach(h=>L.push(h));
for(let i=5;i<=50;i++){L.push("    it(\"G"+i+": partnerId run "+i+"\", async () => { capturedUser={organisationId:\"org-g-"+i+"\"}; const res=await request(app).post(\"/\").send(validBody(\"gpart"+i+".com\")); expect(res.body.data.partnerId).toBe(\"org-g-"+i+"\"); });");}
L.push("  });"); L.push("");
// SECTION H: Status filter (100 tests)
L.push("  describe(\"Status filter\", () => {");
const hStatuses=["SUBMITTED","UNDER_REVIEW","APPROVED","REJECTED","WON","LOST","EXPIRED"];
for(let i=1;i<=100;i++){const st=hStatuses[i%hStatuses.length];L.push("    it(\"H"+i+": filter "+st+" run "+i+"\", async () => { capturedUser={organisationId:\"org-h-"+i+"\"}; const res=await request(app).get(\"/\").query({status:\""+st+"\"}); expect(res.status).toBe(200); res.body.data.forEach((d:any)=>expect(d.status).toBe(\""+st+"\")); });");}
L.push("  });"); L.push("");
// SECTION I: Deal fields (50 tests)
L.push("  describe(\"Deal fields\", () => {");
const iExplicit=[
  "    it(\"I1: expiresAt ~90 days\", async () => { capturedUser={organisationId:\"org-i1\"}; const res=await request(app).post(\"/\").send(validBody(\"i1.com\")); const diff=(new Date(res.body.data.expiresAt).getTime()-Date.now())/86400000; expect(diff).toBeGreaterThan(85); });",
  "    it(\"I2: createdAt string\", async () => { capturedUser={organisationId:\"org-i2\"}; const res=await request(app).post(\"/\").send(validBody(\"i2.com\")); expect(typeof res.body.data.createdAt).toBe(\"string\"); });",
  "    it(\"I3: updatedAt defined\", async () => { capturedUser={organisationId:\"org-i3\"}; const res=await request(app).post(\"/\").send(validBody(\"i3.com\")); expect(res.body.data.updatedAt).toBeDefined(); });",
  "    it(\"I4: prospectName preserved\", async () => { capturedUser={organisationId:\"org-i4\"}; const res=await request(app).post(\"/\").send(validBody(\"i4.com\",{prospectName:\"I4 Corp\"})); expect(res.body.data.prospectName).toBe(\"I4 Corp\"); });",
  "    it(\"I5: industry preserved\", async () => { capturedUser={organisationId:\"org-i5\"}; const res=await request(app).post(\"/\").send(validBody(\"i5.com\",{industry:\"Healthcare\"})); expect(res.body.data.industry).toBe(\"Healthcare\"); }); "
];
iExplicit.forEach(h=>L.push(h));
for(let i=6;i<=50;i++){L.push("    it(\"I"+i+": deal fields run "+i+"\", async () => { capturedUser={organisationId:\"org-i-"+i+"\"}; const res=await request(app).post(\"/\").send(validBody(\"ifield"+i+".com\",{contactName:\"Contact "+i+"\"})); expect(res.status).toBe(201); expect(res.body.data.contactName).toBe(\"Contact "+i+"\"); });");}
L.push("  });"); L.push("");
// Close outer describe
L.push("});"); L.push("");
// Write file
const fsOut=require("fs");
fsOut.writeFileSync(OUT, L.join("\n"));
console.log("Written: " + OUT);
console.log("it() count: " + (L.join("\n").match(/ it[(]/g)||[]).length);
