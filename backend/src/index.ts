import { Hono } from "hono";
import { prisma } from "../config/db";
const app = new Hono();
app.get("/", (c) => {
  return c.json({
    message: "Health route is Working !",
    success: true,
  });
});
app.get("/getdata", async (c) => {
  try {
    const query = c.req.query();
    const db = prisma(c);
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
    if (roomData) {
      return c.json({
        message: "Already in database",
        roomData,
        success: true,
      });
    }
    roomData = await db.object.create({
      data: {
        title: title,
        description: "",
      },
    });
    return c.json({ message: "New Room Created", roomData, success: true });
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
    const db = prisma(c);
    const object = await db.object.update({
      where: {
        title,
      },
      data: {
        description,
      },
    });
    console.log(object);
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
