const axios = require("axios");

module.exports = function (app) {

    const apiKey = "AIzaSyAue-RQ_RuYj3LjoqUUp9-QdO4NJj6E2As"; 
    
    const model = "gemini-1.5-pro"; 

    // Sistem Prompt (Persona Rianshope)
    const systemPromptText = `
    Kamu adalah asisten resmi dari Rianshope, store hosting terpercaya.
    Tugasmu: Mempromosikan produk, menjawab pertanyaan pelanggan, dan menutup penjualan.
    
    ATURAN UTAMA:
    1. BAHASA: Wajib Bahasa Indonesia formal namun ramah.
    2. KONTAK: Arahkan pembelian ke WhatsApp +6285382881871.
    3. PRODUK: VPS DigitalOcean, Panel Pterodactyl, Script Bot WA, Jasa Install/Fix.
    4. KEUNGGULAN: Transaksi otomatis, harga terjangkau, support admin penuh.
    5. JIKA TIDAK TAHU: Jangan mengarang. Arahkan ke owner.
    
    SKENARIO JAWABAN:
    - Tanya beli -> Arahkan ke WA/Web.
    - Tanya harga -> "Sangat terjangkau, hubungi WA untuk detail."
    - Tanya garansi -> "Transaksi otomatis, aman, dan terpercaya."
    - Out of topic -> "Maaf, saya hanya melayani kebutuhan hosting & bot. Ada yang bisa dibantu terkait Rianshope?"
    `;

    const chatbot = {
        send: async (message) => {
            try {
                // URL Endpoint API
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

                // Payload Request
                // PENTING: Saya memisahkan system_instruction dari konten user.
                // Ini membuat AI lebih patuh pada peran Rianshope.
                const data = {
                    system_instruction: {
                        parts: [{ text: systemPromptText }]
                    },
                    contents: [
                        { 
                            role: "user",
                            parts: [{ text: message }] 
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7, // Keseimbangan antara kreatif dan patuh
                        maxOutputTokens: 500,
                    }
                };

                const response = await axios.post(url, data, {
                    headers: { "Content-Type": "application/json" }
                });

                // Mengambil respons
                const responseText =
                    response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
                    "Maaf, saat ini Rianshope sedang sibuk. Silakan hubungi admin langsung.";

                return responseText;

            } catch (error) {
                // Logging error yang lebih informatif untuk debugging
                const errorMsg = error.response?.data?.error?.message || error.message;
                console.error("Gemini API Error:", errorMsg);
                
                // Jangan throw error 500 ke user, tapi berikan pesan fallback yang sopan
                return "Sistem sedang pemeliharaan sebentar. Silakan hubungi WhatsApp admin +6285382881871.";
            }
        }
    };

    // Endpoint API
    app.get("/ai/rianai", async (req, res) => {
        try {
            const { text } = req.query;
            if (!text) {
                return res.status(400).json({ status: false, error: "Parameter 'text' wajib diisi." });
            }

            const result = await chatbot.send(text);

            res.status(200).json({
                status: true,
                result: result
            });
        } catch (error) {
            res.status(500).json({ status: false, error: "Internal Server Error" });
        }
    });
};
