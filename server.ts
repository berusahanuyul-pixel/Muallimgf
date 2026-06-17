import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini Sweet Cheer Up
  app.post("/api/gemini", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ 
          error: "API Key belum dikonfigurasi di Settings > Secrets.",
          text: "Sayang, cowokmu belum pasang kunci API di server nih! Hubungi dia ya biar kancing pintunya dibuka 🔐💖"
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt || "Berikan kata-kata manis penyemangat pacar yang sedang lelah atau bersedih.",
        config: {
          systemInstruction: systemInstruction || "Anda adalah 'Asisten Gemoy', perwakilan asisten virtual imut yang diperintahkan pacar sang pengguna untuk menghibur, menyemangati, dan memberi gombalan romantis. Gunakan panggilan sayang, beb, manisku, cantiik, atau tuan putri. Gunakan bahasa Indonesia kasual yang menggemaskan dengan banyak emoji lucu (🥺, 💖, 🥰, 🧸, 🌸, ✨, 😚, 🐱). Buat jawaban yang super perhatian, manis, penuh cinta, dan menghibur agar hatinya meleleh.",
          temperature: 1.1,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ 
        error: error.message || "Gagal menghubungi langit cinta...",
        text: "Uh oh, hatiku lagi tersendat rasa rindu... Coba kirim pesan lagi ya sayang! 🥰"
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
