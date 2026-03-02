/**
 * Genera una representación JSON legible de las tareas.
 * @param {Array} tasks - Lista de tareas a serializar
 * @returns {string} JSON formateado
 */
export function generateTasksJSON(tasks) {
    return JSON.stringify(tasks, null, 2);
}