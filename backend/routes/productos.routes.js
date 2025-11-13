import express from "express";
import { crearProductos, listarProductos, crearProductosBulk } from "../controllers/productos.controller.js";

const router = express.Router();

router.post("/", crearProductos);
router.post("/bulk", crearProductosBulk);
router.get("/", listarProductos);

export default router;
    