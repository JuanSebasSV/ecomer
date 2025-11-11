import express from "express";
import { registrarUsuario, listarUsuarios } from "../controllers/user.controller.js";

const router = express.Router();

// Rutas
router.post("/register", registrarUsuario);
router.get("/", listarUsuarios);

export default router;
