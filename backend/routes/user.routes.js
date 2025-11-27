// backend/routes/user.routes.js
import express from "express";
import { 
  registrarUsuario, 
  listarUsuarios, 
  obtenerUsuario, 
  actualizarUsuario,
  cambiarPassword,
  recuperarPassword  // <-- AGREGAR ESTA IMPORTACIÓN
} from "../controllers/user.controller.js";

const router = express.Router();

// Rutas existentes
router.post("/register", registrarUsuario);
router.get("/", listarUsuarios);
router.get("/:id", obtenerUsuario);
router.patch("/:id", actualizarUsuario);

// NUEVAS RUTAS
router.post("/:id/change-password", cambiarPassword);
router.post("/recover-password", recuperarPassword);

export default router;