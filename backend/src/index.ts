import { Hono } from "hono";
import { prisma } from "../config/db";
import { cors } from "hono/cors";
const app = new Hono();
app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["POST", "GET", "OPTIONS"],
    maxAge: 600,
  })
);
app.get("/", (c) => {
  return c.json({
    message: "Health route is Working !",
    success: true,
  });
});
app.get("/getdata", async (c) => {
  try {
    const query = c.req.query();
    let startTime = performance.now();

    const db = prisma(c);
    let dbConnected = performance.now();
    const { title } = query;
    if (!query || !title) {
      return c.json({
        message: "No title provided",
        success: false,
      });
    }
    let roomData = await db.object.findUnique({
      where: {
        title: title,
      },
    });
    let findTime = performance.now();
    if (roomData) {
      return c.json({
        message: "Already in database",
        roomData,
        success: true,
        time: {
          total: findTime - startTime,
          dbConnected: dbConnected - startTime,
          findTime: findTime - dbConnected,
        },
      });
    }
    roomData = await db.object.create({
      data: {
        title: title,
        description: "",
      },
    });
    let endTime = performance.now();
    return c.json({
      message: "New Room Created",
      roomData,
      success: true,
      time: {
        total: endTime - startTime,
        dbConnected: dbConnected - startTime,
        findTime: findTime - dbConnected,
        updateTime: endTime - findTime,
      },
    });
  } catch (error: any) {
    console.log("Something went wrong");
    return c.json({
      success: false,
      mesage: error.message,
    });
  }
});

app.post("/postdata", async (c) => {
  try {
    const body = await c.req.formData();
    const title = body.get("title") as string;
    const description = body.get("description") as string;
    console.log({ title, description });
    if (!title || typeof description === "undefined") {
      c.status(400);
      return c.json({ success: false, message: "No Inputs provided" });
    }

    let startTime = performance.now();

    const db = prisma(c);

    let dbConnected = performance.now();

    const object = await db.object.update({
      where: {
        title,
      },
      data: {
        description,
      },
    });

    let endTime = performance.now();

    if (!object) {
      c.status(400);
      return c.json({
        success: false,
        message: "No object found with the specific title",
      });
    }
    return c.json({
      message: "Object Found",
      success: true,
      data: object,
      time: {
        total: endTime - startTime,
        dbConnected: dbConnected - startTime,
        updateTime: endTime - dbConnected,
      },
    });
  } catch (error: any) {
    c.status(500);
    return c.json({
      message: error.message,
      success: false,
    });
  }
});

export default app;
