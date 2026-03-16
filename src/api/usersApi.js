// ---------------------------------------------------------------
// API DE USUARIOS
// ---------------------------------------------------------------


// ---------------------------------------------------------------
// ======================= OPERACIONES GET =======================
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
 * Obtiene un usuario por su número de documento desde el endpoint `/users?document={doc}`.
 * Devuelve `null` si no se encuentra el usuario o hay un error.
 *
 * @param {number|string} document - Número de documento del usuario
 * @returns {Promise<Object|null>} Objeto usuario o null si no existe
 */
export async function fetchUserByDocument(document) {
    try {
        const response = await fetch(`http://localhost:3000/users?document=${document}`);

        // Si la respuesta es exitosa, extraemos al usuario
        const users = await response.json();

        // Retornamos el objeto directamente o null si la búsqueda no trajo nada
        return users[0] || null;

    } catch (error) {
        console.error("Error en la conexión con el servidor");
        return null;
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


// ---------------------------------------------------------------
// ===================== OPERACIONES DELETE ======================
// ---------------------------------------------------------------

/**
 * Elimina un usuario por su ID.
 * @param {number|string} id 
 */
export async function deleteUserApi(id) {
    const res = await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE"
    });
    if (!res.ok) throw new Error("Error al eliminar el usuario");
    return res.json();
}


// ---------------------------------------------------------------
// ====================== OPERACIONES PATCH ======================
// ---------------------------------------------------------------

/**
 * Actualiza los datos de un usuario (PATCH).
 */
export async function updateUserApi(id, userData) {
    const res = await fetch(`http://localhost:3000/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error("Error al actualizar el usuario");
    return res.json();
}


// ---------------------------------------------------------------
// ======================= OPERACIONES POST ======================
// ---------------------------------------------------------------
/**
 * Crea un nuevo usuario en el sistema.
 * @param {Object} userData 
 */
export async function createUserApi(userData) {
    // Le asignamos una contraseña inicial igual a su documento
    const newUser = {
        ...userData,
        password: userData.document
    };

    const res = await fetch(`http://localhost:3000/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
    });
    if (!res.ok) throw new Error("Error al crear el usuario");
    return res.json();
}