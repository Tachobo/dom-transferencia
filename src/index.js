// ========================================
// JAVASCRIPT PARA EL ARCHIVO "login.html"
// ========================================

import { validateUserService } from "./services/userService.js";
import { showNotification } from "./ui/notificationsUI.js";

const validateBtn = document.getElementById("validateBtn");
const documentoInput = document.getElementById("documento");

// ================= VALIDAR USUARIO =================
/**
 * Evento para validar el usuario a partir del ID ingresado.
 * - Llama a `validateUserService` para obtener datos del usuario
 * - Si existe, carga las tareas del usuario y renderiza la UI
 */
validateBtn.addEventListener("click", async () => {
    const document = documentoInput.value.trim();

    documentoInput.value = "";
    documentoInput.blur();

    if (!document || isNaN(document)) {
        showNotification("ID inválido. Por favor, ingresa un número.", "warning");
        return;
    }

    try {
        let currentUser = await validateUserService(document);

        if (currentUser == null) {
            showNotification("Usuario no registrado.", "error");
            return;
        }

        // se guarda el usuario que acaba de ingresar
        localStorage.setItem('usuarioActivo', JSON.stringify(currentUser));

        // se envia al archivo correspondiente al rol
        if (currentUser.role == "user") {
            window.location.href = "user.html";
            return
        } else if (currentUser.role == "admin") {
            window.location.href = "admin.html";
            return
        }


    } catch (error) {
        showNotification("Usuario no encontrado en la base de datos.", "error");
        console.log("Se ha presentado un error: " + error)
    }
});



// ================= AL INICIAR EL DOCUMENTO =================
document.addEventListener("DOMContentLoaded", () => {
    //si ingresa con un un registro en el localStorage/usuarioActivo, este se elimina
    if (localStorage.getItem('usuarioActivo')) {
        console.log("Se ha cerrado la anterior seccion.")
        localStorage.removeItem('usuarioActivo')
    }

    // focalizamos en el input
    documentoInput.focus();
})

