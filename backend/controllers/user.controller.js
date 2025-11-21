// backend/controllers/user.controller.js
import Usuario from "../models/user.js";
import Counter from "../models/counter.js";
import bcrypt from "bcrypt";

/** helper: next seq */
async function getNextSequence(key) {
  const updated = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return updated.seq;
}

/** formatea: 1 -> USR000001 */
function formatUserId(n) {
  return "USR" + String(n).padStart(6, "0");
}

export const registrarUsuario = async (req, res) => {
  try {
    // NOTA: ignoramos cualquier userId enviado por el cliente
    const { nombre, apellido, telefono, correo, password } = req.body;

    if (!nombre || !apellido || !telefono || !correo || !password) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // verificar correo existente
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    // generar userId secuencial
    const seq = await getNextSequence("users");
    const userId = formatUserId(seq);

    // hashear password
    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new Usuario({
      userId,
      nombre,
      apellido,
      telefono,
      correo,
      password: hashedPassword
    });

    await nuevoUsuario.save();

    const { password: _, ...usuarioSafe } = nuevoUsuario._doc;

    return res.status(201).json({
      message: "Usuario creado",
      data: usuarioSafe
    });
  } catch (error) {
    console.error("Error registrarUsuario:", error);
    return res.status(500).json({
      message: "Error al crear usuario",
      error: error.message
    });
  }
};

export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password");
    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener usuarios",
      error: error.message
    });
  }
};
