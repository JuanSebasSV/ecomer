import express from "express";
import { crearProductos, listarProductos} from "../controllers/productos.controller.js";

const router = express.Router();

router.post("/", crearProductos);
router.get("/", listarProductos);

export default router;
