import express from "express";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    district: {
      type: String,
      default: "",
    },
    ward: {
      type: String,
      default: "",
    },
    cartData: {
      type: Object,
      default: {},
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpiry: {
      type: Date,
    },
    googleId: {
      type: String
    },
    avatar: {
      type: String,
    },
  },
  {
    minimize: false,
    timestamps: true
  }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
