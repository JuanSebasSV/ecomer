export const registerUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();

    return res.status(201).json({
      ok: true,
      message: "Usuario registrado satisfactoriamente"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error en el servidor",
    });
  }
};
