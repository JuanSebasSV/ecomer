import Usuario from "../models/user.js"
import bcrypt from "bcrypt"

export const registrarUsuario = async (req, res) => {
  try {
    const { userId, nombre, apellido, telefono, correo, password } = req.body

    if (!userId || !nombre || !apellido || !telefono || !correo || !password) {
      return res.status(400).json({ message: "Faltan datos obligatorios" })
    }

    const usuarioExistente = await Usuario.findOne({
      $or: [{ correo }, { userId }]
    })

    if (usuarioExistente) {
      return res.status(400).json({ message: "El usuario ya existe" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const nuevoUsuario = new Usuario({
      userId,
      nombre,
      apellido,
      telefono,
      correo,
      password: hashedPassword
    })

    await nuevoUsuario.save()

    const { password: _, ...usuarioSafe } = nuevoUsuario._doc

    return res.status(201).json({
      message: "Usuario creado",
      data: usuarioSafe
    })
  } catch (error) {
    return res.status(500).json({
      message: "Error al crear usuario",
      error: error.message
    })
  }
}

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password")
    return res.status(200).json(usuarios)
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener usuarios",
      error: error.message
    })
  }
}
