// Middleware để log ZaloPay callback
const logZaloPayCallback = (req, res, next) => {
  console.log("=== ZaloPay Callback Debug ===");
  console.log("Headers:", req.headers);
  console.log("Body:", req.body);
  console.log("Query:", req.query);
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("================================");
  next();
};

export default logZaloPayCallback;
