const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  votes: { type: Number, default: 0 },
});

const pollSchema = new mongoose.Schema(
  {
    question: 
    { type: String, 
      required: true 
    },
    options: 
    { type: [optionSchema], 
      required: true 
    },
    expiresAt: 
    { type: Date, 
      required: true 
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slug: {
      type: String,
      unique: true,
      default: () => uuidv4().split("-")[0] + uuidv4().split("-")[1],
    },
    voters: [{ type: String }],
  },
  { timestamps: true },
);

pollSchema.virtual("isExpired").get(function () {
  return new Date() > this.expiresAt;
});

module.exports = mongoose.model("Poll", pollSchema);
