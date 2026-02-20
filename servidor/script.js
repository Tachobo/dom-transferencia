/**
 * ============================================
 * EJERCICIO DE MANIPULACIÓN DEL DOM
 * ============================================
 * 
 * Objetivo: Aplicar conceptos del DOM para seleccionar elementos,
 * responder a eventos y crear nuevos elementos dinámicamente.
 * 
 * Autor: Jhon Bueno & Dario Herrera
 * Fecha: 11/02/26
 * ============================================
 */

// ============================================
// 1. SELECCIÓN DE ELEMENTOS DEL DOM
// ============================================

/**
 * Seleccionamos los elementos del DOM que necesitamos manipular.
 * Usamos getElementById para obtener referencias a los elementos únicos.
 */

// ===============================
// AREA DE VALIDACION DE USUARIO
// ===============================
// Input de la validacion de usuario
const documentoInput = document.getElementById('documento');
// Boton de validacion de usuario
const validateBtn = document.getElementById('validateBtn');

// ===============================
// AREA DE USUARIO ENCONTRADO
// ===============================
// Tabla "div" que almacena las etiquetas
const userInfoSection = document.getElementById('userInfo');
// Sitio para el del usuario
const userNameDisplay = document.getElementById('userNameDisplay');
// Sitio para el correo del usuario
const userEmailDisplay = document.getElementById('userEmailDisplay');

// ===============================
// AREA DE MENSAJES PUBLICADOS
// ===============================
// Seccion de mensajes publicados
const areaMensajes = document.getElementById('messages-section')
// Area de mensajes publicados
const messagesContainer = document.getElementById('messagesContainer');
// Sitio de las publicaciones
const emptyState = document.getElementById('emptyState');
// Contador de mensajes publicados
const messageCount = document.getElementById('messageCount');

// ===============================
// FORM PRINCIPAL
// ===============================
// Seccion del formulario principal
const formulario = document.getElementById('task-section')
// Form total
const taskForm = document.getElementById('taskForm');
// Input del titulo
const taskTitleInput = document.getElementById('taskTitle');
// Input de la descripcion
const taskDescriptionInput = document.getElementById('taskDescription');
// Input del statud
const taskStatusInput = document.getElementById('taskStatus');
// Sitio si hay un error en el titulo
const taskTitleError = document.getElementById('taskTitleError');
// Sitio si hay un error en la descripcion
const taskDescriptionError = document.getElementById('taskDescriptionError');
// Sitio si hay un error en el status
const taskStatusError = document.getElementById('taskStatusError');


// ===============================
// ESTADO GLOBAL
// ===============================
// Usuario actual
let currentUser = null;
// Contador de mensajes
let totalMessages = 0;



// ============================================
// 2. FUNCIONES AUXILIARES
// ============================================

/**
 * Valida que un campo no esté vacío ni contenga solo espacios en blanco
 * @param {string} value - El valor a validar
 * @returns {boolean} - true si es válido, false si no lo es
 */
function isValidInput(value) {
    return value.trim().length > 0;
}

/**
 * Valida que un campo no esté vacío, no contenga espacios en blanco y contenga solo letras y números
 * @param {string} value - El valor a validar
 * @returns {boolean} - true si es válido, false si no lo es
 */
function isValidAlphanumericInput(value) {
    const trimmed = value.trim();
    return trimmed.length > 0 && /^[a-zA-Z0-9]+$/.test(trimmed);
}

/**
 * Muestra un mensaje de error en un elemento específico
 * @param {HTMLElement} errorElement - Elemento donde mostrar el error
 * @param {string} message - Mensaje de error a mostrar
 */
function showError(errorElement, message) {
    errorElement.textContent = message;
}

/**
 * Limpia el mensaje de error de un elemento específico
 * @param {HTMLElement} errorElement - Elemento del que limpiar el error
 */
function clearError(errorElement) {
    errorElement.textContent = '';
}

/**
 * Valida todos los campos del formulario
 * @returns {boolean} - true si todos los campos son válidos, false si alguno no lo es
 */
function validateForm() {
    let isValid = true;

    if (!isValidInput(taskTitleInput.value)) {
        showError(taskTitleError, 'El título no puede estar vacío.');
        isValid = false;
    } else {
        clearError(taskTitleError);
    }

    if (!isValidInput(taskDescriptionInput.value)) {
        showError(taskDescriptionError, 'La descripción no puede estar vacía.');
        isValid = false;
    } else {
        clearError(taskDescriptionError);
    }

    if (!isValidInput(taskStatusInput.value)) {
        showError(taskStatusError, 'Debes seleccionar un estado.');
        isValid = false;
    } else {
        clearError(taskStatusError);
    }

    return isValid;
}

/**
 * Obtiene la fecha y hora actual formateada
 * @returns {string} - Fecha y hora en formato legible
 */
function getCurrentTimestamp() {
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
 * Obtiene las iniciales de un nombre
 * @param {string} name - Nombre completo
 * @returns {string} - Iniciales en mayúsculas
 */
function getInitials(name) {
    // Eliminar espacios en blanco al inicio y al final del nombre
    const trimmedName = name.trim();
    // Separar el nombre en palabras usando expresiones regulares para manejar múltiples espacios
    const words = trimmedName.split(/\s+/);
    // Si hay solo una palabra, retornar las dos primeras letras en mayúsculas
    if (words.length === 1) {
        return words[0].substring(0, 2).toUpperCase();
    } else {
        // Si hay múltiples palabras, tomar la primera letra de cada una, unirlas y convertir a mayúsculas
        return words.map(word => word[0]).join('').toUpperCase();
    }
}

/**
 * Actualiza el contador de mensajes
 */
function updateMessageCount() {
    messageCount.textContent = `${totalMessages} mensaje${totalMessages !== 1 ? 's' : ''}`;
}

/**
 * Oculta el estado vacío (mensaje cuando no hay mensajes)
 */
function hideEmptyState() {
    emptyState.classList.add("hidden");
}

/**
 * Muestra el estado vacío (mensaje cuando no hay mensajes)
 */
function showEmptyState() {
    emptyState.classList.remove("hidden");
}

/**
 * Valida un usuario consultando la API mediante el ID ingresado.
 * Si el usuario existe, muestra su información y habilita el formulario junto con la zona de mensajes posteados.
 * Si no existe, muestra un mensaje de error.
 */
async function validateUser() {
    const id = documentoInput.value.trim();

    // Validación inicial: solo números y no vacío
    if (!id || isNaN(id)) {
        alert("Debe ingresar un ID válido (solo números).");
        documentoInput.value = "";
        documentoInput.focus();
        return;
    }

    try {
        // Busca al usuario por el id
        const response = await fetch(`http://localhost:3000/users/${id}`);

        // Mensaje en caso de que no se encuentre al usuario
        if (!response.ok) {
            throw new Error("Usuario no encontrado");
        }

        // Guardamos los datos del usuario anteriormente consultado en "user" => "currentUser"
        const user = await response.json();
        currentUser = user;

        // Accedemos al nombre y email del usuario
        userNameDisplay.textContent = user.name;
        userEmailDisplay.textContent = user.email;

        // Removemos la clase "hidden" para permitir el acceso completo al usuario
        userInfoSection.classList.remove('hidden');
        formulario.classList.remove('hidden');
        areaMensajes.classList.remove('hidden');

        // Si el usuario tiene tareas anteriormente registradas, se muestran en la tabla de tareas
        await loadUserTasks(user.id);

        // Confirmacion y saludo para el usuario
        alert(`Hola ${user.name}.`);

        // Mostrar en consola la informacion del usuario
        console.log(currentUser)

        // Limpiamos el input 
        documentoInput.value = "";

    } catch (error) {
        currentUser = null;

        // Ocultar secciones
        userInfoSection.classList.add('hidden');
        formulario.classList.add('hidden');
        areaMensajes.classList.add('hidden');

        alert("Usuario no encontrado.");

        // Limpiar y reenfocar input
        documentoInput.value = "";
        documentoInput.focus();
    }
}


// ============================================
// 3. CREACIÓN DE ELEMENTOS
// ============================================

/**
 * Crea un nuevo elemento de mensaje en el DOM
 * @param {string} tituloForm - Titulo de la tarea
 * @param {string} descripcionForm - Descripcion de la tarea
 * @param {string} estadoForm - Estado de la tarea
 */
function createMessageElement(tituloForm, descripcionForm, estadoForm) {
    // Crea el contenedor principal del mensaje
    const messageCard = document.createElement('div');
    messageCard.classList.add('message-card');

    // Crea la estructura interna del mensaje
    const timestamp = getCurrentTimestamp();

    // AGREGAR DOS BOTONES (BORRAR & EDITAR)
    messageCard.innerHTML = `
        <div class="message-card__header">
            <div class="message-card__user">
                <div class="message-card__avatar">${getInitials(currentUser.name)}</div>
                <span class="message-card__username">${tituloForm}</span>
            </div>
            <span class="message-card__timestamp">${timestamp}</span>
        </div>
        <div class="message-card__content">
            <p><strong>Descripción:</strong> ${descripcionForm}</p>
            <p><strong>Estado:</strong> ${estadoForm}</p>
        </div>
        <div class="message-card__actions"> 
        <button class="btn-edit">Editar</button> 
        <button class="btn-delete">Eliminar</button> 
        </div>
        `;

    // Inserta el nuevo elemento en el contenedor de mensajes
    messagesContainer.insertBefore(messageCard, messagesContainer.firstChild);

    // Incrementar el contador de mensajes
    totalMessages++;

    // Actualiza el contador visual
    updateMessageCount();

    // Oculta el estado vacío si está visible
    hideEmptyState();
}


// ============================================
// 4. MANEJO DE EVENTOS
// ============================================

/**
 * Maneja el evento de envío del formulario
 * @param {Event} event - Detiene la marcha del submit
*/
async function handleTaskSubmit(event) {
    // Detiene el submit
    event.preventDefault();

    // Valida que haya un usuario registrado
    if (!currentUser) {
        alert("Primero debes validar un usuario.");
        return;
    }

    // Valida que el form no se encuentre vacio
    if (!validateForm()) {
        return;
    }

    // Crea el body del POST
    const newTask = {
        userId: currentUser.id,
        title: taskTitleInput.value.trim(),
        description: taskDescriptionInput.value.trim(),
        status: taskStatusInput.value
    };

    try {
        const response = await fetch("http://localhost:3000/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTask)
        });

        // Verifica que se registre correctamente
        if (!response.ok) throw new Error("Error al registrar la tarea");

        // Se guarda la informacion de la tarea
        const savedTask = await response.json();
        console.log("Tarea registrada:", savedTask);

        // Crea el elemento para guardar la tarea
        createMessageElement(
            savedTask.title,
            savedTask.description,
            savedTask.status
        );

        // Resetea el formulario y focaliza en el input del titulo
        taskForm.reset();
        taskTitleInput.focus();

    } catch (error) {
        alert("No se pudo registrar la tarea.");
        console.error(error);
    }
}

/**
 * Si el usuario tenia tareas guardadas, las muestra.
 */
async function loadUserTasks(userId) {
    try {
        const response = await fetch(`http://localhost:3000/tasks?userId=${userId}`);
        if (!response.ok) throw new Error("Error cargando tareas");

        const tasks = await response.json();

        // Limpiar contenedor antes de pintar
        const existingCards = messagesContainer.querySelectorAll('.message-card');
        existingCards.forEach(card => card.remove());
        totalMessages = 0;

        if (tasks.length === 0) {
            showEmptyState();
            updateMessageCount();
            return;
        }

        tasks.forEach(task => {
            createMessageElement(
                task.title,
                task.description,
                task.status
            );
        });

    } catch (error) {
        console.error("Error cargando tareas:", error);
    }
}



/**
 * Limpia los errores cuando el usuario empieza a escribir
*/
function handleInputChange(input, errorElement) {
    clearError(errorElement);
}


// ============================================
// 5. REGISTRO DE EVENTOS
// ============================================

// Evento para validar al usuario con id
validateBtn.addEventListener("click", validateUser);

// Evento para enviar el formulario de tareas
taskForm.addEventListener("submit", handleTaskSubmit);

// Eventos para limpiar errores al escribir
taskTitleInput.addEventListener('input', () => clearError(taskTitleError));
taskDescriptionInput.addEventListener('input', () => clearError(taskDescriptionError));
taskStatusInput.addEventListener('change', () => clearError(taskStatusError));
<<<<<<< HEAD:servidor/script.js
=======


// ============================================
// 6. REFLEXIÓN Y DOCUMENTACIÓN
// ============================================

/**
 * PREGUNTAS DE REFLEXIÓN:
 * 
 * 1. ¿Qué elemento del DOM estás seleccionando?
 *    R: 
 * 
 * 2. ¿Qué evento provoca el cambio en la página?
 *    R: 
 * 
 * 3. ¿Qué nuevo elemento se crea?
 *    R: 
 * 
 * 4. ¿Dónde se inserta ese elemento dentro del DOM?
 *    R: 
 * 
 * 5. ¿Qué ocurre en la página cada vez que repites la acción?
 *    R: 
 */
>>>>>>> main:script.js


// ============================================
// 7. INICIALIZACIÓN (OPCIONAL)
// ============================================

/**
 * Esta función se ejecuta cuando el DOM está completamente cargado
 */
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ DOM completamente cargado');
    console.log('📝 Aplicación de registro de mensajes iniciada');

    // Aquí puedes agregar cualquier inicialización adicional
    // Por ejemplo, cargar mensajes guardados del localStorage
});


// ============================================
// 8. FUNCIONALIDADES ADICIONALES (BONUS)
// ============================================

/**
 * RETOS ADICIONALES OPCIONALES:
 * 
 * 1. Agregar un botón para eliminar mensajes individuales
 * 2. Implementar localStorage para persistir los mensajes
 * 3. Agregar un contador de caracteres en el textarea
 * 4. Implementar un botón para limpiar todos los mensajes
 * 5. Agregar diferentes colores de avatar según el nombre del usuario
 * 6. Permitir editar mensajes existentes
 * 7. Agregar emojis o reacciones a los mensajes
 * 8. Implementar búsqueda/filtrado de mensajes
 */