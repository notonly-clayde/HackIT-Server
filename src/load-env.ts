import dotenv from "dotenv"

// Must run before any module reads process.env (e.g. prisma.client). Side-effect entry import only.
dotenv.config({ override: process.env.NODE_ENV !== "production" })
