// ---------------------------------------------------------------
// API DE USUARIOS
// ---------------------------------------------------------------

/**
 * Obtiene un usuario por su ID desde el endpoint `/users/{id}`.
 * Devuelve `null` si la respuesta no es OK (por ejemplo 404).
 *
 * @param {number|string} id - Identificador del usuario
 * @returns {Promise<Object|null>} Objeto usuario o null si no existe
 */
export async function fetchUserById(id) {
    const response = await fetch(`http://localhost:3000/users/${id}`);
    if (!response.ok) {
        return null
    } else {
        return response.json();
    }
}

/**
 * Obtiene TODOS los usuarios desde el endpoint `/users`.
 * @returns {Promise<Array>} Lista completa de usuarios
 */
export async function fetchUsers() {
    const response = await fetch(`http://localhost:3000/users`);
    if (!response.ok) {
        return [];
    }
    return response.json();
}