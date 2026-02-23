import React from "react";
import { Routes, Route } from "react-router-dom"; // 👈 O Guarda de Trânsito
import Home from "./paginas/Home"; // (Ou ./components/Home, depende da sua pasta)
import AdminDashboard from "./paginas/AdminDashboard"; // A nova página que criamos

function App() {
  return (
    // O <Routes> verifica a URL atual e escolhe qual <Route> vai renderizar
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;