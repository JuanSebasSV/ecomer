import express from "express";
import { loginusuario } from "../controllers/login.controller.js";

const router = express.Router();

// Ruta de login (POST)
router.post("/", loginusuario);

export default router;
