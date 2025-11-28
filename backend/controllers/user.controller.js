// backend/controllers/user.controller.js
import Usuario from "../models/user.models.js";
import Counter from "../models/counter.models.js";
import PasswordResetToken from "../models/token.models.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { transporter, crearEmailRecuperacion, generarCodigoVerificacion} from "./email.controller.js";

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

/** CAMBIAR CONTRASEÑA (usuario autenticado) */
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
      return res.status(401).json({ 
        message: "La contraseña actual es incorrecta" 
      });
    }

    // Hash de la nueva contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    usuario.password = hashedNewPassword;
    await usuario.save();

    console.log(`✅ Contraseña cambiada para: ${usuario.correo}`);

    return res.status(200).json({ 
      message: "Contraseña actualizada correctamente" 
    });

  } catch (error) {
    console.error("❌ Error al cambiar contraseña:", error);
    return res.status(500).json({ 
      message: "Error al cambiar la contraseña", 
      error: error.message 
    });
  }
};

/** 
 * SOLICITAR RECUPERACIÓN DE CONTRASEÑA 
 */
export const recuperarPassword = async (req, res) => {
  try {
    const { correo } = req.body;

    console.log("📧 Solicitud de recuperación para:", correo);

    if (!correo) {
      return res.status(400).json({ message: "El correo es requerido" });
    }

    const correoNorm = correo.toLowerCase().trim();
    const usuario = await Usuario.findOne({ correo: correoNorm });

    const mensajeGenerico = "Si el correo existe, recibirás instrucciones de recuperación";

    if (!usuario) {
      console.log("⚠️ Usuario no encontrado:", correoNorm);
      return res.status(200).json({ message: mensajeGenerico });
    }

    console.log("✅ Usuario encontrado:", usuario.nombre);

    // Generar token y código UNA SOLA VEZ
    const token = crypto.randomBytes(32).toString('hex');
    const codigo = generarCodigoVerificacion();
    
    console.log("🔑 Token generado:", token.substring(0, 10) + "...");
    console.log("🔢 Código generado:", codigo);

    // Eliminar tokens anteriores
    await PasswordResetToken.findOneAndDelete({ userId: usuario._id });
    
    // Guardar nuevo token CON CÓDIGO
    const nuevoToken = new PasswordResetToken({
      userId: usuario._id,
      token: token,
      codigo: codigo,
      verificado: false
    });
    
    await nuevoToken.save();
    console.log("💾 Token y código guardados en BD");

    // ✅ PASAR EL CÓDIGO COMO PARÁMETRO
    const emailContent = crearEmailRecuperacion(usuario.nombre, token, codigo);

    // Enviar email
    console.log("📤 Enviando email a:", usuario.correo);
    
    const info = await transporter.sendMail({
      from: `"TechStore Pro" <${process.env.EMAIL_USER}>`,
      to: usuario.correo,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    console.log("✅ Email enviado exitosamente");
    console.log("📧 Message ID:", info.messageId);

    return res.status(200).json({ 
      message: mensajeGenerico,
      success: true,
      ...(process.env.NODE_ENV === 'development' && { 
        debug: { 
          token, 
          codigo,
          userId: usuario._id,
          emailSent: true
        } 
      })
    });

  } catch (error) {
    console.error("❌ Error al recuperar contraseña:", error);
    
    if (error.code === 'EAUTH') {
      return res.status(500).json({ 
        message: "Error de autenticación del servidor de correo.",
        error: error.message 
      });
    }
    
    return res.status(500).json({ 
      message: "Error al procesar la solicitud", 
      error: error.message 
    });
  }
};

/** 
 * VERIFICAR CÓDIGO DE 6 DÍGITOS
 */
export const verificarCodigo = async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    console.log("🔍 Verificando código:", codigo, "para:", correo);

    if (!correo || !codigo) {
      console.log("❌ Faltan datos");
      return res.status(400).json({ message: "Correo y código son requeridos" });
    }

    const correoNorm = correo.toLowerCase().trim();
    const usuario = await Usuario.findOne({ correo: correoNorm });

    if (!usuario) {
      console.log("❌ Usuario no encontrado");
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    console.log("✅ Usuario encontrado:", usuario._id);

    // Buscar token con ese código
    const resetToken = await PasswordResetToken.findOne({ 
      userId: usuario._id,
      codigo: codigo
    });

    console.log("🔑 Token encontrado:", resetToken ? "SÍ" : "NO");
    
    if (resetToken) {
      console.log("📋 Detalles del token:", {
        codigo: resetToken.codigo,
        verificado: resetToken.verificado,
        createdAt: resetToken.createdAt,
        expiresAt: new Date(resetToken.createdAt.getTime() + 3600000) // 1 hora después
      });
    } else {
      // Ver TODOS los tokens de este usuario para debugging
      const todosLosTokens = await PasswordResetToken.find({ userId: usuario._id });
      console.log("📋 Todos los tokens del usuario:", todosLosTokens.map(t => ({
        codigo: t.codigo,
        token: t.token.substring(0, 10) + "...",
        createdAt: t.createdAt
      })));
    }

    if (!resetToken) {
      console.log("❌ Código inválido o expirado");
      return res.status(400).json({ 
        message: "Código inválido o expirado",
        valid: false 
      });
    }

    // Marcar como verificado
    resetToken.verificado = true;
    await resetToken.save();

    console.log("✅ Código verificado correctamente");

    return res.status(200).json({ 
      message: "Código verificado correctamente",
      valid: true,
      token: resetToken.token, // Enviar el token para la siguiente pantalla
      usuario: {
        correo: usuario.correo,
        nombre: usuario.nombre
      }
    });

  } catch (error) {
    console.error("❌ Error al verificar código:", error);
    return res.status(500).json({ 
      message: "Error al verificar el código", 
      error: error.message,
      valid: false
    });
  }
};

/** 
 * VERIFICAR TOKEN DE RECUPERACIÓN
 * Comprueba si el token existe y no ha expirado
 */
export const verificarToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ message: "Token requerido" });
    }

    // Buscar el token en la BD
    const resetToken = await PasswordResetToken.findOne({ token });

    if (!resetToken) {
      return res.status(404).json({ 
        message: "Token inválido o expirado",
        valid: false 
      });
    }

    // Buscar el usuario asociado
    const usuario = await Usuario.findById(resetToken.userId);

    if (!usuario) {
      return res.status(404).json({ 
        message: "Usuario no encontrado",
        valid: false 
      });
    }

    return res.status(200).json({ 
      message: "Token válido",
      valid: true,
      usuario: {
        correo: usuario.correo,
        nombre: usuario.nombre
      }
    });

  } catch (error) {
    console.error("❌ Error al verificar token:", error);
    return res.status(500).json({ 
      message: "Error al verificar el token", 
      error: error.message,
      valid: false
    });
  }
};

/** 
 * RESTABLECER CONTRASEÑA CON TOKEN (después de verificar código)
 */
export const restablecerPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        message: "Token y nueva contraseña son requeridos" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 6 caracteres" 
      });
    }

    // Buscar el token Y verificar que esté verificado
    const resetToken = await PasswordResetToken.findOne({ 
      token,
      verificado: true  // IMPORTANTE: Solo permitir si se verificó el código
    });

    if (!resetToken) {
      return res.status(404).json({ 
        message: "Token inválido o no verificado. Debes verificar el código primero." 
      });
    }

    const usuario = await Usuario.findById(resetToken.userId);

    if (!usuario) {
      return res.status(404).json({ 
        message: "Usuario no encontrado" 
      });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    usuario.password = hashedPassword;
    await usuario.save();

    // Eliminar el token usado
    await PasswordResetToken.findByIdAndDelete(resetToken._id);

    console.log(`✅ Contraseña restablecida para: ${usuario.correo}`);

    return res.status(200).json({ 
      message: "Contraseña restablecida correctamente" 
    });

  } catch (error) {
    console.error("❌ Error al restablecer contraseña:", error);
    return res.status(500).json({ 
      message: "Error al restablecer la contraseña", 
      error: error.message 
    });
  }
};