"use strict";

require("dotenv").config();

const express = require("express");
const { auth, requiresAuth } = require("express-openid-connect");
const cons = require("consolidate");
const path = require("path");

const app = express();

// ===== Vistas =====
app.engine("html", cons.swig);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");

// ===== Archivos estáticos =====
app.use("/static", express.static(path.join(__dirname, "static")));

// ===== Configuración Auth (Okta) =====
// Variables en .env:
// ISSUER_BASE_URL=https://<tu-okta-domain>/oauth2/default
// BASE_URL=https://auth-una-chat.vercel.app
// CLIENT_ID=xxx
// CLIENT_SECRET=xxx
// SECRET=una_clave_larga_aleatoria
app.use(
  auth({
    authRequired: false,
    issuerBaseURL: process.env.ISSUER_BASE_URL,
    baseURL: process.env.BASE_URL,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    secret: process.env.SECRET,
    idpLogout: true
  })
);

// ===== Rutas =====
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/dashboard", requiresAuth(), (req, res) => {
  // express-openid-connect guarda info del usuario en req.oidc.user
  const userInfo = req.oidc?.user || null;
  res.render("dashboard", { user: userInfo });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
     console.log(`Servidor iniciado en ${process.env.BASE_URL} (puerto ${PORT})`);

   });
 }

// ===== Exportar para Vercel =====
module.exports = app;