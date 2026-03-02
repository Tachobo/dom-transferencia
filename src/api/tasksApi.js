// ---------------------------------------------------------------
// ---------------------------------------------------------------
// API DE TAREAS
// Funciones encapsuladas para comunicarse con el backend (json-server)
// ---------------------------------------------------------------

/**
 * Obtiene todas las tareas desde el endpoint `/tasks`.
 * @returns {Promise<Array>} Lista de tareas en formato JSON
 * @throws {Error} Si la respuesta HTTP no es OK
 */
export async function fetchTasks() {
    const res = await fetch(`http://localhost:3000/tasks`);
    if (!res.ok) throw new Error("Error cargando tareas");
    return res.json();
}

/**
 * Crea una nueva tarea en el backend.
 * @param {Object} task - Objeto tarea a crear
 * @returns {Promise<Object>} Tarea creada
 * @throws {Error} Si la respuesta HTTP no es OK
 */
export async function createTask(task) {
    const res = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
    });

    if (!res.ok) throw new Error("Error al registrar tarea");
    return res.json();
}

/**
 * Actualiza campos de una tarea existente (PATCH).
 * @param {number|string} id - Identificador de la tarea
 * @param {Object} updatedData - Campos a actualizar
 * @returns {Promise<Object>} Tarea actualizada
 * @throws {Error} Si la respuesta HTTP no es OK
 */
export async function updateTaskApi(id, updatedData) {
    const res = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: "PATCH", // Solo enviamos lo que cambió
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
    });
    if (!res.ok) throw new Error("No se pudo actualizar la tarea");
    return res.json();
}

/**
 * Elimina una tarea por su ID.
 * @param {number|string} id - Identificador de la tarea
 * @returns {Promise<boolean>} true si se eliminó correctamente
 * @throws {Error} Si la respuesta HTTP no es OK
 */
export async function deleteTaskApi(id) {
    const res = await fetch(`http://localhost:3000/tasks/${id}`, {
        method: "DELETE"
    });
    if (!res.ok) throw new Error("No se pudo eliminar la tarea");
    return true;
}