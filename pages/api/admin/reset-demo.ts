// pages/api/admin/reset-demo.ts (Next.js Pages Router)
import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db"; // tu conector
import { Project } from "@/models/Project";
import { ProjectActivity } from "@/models/ProjectActivity";
import { ProjectEmail } from "@/models/ProjectEmail";
import { Task } from "@/models/Task";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  // 🔒 Autorización básica (ajusta a tu sistema de auth)
  // const authHeader = req.headers.authorization || "";
  // const isAdmin = authHeader === `Bearer ${process.env.ADMIN_RESET_TOKEN}`;
  // if (!isAdmin) return res.status(401).json({ ok: false, error: "Unauthorized" });
//const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fvoltadmin?replicaSet=rs0';
  // 🧯 Entorno controlado
  // if (process.env.NEXT_PUBLIC_SYSTEM !== "demo") {
  //   return res.status(403).json({ ok: false, error: "Reset only allowed in demo environment" });
  // }

  const { confirm, dryRun = false } = req.body || {};
  // console.log('en API reset-demo confirm, dryRun',confirm, dryRun)
  if (confirm !== "BORRAR") {
    return res.status(400).json({ ok: false, error: "Missing or invalid confirm. Use 'BORRAR'." });
  }

  await connectDB();
  const db = mongoose.connection.db;
  if (!db){
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
  // Filtros EXACTOS que usas hoy
  const filters = {
    project:         { idProject: { $gt: 33 } },
    projectActivity: { idProject: { $gt: 33 } },
    projectEmail:    { idProject: { $gt: 30 } },
    task:            { idTask:    { $gt: 1732 } },
    uploads_files:   {},  // borrar todo
    uploads_chunks:  {},  // borrar todo
  };

  // Pre-cuenta (útil para confirmar y para dryRun)
  const countsBefore = {
    project:         await db.collection("project").countDocuments(filters.project),
    projectActivity: await db.collection("projectActivity").countDocuments(filters.projectActivity),
    projectEmail:    await db.collection("projectEmail").countDocuments(filters.projectEmail),
    task:            await db.collection("task").countDocuments(filters.task),
    uploads_files:   await db.collection("uploads.files").countDocuments(filters.uploads_files),
    uploads_chunks:  await db.collection("uploads.chunks").countDocuments(filters.uploads_chunks),
  };

  if (dryRun) {
    return res.json({ ok: true, dryRun: true, countsBefore });
  }

  // ⚙️ Si tienes réplica, puedes usar transacción. Si no, hacemos secuencial.
  const session = (await mongoose.startSession());
  try {
    // Intenta transacción, pero haz fallback si falla por standalone
    await session.withTransaction(async () => {
      await db.collection("project").deleteMany(filters.project, { session });
      await db.collection("projectActivity").deleteMany(filters.projectActivity, { session });
      await db.collection("projectEmail").deleteMany(filters.projectEmail, { session });
      await db.collection("task").deleteMany(filters.task, { session });

      // GridFS: borra todo (primero chunks es opcional; borraremos ambos)
      await db.collection("uploads.chunks").deleteMany(filters.uploads_chunks, { session });
      await db.collection("uploads.files").deleteMany(filters.uploads_files, { session });
    });

    // Conteo posterior (opcional)
    const countsAfter = {
      project:         await db.collection("project").countDocuments(filters.project),
      projectActivity: await db.collection("projectActivity").countDocuments(filters.projectActivity),
      projectEmail:    await db.collection("projectEmail").countDocuments(filters.projectEmail),
      task:            await db.collection("task").countDocuments(filters.task),
      uploads_files:   await db.collection("uploads.files").countDocuments(filters.uploads_files),
      uploads_chunks:  await db.collection("uploads.chunks").countDocuments(filters.uploads_chunks),
    };

    res.json({ ok: true, countsBefore, countsAfter });
  } catch (error: any) {
    // Si la transacción falla por no tener réplica, hacemos fallback sin sesión
    try {
      await db.collection("project").deleteMany(filters.project);
      await db.collection("projectActivity").deleteMany(filters.projectActivity);
      await db.collection("projectEmail").deleteMany(filters.projectEmail);
      await db.collection("task").deleteMany(filters.task);
      await db.collection("uploads.chunks").deleteMany(filters.uploads_chunks);
      await db.collection("uploads.files").deleteMany(filters.uploads_files);

      res.json({ ok: true, countsBefore, fallbackNoTransaction: true });
    } catch (e2: any) {
      res.status(500).json({ ok: false, error: e2?.message || "Cleanup failed (fallback)" });
    }
  } finally {
    session.endSession();
  }
}
