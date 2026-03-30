/**
 * cloudinary.js
 *
 * Serviço isolado de upload de imagens para o Cloudinary.
 *
 * Variáveis de ambiente necessárias (.env):
 *   VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
 *   VITE_CLOUDINARY_UPLOAD_PRESET=seu_upload_preset  ← deve ser "Unsigned"
 */

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

function getUploadUrl() {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "[Cloudinary] VITE_CLOUDINARY_CLOUD_NAME e VITE_CLOUDINARY_UPLOAD_PRESET " +
      "precisam estar definidos no .env"
    );
  }
  return `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
}

// ─── Upload único ─────────────────────────────────────────────────────────────

/**
 * Faz upload de um File ou Blob para o Cloudinary.
 *
 * @param {File|Blob} file
 * @param {object}   [opts]
 * @param {string}   [opts.folder="articles"]   Pasta no Cloudinary
 * @param {Function} [opts.onProgress]          Callback (0–100)
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export function uploadImage(file, { folder = "articles", onProgress } = {}) {
  const formData = new FormData();
  formData.append("file",           file);
  formData.append("upload_preset",  UPLOAD_PRESET);
  formData.append("folder",         folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", getUploadUrl());

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({ url: data.secure_url, publicId: data.public_id });
      } else {
        reject(new Error(`[Cloudinary] Upload falhou — status ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("[Cloudinary] Erro de rede")));
    xhr.addEventListener("abort", () => reject(new Error("[Cloudinary] Upload cancelado")));

    xhr.send(formData);
  });
}

// ─── Helpers para o conteúdo HTML do editor ───────────────────────────────────

/**
 * Converte um Data URL base64 em Blob tipado.
 * Necessário para imagens inseridas via paste ou upload no editor.
 */
export function base64ToBlob(dataUrl) {
  const [header, data] = dataUrl.split(",");
  const mime   = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Percorre o HTML do editor, faz upload de cada imagem (blob:) para o Cloudinary
 * e retorna o HTML com os src substituídos pelas URLs definitivas.
 *
 * Deve ser chamado ANTES de enviar o payload ao backend.
 *
 * @param {string} html
 * @param {string} [folder="articles/content"]
 * @returns {Promise<string>} HTML com URLs do Cloudinary
 */
export async function uploadInlineImages(html, folder = "articles/content") {
  const parser = new DOMParser();
  const doc    = parser.parseFromString(html, "text/html");
  
  // 1. O Detetive agora procura por 'blob:'
  const images = [...doc.querySelectorAll("img[src^='blob:']")];

  if (images.length === 0) return html;

  await Promise.all(
    images.map(async (img) => {
      const blobUrl = img.src;
      try {
    
        const response = await fetch(blobUrl);
        const blob = await response.blob();
    
        const { url } = await uploadImage(blob, { folder });
        
        img.src = url;
      } catch (error) {
        console.error("Erro ao subir imagem inline:", error);
      }
    })
  );

  return doc.body.innerHTML;
}
