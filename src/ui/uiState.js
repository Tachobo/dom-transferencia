// ---------------------------------------------------------------
// CONTROL VISUAL DE SECCIONES
// ---------------------------------------------------------------

/**
 * Muestra las secciones principales de la UI para un usuario validado.
 * @param {HTMLElement} userInfo - Contenedor de la información del usuario
 * @param {HTMLElement} form - Contenedor del formulario de tareas
 * @param {HTMLElement} messages - Contenedor de mensajes/tareas
 */
export function showUserUI(userInfo, form, messages, header, footer) {
    userInfo.classList.remove("hidden");
    form.classList.remove("hidden");
    messages.classList.remove("hidden");
    header.classList.remove("hidden");
    footer.classList.remove("hidden");
}

export function showAdminUI(userInfo, form, header, footer, adminConsole) {
    userInfo.classList.remove("hidden");
    form.classList.remove("hidden");
    header.classList.remove("hidden");
    footer.classList.remove("hidden");
    adminConsole.classList.remove("hidden");
}

/**
 * Oculta las secciones de usuario/form/mensajes (estado inicial).
 * @param {HTMLElement} userInfo - Contenedor de la información del usuario
 * @param {HTMLElement} form - Contenedor del formulario de tareas
 * @param {HTMLElement} messages - Contenedor de mensajes/tareas
 */
export function hideUserUI(userInfo, form, messages, header, footer) {
    userInfo.classList.add("hidden");
    form.classList.add("hidden");
    messages.classList.add("hidden");
    header.classList.add("hidden");
    footer.classList.add("hidden");
}

/**
 * Muestra el componente que indica lista vacía.
 * @param {HTMLElement} emptyState - Elemento que representa el estado vacío
 */
export function showEmpty(emptyState) {
    emptyState.classList.remove("hidden");
}

/**
 * Oculta el componente de estado vacío.
 * @param {HTMLElement} emptyState - Elemento que representa el estado vacío
 */
export function hideEmpty(emptyState) {
    emptyState.classList.add("hidden");
}

/**
 * Muestra un mensaje de error en un elemento específico
 * @param {HTMLElement} errorElement - Elemento donde mostrar el error
 * @param {string} message - Mensaje de error a mostrar
 */
export function showError(errorElement, message) {
    errorElement.textContent = message;
}

/**
 * Limpia el mensaje de error de un elemento específico
 * @param {HTMLElement} errorElement - Elemento del que limpiar el error
 */
export function clearError(errorElement) {
    errorElement.textContent = '';
}