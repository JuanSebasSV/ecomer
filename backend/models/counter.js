// backend/models/counter.js
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "users"
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.model("Counter", counterSchema, "counters");

export default Counter;
