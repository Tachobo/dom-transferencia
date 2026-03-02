// ---------------------------------------------------------------
// SERVICIO DE USUARIO
// Encapsula lógica relacionada con usuarios y comunicación con la API
// ---------------------------------------------------------------

import { fetchUserById } from "../api/usersApi.js";

/**
 * Valida y retorna los datos de un usuario por su ID.
 * - Si el usuario no existe, retorna `null` (passthrough desde la API).
 *
 * @param {number|string} id - Identificador del usuario a validar
 * @returns {Promise<Object|null>} Usuario o null
 */
export async function validateUserService(id) {
    const user = await fetchUserById(id);
    return user
}