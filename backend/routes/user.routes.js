// backend/routes/user.routes.js
import express from "express";
import { 
  registrarUsuario, 
  listarUsuarios, 
  obtenerUsuario, 
  actualizarUsuario,
  cambiarPassword,
  recuperarPassword,
  verificarCodigo,      // ✅ NUEVA
  verificarToken,
  restablecerPassword
} from "../controllers/user.controller.js";

const router = express.Router();

// Rutas existentes
router.post("/register", registrarUsuario);
router.get("/", listarUsuarios);
router.get("/:id", obtenerUsuario);
router.patch("/:id", actualizarUsuario);

// Rutas de contraseña
router.post("/:id/change-password", cambiarPassword);
router.post("/recover-password", recuperarPassword);
router.post("/verify-code", verificarCodigo);        // ✅ NUEVA RUTA
router.get("/verify-token/:token", verificarToken);
router.post("/reset-password", restablecerPassword);

export default router;