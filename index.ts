#!/usr/bin/env bun

// import './src/cli';
import { Elysia } from "elysia";
import router from "./src/routes/website.routes";
import { config } from "./src/config/env";
import { connectDB } from "./src/config/db";

const app = new Elysia();

app.use(router);
app.listen({
    port: config.PORT,
    idleTimeout: 30  
  }, () => {
    console.log(`Server is running on http://localhost:${config.PORT}`);
  });
  