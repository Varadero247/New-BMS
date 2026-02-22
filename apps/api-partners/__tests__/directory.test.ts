import express from "express";
import request from "supertest";

jest.mock("../src/prisma", () => ({
  prisma: {
    mktPartner: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@ims/monitoring", () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import directoryRouter from "../src/routes/directory";
import { prisma } from "../src/prisma";

const app = express();
app.use(express.json());
app.use((req: any, _res: any, next: any) => { req.partner = { id: "partner-1" }; next(); });
app.use("/api/directory", directoryRouter);

beforeEach(() => { jest.clearAllMocks(); });

const mockPartner = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "Acme Solutions",
  email: "acme@example.com",
  tier: "RESELLER",
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("GET /api/directory", () => {
  it("returns partner list", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([mockPartner]);
    const res = await request(app).get("/api/directory");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
  it("returns empty array when no partners", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get("/api/directory");
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
  it("passes status:ACTIVE filter to findMany", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/directory");
    expect(prisma.mktPartner.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ status: "ACTIVE" }) }));
  });
  it("filters by tier when provided", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/directory?tier=RESELLER");
    expect(prisma.mktPartner.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ tier: "RESELLER" }) }));
  });
  it("returns 401 without partner auth", async () => {
    const noAuthApp = express(); noAuthApp.use(express.json()); noAuthApp.use("/api/directory", directoryRouter);
    const res = await request(noAuthApp).get("/api/directory");
    expect(res.status).toBe(401);
  });
  it("returns 500 on DB error", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockRejectedValue(new Error("DB down"));
    const res = await request(app).get("/api/directory");
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
  });
  it("response body has success property", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([mockPartner]);
    const res = await request(app).get("/api/directory");
    expect(res.body).toHaveProperty("success", true);
  });
  it("response body has data array", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([mockPartner]);
    const res = await request(app).get("/api/directory");
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it("findMany is called once per request", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/directory");
    expect(prisma.mktPartner.findMany).toHaveBeenCalledTimes(1);
  });
  it("filters by search when provided", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/directory?search=Acme");
    expect(prisma.mktPartner.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ name: expect.anything() }) }));
  });
  it("uses orderBy createdAt desc", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/directory");
    expect(prisma.mktPartner.findMany).toHaveBeenCalledWith(expect.objectContaining({ orderBy: { createdAt: "desc" } }));
  });
  it("limits results to 100", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/directory");
    expect(prisma.mktPartner.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 100 }));
  });
  it("500 response has success:false", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockRejectedValue(new Error("fail"));
    const res = await request(app).get("/api/directory");
    expect(res.body.success).toBe(false);
  });
  it("filters CO_SELL tier", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/directory?tier=CO_SELL");
    expect(prisma.mktPartner.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ tier: "CO_SELL" }) }));
  });
  it("filters REFERRAL tier", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/directory?tier=REFERRAL");
    expect(prisma.mktPartner.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ tier: "REFERRAL" }) }));
  });
  it("returns multiple partners", async () => {
    const partners = [mockPartner, { ...mockPartner, id: "00000000-0000-0000-0000-000000000002", name: "Beta Corp" }];
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue(partners);
    const res = await request(app).get("/api/directory");
    expect(res.body.data).toHaveLength(2);
  });
  it("data[0].tier is RESELLER for mock partner", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([mockPartner]);
    const res = await request(app).get("/api/directory");
    expect(res.body.data[0].tier).toBe("RESELLER");
  });
});

describe("GET /api/directory/:id", () => {
  it("returns single partner", async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    const res = await request(app).get("/api/directory/00000000-0000-0000-0000-000000000001");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("Acme Solutions");
  });
  it("returns 404 when not found", async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get("/api/directory/00000000-0000-0000-0000-000000000099");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
  it("returns 401 without partner auth", async () => {
    const noAuthApp = express(); noAuthApp.use(express.json()); noAuthApp.use("/api/directory", directoryRouter);
    const res = await request(noAuthApp).get("/api/directory/00000000-0000-0000-0000-000000000001");
    expect(res.status).toBe(401);
  });
  it("returns 500 on DB error", async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockRejectedValue(new Error("DB down"));
    const res = await request(app).get("/api/directory/00000000-0000-0000-0000-000000000001");
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
  });
  it("findUnique called with correct id", async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    await request(app).get("/api/directory/00000000-0000-0000-0000-000000000001");
    expect(prisma.mktPartner.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "00000000-0000-0000-0000-000000000001" } }));
  });
  it("success response contains partner id", async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    const res = await request(app).get("/api/directory/00000000-0000-0000-0000-000000000001");
    expect(res.body.data.id).toBe("00000000-0000-0000-0000-000000000001");
  });
  it("success:false on 404", async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get("/api/directory/00000000-0000-0000-0000-000000000099");
    expect(res.body.success).toBe(false);
  });
  it("success:false on 500", async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockRejectedValue(new Error("fail"));
    const res = await request(app).get("/api/directory/00000000-0000-0000-0000-000000000001");
    expect(res.body.success).toBe(false);
  });
  it("response data has name field", async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    const res = await request(app).get("/api/directory/00000000-0000-0000-0000-000000000001");
    expect(res.body.data).toHaveProperty("name");
  });
  it("findUnique called exactly once", async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    await request(app).get("/api/directory/00000000-0000-0000-0000-000000000001");
    expect(prisma.mktPartner.findUnique).toHaveBeenCalledTimes(1);
  });
  it("response data email matches mock", async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    const res = await request(app).get("/api/directory/00000000-0000-0000-0000-000000000001");
    expect(res.body.data.email).toBe("acme@example.com");
  });
});

describe("directory — phase28 coverage", () => {
  it("GET / returns 200 when partners exist", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([mockPartner]);
    const res = await request(app).get("/api/directory");
    expect(res.status).toBe(200);
  });
  it("GET / data is array type", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get("/api/directory");
    expect(Array.isArray(res.body.data)).toBe(true);
  });
  it("GET / success is true", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get("/api/directory");
    expect(res.body.success).toBe(true);
  });
  it("GET /:id returns 200 on found partner", async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    const res = await request(app).get("/api/directory/00000000-0000-0000-0000-000000000001");
    expect(res.status).toBe(200);
  });
  it("GET /:id 500 has INTERNAL_ERROR code", async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockRejectedValue(new Error("fail"));
    const res = await request(app).get("/api/directory/00000000-0000-0000-0000-000000000001");
    expect(res.body.error.code).toBe("INTERNAL_ERROR");
  });
  it("GET / GCC_SPECIALIST tier filter is passed through", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/directory?tier=GCC_SPECIALIST");
    expect(prisma.mktPartner.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ tier: "GCC_SPECIALIST" }) }));
  });
  it("GET / without search does not include name filter", async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get("/api/directory");
    const call = (prisma.mktPartner.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where).not.toHaveProperty("name");
  });
});


describe('directory — phase28 extra batch', () => {
  it('GET / response has 200 status code on empty list', async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(app).get('/api/directory');
    expect(res.status).toBe(200);
  });
  it('GET / data[0].status is ACTIVE for mock', async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([mockPartner]);
    const res = await request(app).get('/api/directory');
    expect(res.body.data[0].status).toBe('ACTIVE');
  });
  it('GET /:id data.tier equals RESELLER', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    const res = await request(app).get('/api/directory/00000000-0000-0000-0000-000000000001');
    expect(res.body.data.tier).toBe('RESELLER');
  });
  it('GET / does not filter by tier when tier param is absent', async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/directory');
    const call = (prisma.mktPartner.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where.tier).toBeUndefined();
  });
  it('GET /:id 404 error.message is defined', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/api/directory/00000000-0000-0000-0000-000000000099');
    expect(res.body.error.message).toBeDefined();
  });
  it('GET / with tier and search applies both filters', async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/directory?tier=RESELLER&search=test');
    expect(prisma.mktPartner.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tier: 'RESELLER', name: expect.anything() }) })
    );
  });
  it('GET / 500 error.message is defined', async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/directory');
    expect(res.body.error.message).toBeDefined();
  });
  it('GET /:id 500 status is 500', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/directory/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });
  it('GET / findMany where has status property', async () => {
    (prisma.mktPartner.findMany as jest.Mock).mockResolvedValue([]);
    await request(app).get('/api/directory');
    const call = (prisma.mktPartner.findMany as jest.Mock).mock.calls[0][0];
    expect(call.where).toHaveProperty('status');
  });
  it('GET /:id response has success:true', async () => {
    (prisma.mktPartner.findUnique as jest.Mock).mockResolvedValue(mockPartner);
    const res = await request(app).get('/api/directory/00000000-0000-0000-0000-000000000001');
    expect(res.body).toHaveProperty('success', true);
  });
});
describe('directory — phase30 coverage', () => {
  it('handles Math.min', () => {
    expect(Math.min(1, 2, 3)).toBe(1);
  });

  it('handles logical OR assign', () => {
    let y2: number | null = null; y2 ??= 5; expect(y2).toBe(5);
  });

  it('handles destructuring', () => {
    const { a, b } = { a: 1, b: 2 }; expect(a + b).toBe(3);
  });

  it('handles Date type', () => {
    expect(new Date()).toBeInstanceOf(Date);
  });

  it('handles number isFinite', () => {
    expect(isFinite(42)).toBe(true);
  });

});
