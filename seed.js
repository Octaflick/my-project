require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const crypto = require("crypto");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Helper to create a secure password hash using built-in crypto
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const users = [
  {
    email: "alice.johnson@example.com",
    name: "Alice Johnson",
    password: hashPassword("alicePassword123"),
  },
  {
    email: "bob.smith@example.com",
    name: "Bob Smith",
    password: hashPassword("bobSecurePass456"),
  },
  {
    email: "carol.williams@example.com",
    name: null, // optional field
    password: hashPassword("carolSecret789"),
  },
];

async function main() {
  console.log("🌱 Starting database seeding...");

  for (const user of users) {
    const upsertedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`Created/Ensured user: ${upsertedUser.email} (ID: ${upsertedUser.id})`);
  }

  console.log("✅ Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
