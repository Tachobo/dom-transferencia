// ---------------------------------------------------------------
// UI DE NOTIFICACIONES (DOM)
// Función simple para mostrar toasts (notificaciones temporales)
// ---------------------------------------------------------------

/**
 * Muestra una notificación tipo toast en el contenedor `#notification-container`.
 * - Si no existe el contenedor, la función es silenciosa (no lanza error)
 * - El toast se autocierra tras 3 segundos
 *
 * @param {string} message - Texto a mostrar
 * @param {'info'|'success'|'error'|'warning'} [type='info'] - Tipo de notificación
 */
export function showNotification(message, type = 'info') {
    // 1. Buscamos el contenedor que creaste en el HTML
    const container = document.getElementById('notification-container');
    if (!container) return;

    // 2. Creamos la tarjetita (toast) y le asignamos su color (type)
    const toast = document.createElement('div');
    toast.classList.add('toast', `toast--${type}`);

    // 3. Definimos qué icono mostrar dependiendo del tipo
    let icon = 'ℹ️'; // Por defecto info
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';
    if (type === 'warning') icon = '⚠️';

    // 4. Le metemos el icono y tu mensaje adentro de la tarjetita
    toast.innerHTML = `
        <span class="toast__icon">${icon}</span>
        <span class="toast__message">${message}</span>
    `;

    // 5. Agregamos la tarjetita al contenedor en la pantalla
    container.appendChild(toast);

    // 6. Programamos que desaparezca después de 3 segundos (3000 milisegundos)
    setTimeout(() => {
        toast.classList.add('fade-out-right'); // Activa la animación de salida del CSS
        
        // Esperamos un poquito a que termine la animación visual para borrar el elemento del código
        setTimeout(() => {
            toast.remove();
        }, 200); 
    }, 3000);
}