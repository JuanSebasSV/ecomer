// backend/routes/checkout.routes.js
import express from "express";
import { 
  procesarCheckout,
  obtenerOrden,
  listarOrdenesUsuario,
  listarTodasOrdenes,
  actualizarEstadoOrden
} from "../controllers/checkout.controller.js";

const router = express.Router();

//  RUTAS PÚBLICAS

// Procesar una nueva orden (POST)
router.post("/", procesarCheckout);

// Obtener detalles de una orden específica (GET)
router.get("/order/:orderId", obtenerOrden);

// Listar todas las órdenes de un usuario (GET)
router.get("/user/:usuarioId", listarOrdenesUsuario);

// =====================================================
//  RUTAS DE ADMINISTRACIÓN
// =====================================================

// Listar todas las órdenes (admin) - con paginación y filtros
router.get("/admin/orders", listarTodasOrdenes);

// Actualizar estado de una orden (PATCH)
router.patch("/order/:orderId/status", actualizarEstadoOrden);

export default router;