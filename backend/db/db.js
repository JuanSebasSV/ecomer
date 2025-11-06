import mongoose from "mongoose";

const uri = "mongodb+srv://sebas:admin@ecomer.gpfjuln.mongodb.net/?appName=tienda&w=majority";

mongoose.connect(uri)
  .then(() => console.log("✅ Conectado a la base de datos"))
  .catch(err => console.log("❎ Error al conectar a la base de datos:", err));
