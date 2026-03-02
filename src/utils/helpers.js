// ---------------------------------------------------------------
// FUNCIONES AUXILIARES REUTILIZABLES
// ---------------------------------------------------------------

/**
 * Comprueba si una entrada de texto es válida (no vacía tras trim).
 * @param {string} value - Texto a validar
 * @returns {boolean}
 */
export function isValidInput(value) {
    return value.trim().length > 0;
}

/**
 * Devuelve una cadena con la fecha y hora actual formateada en español.
 * @returns {string} Fecha formateada (ej. '2 de marzo de 2026, 14:05')
 */
export function getCurrentTimestamp() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return now.toLocaleDateString('es-ES', options);
}

/**
 * Obtiene las iniciales de un nombre.
 * - Si el nombre tiene una sola palabra devuelve las dos primeras letras
 * - Si tiene varias palabras devuelve la primera letra de cada palabra
 *
 * @param {string} name - Nombre completo
 * @returns {string} Iniciales en mayúsculas
 */
export function getInitials(name) {
    const trimmedName = name.trim();
    const words = trimmedName.split(/\s+/);

    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    }
    return words.map(w => w[0]).join('').toUpperCase();
}

/**
 * Obtiene valores de checkboxes seleccionados
 * @param {NodeList} checkboxes 
 * @returns {Array}
 */
/**
 * Obtiene valores de checkboxes seleccionados
 * @param {NodeList} checkboxes - NodeList obtenido por querySelectorAll
 * @returns {Array<string>} Valores de checkboxes marcados
 */
export const getSelectedValues = (checkboxes) =>
    [...checkboxes].filter(cb => cb.checked).map(cb => cb.value);

/**
 * Combina el filtrado y ordenamiento de tareas en un solo proceso.
 * 
 * @param {Array} tasks Lista completa de tareas del usuario
 * @param {Array} estados Estados seleccionados en los checkboxes
 * @param {string} sort Criterio de orden seleccionado en el select
 * @param {Function} filterFn Función encargada de filtrar tareas
 * @param {Function} sortFn Función encargada de ordenar tareas
 * @returns {Array} Lista final de tareas procesadas
 */
export const processTasks = (tasks, estados, sort, filterFn, sortFn) => {

    // Si hay estados seleccionados, filtra; si no, usa la lista original
    const filtered = estados.length > 0 ? filterFn(tasks, estados) : tasks;

    // Si hay criterio de orden, ordena; si no, devuelve las tareas filtradas
    return sort ? sortFn(filtered, sort) : filtered;
};