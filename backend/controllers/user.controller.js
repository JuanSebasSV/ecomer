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

/** REGISTRAR USUARIO (ignora userId enviado por cliente) */
export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, apellido, telefono, correo, password } = req.body;

    if (!nombre || !apellido || !telefono || !correo || !password) {
      return res.status(400).json({ message: "Faltan datos obligatorios" });
    }

    // Normalizar correo a minúsculas
    const correoNorm = correo.toLowerCase();

    // verificar correo existente
    const usuarioExistente = await Usuario.findOne({ correo: correoNorm });
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
      correo: correoNorm,
      password: hashedPassword
      // createdAt se gestiona por el schema
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

/** LISTAR USUARIOS (sin password) */
export const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password");
    return res.status(200).json(usuarios);
  } catch (error) {
    console.error("Error listarUsuarios:", error);
    return res.status(500).json({
      message: "Error al obtener usuarios",
      error: error.message
    });
  }
};

/** OBTENER UN USUARIO POR ID (userId o _id) */
export const obtenerUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    // Permitir buscar por userId (USR000001) o por _id de Mongo
    let usuario = await Usuario.findOne({ userId: id }).select("-password");
    if (!usuario) {
      usuario = await Usuario.findById(id).select("-password");
    }
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });
    return res.status(200).json({ data: usuario });
  } catch (error) {
    console.error("Error obtenerUsuario:", error);
    return res.status(500).json({ message: "Error al obtener usuario", error: error.message });
  }
};

/** ACTUALIZAR USUARIO (solo campos permitidos) */
export const actualizarUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    const updates = {};

    // Solo permitir actualizar estos campos
    const ALLOWED = ["nombre", "apellido", "telefono"];

    ALLOWED.forEach(k => {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Ningún campo actualizable enviado" });
    }

    const usuario = await Usuario.findOneAndUpdate(
      { $or: [{ userId: id }, { _id: id }] },
      { $set: updates },
      { new: true, runValidators: true, context: "query" }
    ).select("-password");

    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado" });

    return res.status(200).json({ message: "Usuario actualizado", data: usuario });
  } catch (error) {
    console.error("Error actualizarUsuario:", error);
    return res.status(500).json({ message: "Error al actualizar usuario", error: error.message });
  }
};


/** CAMBIAR CONTRASEÑA */
export const cambiarPassword = async (req, res) => {
  try {
    const id = req.params.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Contraseña actual y nueva contraseña son requeridas" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "La nueva contraseña debe tener al menos 6 caracteres" 
      });
    }

    // Buscar usuario (por userId o _id)
    let usuario = await Usuario.findOne({ userId: id });
    if (!usuario) {
      usuario = await Usuario.findById(id);
    }

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(currentPassword, usuario.password);
    
    if (!passwordValida) {
      return res.status(401).json({ message: "La contraseña actual es incorrecta" });
    }

    // Hash de la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    usuario.password = hashedNewPassword;
    await usuario.save();

    return res.status(200).json({ 
      message: "Contraseña actualizada correctamente" 
    });

  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ 
      message: "Error al cambiar la contraseña", 
      error: error.message 
    });
  }
};

// Agregar esta función a user.controller.js

/** RECUPERAR CONTRASEÑA (enviar email) */
export const recuperarPassword = async (req, res) => {
  try {
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ message: "El correo es requerido" });
    }

    // Normalizar correo
    const correoNorm = correo.toLowerCase();

    // Verificar si el usuario existe
    const usuario = await Usuario.findOne({ correo: correoNorm });

    if (!usuario) {
      // Por seguridad, no revelamos si el correo existe o no
      return res.status(200).json({ 
        message: "Si el correo existe, recibirás instrucciones de recuperación" 
      });
    }

    // AQUÍ DEBERÍAS IMPLEMENTAR EL ENVÍO DE EMAIL
    // Por ahora, solo simularemos el proceso
    
    // Generar un token temporal (en producción, guárdalo en la BD con expiración)
    const resetToken = Math.random().toString(36).substring(2, 15);
    
    // En un sistema real, aquí enviarías un email con un link como:
    // https://tudominio.com/reset-password?token=${resetToken}
    
    console.log(`
      ========================================
      📧 EMAIL DE RECUPERACIÓN
      ========================================
      Para: ${correoNorm}
      Token: ${resetToken}
      Link: http://localhost:8081/reset-password?token=${resetToken}
      ========================================
    `);

    // NOTA: Para implementar el envío de emails reales, necesitarías:
    // 1. Instalar nodemailer: npm install nodemailer
    // 2. Configurar un servicio SMTP (Gmail, SendGrid, etc.)
    // 3. Crear una tabla de tokens de recuperación en la BD
    
    return res.status(200).json({ 
      message: "Si el correo existe, recibirás instrucciones de recuperación",
      // En desarrollo, puedes incluir esto:
      debug: process.env.NODE_ENV === 'development' ? { token: resetToken } : undefined
    });

  } catch (error) {
    console.error("Error al recuperar contraseña:", error);
    return res.status(500).json({ 
      message: "Error al procesar la solicitud", 
      error: error.message 
    });
  }
};