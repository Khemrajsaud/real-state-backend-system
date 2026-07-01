// import "dotenv/config";
// import { defineConfig } from "prisma/config";
// import { PrismaPg } from "@prisma/adapter-pg";
// import pg from "pg";

// export default defineConfig({
//   schema: "prisma/schema.prisma",
//   migrations: {
//     path: "prisma/migrations",
//   },
//   datasource: {
//     adapter: () => {
//       const pool = new pg.Pool({
//         connectionString: process.env.DATABASE_URL,
//       });
//       return new PrismaPg(pool);
//     },
//   },
// });




import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // For Supabase, pass the DIRECT_URL here so the CLI can run migrations
    url: env("DIRECT_URL"), 
  },
});