export const API_BASE_URL = 'http://localhost:1025'// ' http://laurier.aioli.ec-m.fr

const API_URL = "http://localhost:1025";

export async function apiFetch(path, options = {}) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include", // envoie/reçoit cookies même en cross-origin [web:65]
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}
