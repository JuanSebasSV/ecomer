import mongoose from "mongoose";

const uri = "mongodb+srv://sebas:admin@ecomer.gpfjuln.mongodb.net/tienda?retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => console.log("✅ Conectado a la base de datos:", mongoose.connection.name))
  .catch(err => console.log("❎ Error al conectar a la base de datos:", err));
