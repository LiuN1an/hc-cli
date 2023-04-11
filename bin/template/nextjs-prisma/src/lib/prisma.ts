import { PrismaClient } from "@prisma/client/edge";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "development") {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
} else {
  prisma = new PrismaClient();
}

export default prisma;
