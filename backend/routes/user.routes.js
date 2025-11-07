import express from "express";
import Usuario from "../models/user.js";

const router = express.Router();

// Crear un usuario
router.post("/", async (req, res) => {
  try {
    const { userId, nombre, correo, password } = req.body;

    // Validación de campos obligatorios
    if (!userId || !nombre || !correo || !password) {
      return res.status(400).json({ message: "❎ Faltan datos obligatorios del usuario" });
    }

    // Validar si ya existe el usuario por correo o userId
    const usuarioExistente = await Usuario.findOne({
      $or: [{ correo }, { userId }]
    });

    if (usuarioExistente) {
      return res.status(400).json({
        message: "⚠️ El usuario ya existe con ese correo o ID"
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      userId,
      nombre,
      correo,
      password,
    });

    await nuevoUsuario.save();

    res.status(201).json({
      message: "✅ Usuario creado con éxito",
      data: nuevoUsuario,
    });
  } catch (error) {
    console.error("❎ Error al crear usuario:", error);
    res.status(500).json({
      message: "❎ Error al crear usuario",
      error: error.message,
    });
  }
});

// Listar todos los usuarios
router.get("/", async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (error) {
    console.error("❎ Error al obtener usuarios:", error);
    res.status(500).json({ message: "❎ Error al obtener los usuarios" });
  }
});

export default router;
