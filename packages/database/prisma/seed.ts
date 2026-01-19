import { PrismaClient, UserRole, BuildingRole, ZoneType, DeviceType, DeviceStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bms.local' },
    update: {},
    create: {
      email: 'admin@bms.local',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create demo building
  const building = await prisma.building.upsert({
    where: { id: 'demo-building-1' },
    update: {},
    create: {
      id: 'demo-building-1',
      name: 'Demo Office Building',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      latitude: 37.7749,
      longitude: -122.4194,
      totalArea: 50000,
      floors: 5,
      yearBuilt: 2020,
    },
  });

  console.log('✅ Created building:', building.name);

  // Assign admin to building
  await prisma.buildingUser.upsert({
    where: {
      buildingId_userId: {
        buildingId: building.id,
        userId: adminUser.id,
      },
    },
    update: {},
    create: {
      buildingId: building.id,
      userId: adminUser.id,
      role: BuildingRole.OWNER,
    },
  });

  // Create zones
  const zones = await Promise.all([
    prisma.zone.upsert({
      where: { id: 'zone-lobby' },
      update: {},
      create: {
        id: 'zone-lobby',
        buildingId: building.id,
        name: 'Main Lobby',
        floor: 1,
        type: ZoneType.LOBBY,
        area: 2000,
        capacity: 50,
      },
    }),
    prisma.zone.upsert({
      where: { id: 'zone-office-1' },
      update: {},
      create: {
        id: 'zone-office-1',
        buildingId: building.id,
        name: 'Open Office - Floor 2',
        floor: 2,
        type: ZoneType.OFFICE,
        area: 8000,
        capacity: 100,
      },
    }),
    prisma.zone.upsert({
      where: { id: 'zone-conference' },
      update: {},
      create: {
        id: 'zone-conference',
        buildingId: building.id,
        name: 'Conference Room A',
        floor: 2,
        type: ZoneType.CONFERENCE,
        area: 500,
        capacity: 20,
      },
    }),
    prisma.zone.upsert({
      where: { id: 'zone-server' },
      update: {},
      create: {
        id: 'zone-server',
        buildingId: building.id,
        name: 'Server Room',
        floor: 1,
        type: ZoneType.SERVER_ROOM,
        area: 300,
        capacity: 5,
      },
    }),
  ]);

  console.log('✅ Created zones:', zones.length);

  // Create devices
  const devices = await Promise.all([
    prisma.device.upsert({
      where: { serialNumber: 'HVAC-001' },
      update: {},
      create: {
        buildingId: building.id,
        zoneId: zones[1].id, // Office
        name: 'Main HVAC Unit',
        type: DeviceType.HVAC,
        manufacturer: 'Carrier',
        model: 'WeatherExpert 5000',
        serialNumber: 'HVAC-001',
        status: DeviceStatus.ONLINE,
        lastSeen: new Date(),
      },
    }),
    prisma.device.upsert({
      where: { serialNumber: 'THERM-001' },
      update: {},
      create: {
        buildingId: building.id,
        zoneId: zones[1].id, // Office
        name: 'Office Thermostat',
        type: DeviceType.THERMOSTAT,
        manufacturer: 'Nest',
        model: 'Learning Thermostat',
        serialNumber: 'THERM-001',
        status: DeviceStatus.ONLINE,
        lastSeen: new Date(),
      },
    }),
    prisma.device.upsert({
      where: { serialNumber: 'LIGHT-001' },
      update: {},
      create: {
        buildingId: building.id,
        zoneId: zones[0].id, // Lobby
        name: 'Lobby Lighting',
        type: DeviceType.LIGHTING,
        manufacturer: 'Philips',
        model: 'Hue Commercial',
        serialNumber: 'LIGHT-001',
        status: DeviceStatus.ONLINE,
        lastSeen: new Date(),
      },
    }),
    prisma.device.upsert({
      where: { serialNumber: 'AQ-001' },
      update: {},
      create: {
        buildingId: building.id,
        zoneId: zones[3].id, // Server Room
        name: 'Server Room Air Quality',
        type: DeviceType.AIR_QUALITY,
        manufacturer: 'Awair',
        model: 'Omni',
        serialNumber: 'AQ-001',
        status: DeviceStatus.ONLINE,
        lastSeen: new Date(),
      },
    }),
    prisma.device.upsert({
      where: { serialNumber: 'METER-001' },
      update: {},
      create: {
        buildingId: building.id,
        name: 'Main Energy Meter',
        type: DeviceType.ENERGY_METER,
        manufacturer: 'Schneider',
        model: 'PowerLogic PM8000',
        serialNumber: 'METER-001',
        status: DeviceStatus.ONLINE,
        lastSeen: new Date(),
      },
    }),
  ]);

  console.log('✅ Created devices:', devices.length);

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
