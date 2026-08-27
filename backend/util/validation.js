// utils/validation.js — 驗證工具函式
const isValidString = (value) =>
  typeof value === "string" && value.trim() !== "";
const isInteger = (value) =>
  typeof value === "number" && Number.isInteger(value);
const isValidPassword = (value) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,16}$/.test(value);
const isValidUUID = (value) => 
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

const isPositiveInteger = (str) => 
  typeof str === 'string' && /^\d+$/.test(str.trim());

module.exports = { isValidString, isInteger, isValidPassword, isValidUUID,isPositiveInteger};
