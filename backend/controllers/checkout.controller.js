// backend/controllers/checkout.controller.js
import Order from "../models/order.models.js";
import Counter from "../models/counter.models.js";
import Usuario from "../models/user.models.js";

/**
 * Helper: Obtener siguiente secuencia para OrderID
 */
async function getNextOrderSequence() {
  const counter = await Counter.findOneAndUpdate(
    { _id: "orders" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

/**
 * Formatear OrderID: 1 -> ORD-000001
 */
function formatOrderId(seq) {
  const timestamp = Date.now().toString().slice(-4);
  return `ORD-${String(seq).padStart(6, "0")}-${timestamp}`;
}

/**
 * PROCESAR CHECKOUT - SIMULADO
 * Crea una nueva orden en MongoDB con pago simulado
 */
export const procesarCheckout = async (req, res) => {
  try {
    console.log("📦 Iniciando proceso de checkout...");
    console.log("Datos recibidos:", JSON.stringify(req.body, null, 2));

    const { 
      usuarioId, 
      usuarioData, 
      billing, 
      payment, 
      products, 
      subtotal, 
      envio, 
      total,
      meta 
    } = req.body;

    // =====================================================
    //  VALIDACIONES BÁSICAS
    // =====================================================
    
    if (!billing?.name || !billing?.phone || !billing?.address) {
      console.error("❌ Faltan datos de facturación");
      return res.status(400).json({
        success: false,
        message: "Faltan datos de facturación obligatorios (nombre, teléfono, dirección)"
      });
    }

    if (!payment?.method) {
      console.error("❌ Método de pago no especificado");
      return res.status(400).json({
        success: false,
        message: "Método de pago no especificado"
      });
    }

    if (!products || !Array.isArray(products) || products.length === 0) {
      console.error("❌ Carrito vacío");
      return res.status(400).json({
        success: false,
        message: "El carrito está vacío"
      });
    }

    if (typeof subtotal !== 'number' || typeof total !== 'number') {
      console.error("❌ Montos inválidos");
      return res.status(400).json({
        success: false,
        message: "Montos inválidos"
      });
    }

    // Validar estructura de productos
    for (const prod of products) {
      if (!prod.id || !prod.title || !prod.qty || typeof prod.price !== 'number') {
        console.error("❌ Producto con datos incompletos:", prod);
        return res.status(400).json({
          success: false,
          message: "Uno o más productos tienen datos incompletos"
        });
      }
    }

    // =====================================================
    //  VERIFICAR USUARIO (SI APLICA)
    // =====================================================
    let usuario = null;
    let userIdFinal = null; // Este es el que guardaremos en la orden
    
    if (usuarioId) {
      try {
        // Buscar por userId personalizado o por _id de MongoDB
        usuario = await Usuario.findOne({ $or: [{ userId: usuarioId }, { _id: usuarioId }] });
        if (usuario) {
          console.log(`✅ Usuario encontrado: ${usuario.nombre} (${usuario.correo})`);
          // IMPORTANTE: Guardar el userId personalizado (USR000001), NO el _id de MongoDB
          userIdFinal = usuario.userId;
          console.log(`📝 UserId que se guardará en la orden: ${userIdFinal}`);
        } else {
          console.warn(`⚠️ Usuario ${usuarioId} no encontrado, procesando como invitado`);
        }
      } catch (err) {
        console.warn(`⚠️ Error buscando usuario: ${err.message}`);
      }
    }

    // =====================================================
    //  GENERAR ORDER ID SECUENCIAL
    // =====================================================
    const seq = await getNextOrderSequence();
    const orderId = formatOrderId(seq);
    console.log(`🔢 Generando OrderID: ${orderId}`);

    // =====================================================
    //  PROCESAR DATOS DE PAGO (SIMULADO)
    // =====================================================
    let cardData = null;
    let paymentStatus = 'approved'; // Simulamos pago aprobado

    if (payment.method === 'card' && payment.card) {
      const cardNumber = (payment.card.number || "").replace(/\s+/g, "");
      const lastFour = cardNumber.slice(-4) || "****";
      
      // Simular validación de tarjeta
      if (cardNumber.length < 13) {
        console.error("❌ Número de tarjeta inválido");
        return res.status(400).json({
          success: false,
          message: "Número de tarjeta inválido"
        });
      }

      // Detectar marca de tarjeta (simulado)
      let brand = "Unknown";
      if (cardNumber.startsWith("4")) brand = "Visa";
      else if (cardNumber.startsWith("5")) brand = "Mastercard";
      else if (cardNumber.startsWith("3")) brand = "Amex";
      
      cardData = {
        lastFour: lastFour,
        holder: payment.card.holder || billing.name,
        brand: brand
      };

      console.log(`💳 Tarjeta procesada: ${brand} **** ${lastFour}`);
    } else if (payment.method === 'cash') {
      console.log(`💵 Pago en efectivo seleccionado`);
      paymentStatus = 'pending'; // En efectivo queda pendiente hasta entregar
    } else {
      console.log(`💰 Método de pago: ${payment.method}`);
    }

    // =====================================================
    //  CREAR ORDEN EN MONGODB
    // =====================================================
    console.log("💾 Guardando orden en MongoDB...");

    const nuevaOrden = new Order({
      orderId,
      usuarioId: userIdFinal, // Usar el userId personalizado (USR000001) o null
      usuarioData: {
        nombre: usuarioData?.nombre || billing.name,
        correo: usuarioData?.correo || usuario?.correo || "",
        telefono: usuarioData?.telefono || billing.phone
      },
      billing: {
        name: billing.name,
        phone: billing.phone,
        address: billing.address,
        city: billing.city || "",
        department: billing.department || ""
      },
      payment: {
        method: payment.method,
        card: cardData,
        status: paymentStatus
      },
      products: products.map(p => ({
        productId: p.id,
        title: p.title,
        qty: p.qty,
        price: p.price,
        image: p.image || ""
      })),
      subtotal,
      envio: envio || 0,
      descuento: 0,
      total,
      status: 'pending', // Estado inicial
      notes: "",
      meta: {
        userAgent: req.headers['user-agent'] || null,
        ip: req.ip || req.connection?.remoteAddress || null,
        from: meta?.from || "checkout",
        ts: meta?.ts || Date.now()
      }
    });

    await nuevaOrden.save();

    console.log(`✅ ¡Orden guardada exitosamente! ID: ${orderId}`);
    console.log(`   - Usuario: ${nuevaOrden.usuarioData.nombre}`);
    console.log(`   - UsuarioId guardado: ${userIdFinal || 'invitado'}`);
    console.log(`   - Total: ${total.toLocaleString('es-CO')}`);
    console.log(`   - Productos: ${products.length}`);
    console.log(`   - Método de pago: ${payment.method}`);
    console.log(`   - Estado: ${paymentStatus}`);

    // =====================================================
    //  RESPUESTA EXITOSA
    // =====================================================
    return res.status(200).json({
      success: true,
      message: "¡Orden procesada correctamente!",
      orderId: orderId,
      data: {
        orderId,
        total,
        usuario: nuevaOrden.usuarioData.nombre,
        fecha: nuevaOrden.createdAt,
        status: nuevaOrden.status,
        paymentStatus: nuevaOrden.payment.status,
        productos: nuevaOrden.products.length,
        metodo: nuevaOrden.payment.method
      }
    });

  } catch (error) {
    console.error("❌ ERROR CRÍTICO en checkout:", error);
    console.error("Stack trace:", error.stack);
    
    return res.status(500).json({
      success: false,
      message: "Error al procesar la orden",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * OBTENER ORDEN POR ID
 */
export const obtenerOrden = async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`🔍 Buscando orden: ${orderId}`);

    const orden = await Order.findOne({ orderId });

    if (!orden) {
      console.warn(`⚠️ Orden ${orderId} no encontrada`);
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada"
      });
    }

    console.log(`✅ Orden encontrada: ${orderId}`);
    return res.status(200).json({
      success: true,
      data: orden
    });

  } catch (error) {
    console.error("❌ Error al obtener orden:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener la orden",
      error: error.message
    });
  }
};

/**
 * LISTAR ÓRDENES DE UN USUARIO
 * IMPORTANTE: El usuarioId puede venir como:
 * - userId personalizado (USR000001) desde localStorage
 * - ObjectId de MongoDB (_id) 
 */
export const listarOrdenesUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    console.log(`📋 Listando órdenes del usuario: ${usuarioId}`);

    // PASO 1: Determinar el userId correcto
    let userIdReal = usuarioId;

    // Si parece un ObjectId de MongoDB (24 caracteres hexadecimales)
    if (usuarioId.length === 24 && /^[0-9a-fA-F]{24}$/.test(usuarioId)) {
      console.log(`🔍 El ID parece un ObjectId de MongoDB, buscando el userId personalizado...`);
      
      // Buscar el usuario para obtener su userId personalizado
      const usuario = await Usuario.findById(usuarioId);
      
      if (usuario) {
        userIdReal = usuario.userId;
        console.log(`✅ Usuario encontrado. UserId personalizado: ${userIdReal}`);
      } else {
        console.warn(`⚠️ No se encontró usuario con _id: ${usuarioId}`);
      }
    }

    console.log(`🔍 Buscando órdenes con usuarioId: ${userIdReal}`);

    // PASO 2: Buscar órdenes por el userId personalizado
    const ordenes = await Order.find({ usuarioId: userIdReal })
      .sort({ createdAt: -1 })
      .select('-meta');

    console.log(`✅ ${ordenes.length} órdenes encontradas`);

    // Debug: Mostrar algunos detalles de las órdenes encontradas
    if (ordenes.length > 0) {
      console.log(`📦 Primeras órdenes encontradas:`);
      ordenes.slice(0, 3).forEach(orden => {
        console.log(`   - ${orden.orderId}: ${orden.usuarioData.nombre} - $${orden.total}`);
      });
    }

    return res.status(200).json({
      success: true,
      data: ordenes,
      total: ordenes.length
    });

  } catch (error) {
    console.error("❌ Error al listar órdenes:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las órdenes",
      error: error.message
    });
  }
};

/**
 * LISTAR TODAS LAS ÓRDENES (ADMIN)
 */
export const listarTodasOrdenes = async (req, res) => {
  try {
    const { limit = 50, skip = 0, status } = req.query;
    
    const query = status ? { status } : {};
    
    const ordenes = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select('-meta');

    const total = await Order.countDocuments(query);

    console.log(`✅ ${ordenes.length} órdenes listadas de ${total} totales`);

    return res.status(200).json({
      success: true,
      data: ordenes,
      total,
      page: Math.floor(skip / limit) + 1,
      pages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error("❌ Error al listar todas las órdenes:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener las órdenes",
      error: error.message
    });
  }
};

/**
 * ACTUALIZAR ESTADO DE ORDEN
 */
export const actualizarEstadoOrden = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const estadosValidos = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!estadosValidos.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`
      });
    }

    const orden = await Order.findOneAndUpdate(
      { orderId },
      { $set: { status, updatedAt: Date.now() } },
      { new: true }
    );

    if (!orden) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada"
      });
    }

    console.log(`✅ Orden ${orderId} actualizada a: ${status}`);

    return res.status(200).json({
      success: true,
      message: "Estado actualizado correctamente",
      data: orden
    });

  } catch (error) {
    console.error("❌ Error al actualizar orden:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar la orden",
      error: error.message
    });
  }
};