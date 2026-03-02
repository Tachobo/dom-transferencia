# Documentación técnica del proyecto

Resumen técnico y descripción de los archivos principales en `src/`.

## Estructura general

- `src/main.js`: Control principal de la aplicación, registra listeners y orquesta llamadas a los servicios y a la UI.
- `src/api/`: Adaptadores HTTP que comunican con el backend (json-server).
- `src/services/`: Lógica de negocio (validaciones, filtrado, composición de procesos).
- `src/ui/`: Funciones que manipulan el DOM y muestran datos/estado.
- `src/utils/`: Helpers reutilizables.

---

## `src/main.js`

Responsabilidad:
- Punto de entrada de la app en navegador.
- Registra eventos para: validar usuario, crear tareas, aplicar filtros/orden y exportar.

Funciones / flujo clave:
- `validateBtn` click: llama a `validateUserService(id)`, obtiene `tasksUser` con `getTasksByUser`, renderiza con `renderTasks` y controla UI (`showUserUI`, `hideUserUI`).
- `taskForm` submit: valida con `validateForm`, construye objeto tarea y guarda con `saveTask`, refresca lista y aplica `orderFilter` si hay filtros.
- `applyFiltersBtn` click: llama a `orderFilter`.
- `exportTasksBtn` click: serializa tareas visibles con `generateTasksJSON` y descarga con `downloadJSONFile`.

Notas:
- Mantiene estados en memoria: `currentUser`, `tasksUser`, `currentFilteredTasks`.
- Usa notificaciones con `showNotification`.

---

## `src/api/tasksApi.js`

Responsabilidad:
- Encapsula llamadas HTTP a `/tasks` del servidor.

Exportadas:
- `fetchTasks()`: GET `/tasks` → Promise<Array>.
- `createTask(task)`: POST `/tasks` → Promise<Object>.
- `updateTaskApi(id, updatedData)`: PATCH `/tasks/{id}` → Promise<Object>.
- `deleteTaskApi(id)`: DELETE `/tasks/{id}` → Promise<boolean>.

Errores:
- Lanza `Error` cuando `response.ok` es falso; los servicios consumidores deben capturarlos.

---

## `src/api/usersApi.js`

Responsabilidad:
- Solicitar datos de usuario al endpoint `/users/{id}`.

Exportadas:
- `fetchUserById(id)`: GET `/users/{id}` → Promise<Object|null>. Devuelve `null` si la respuesta no es OK.

---

## `src/services/userService.js`

Responsabilidad:
- Lógica mínima para validar/obtener usuario (wrapping de la API).

Exportadas:
- `validateUserService(id)`: llama a `fetchUserById` y retorna el usuario o `null`.

---

## `src/services/tasksService.js`

Responsabilidad:
- Lógica relacionada con las tareas: obtención por usuario, guardado, filtrado, orden y validación de formulario.

Exportadas y comportamiento:
- `getTasksByUser(userId)`: devuelve las tareas cuyo `userId` coincide.
- `saveTask(task)`: delega en `createTask` de la API.
- `filterTasks(tasks, estados)`: devuelve tareas cuyo `status` esté en `estados`.
- `sortTasks(tasks, criterio)`: ordena por fecha, nombre o prioridad de estado.
- `validateForm(...)`: valida inputs del formulario y gestiona mensajes de error via `showError`/`clearError`.
- `orderFilter(filterStatus, sortTasksArea, container, currentUser)`: combina obtención de tareas, procesamiento (filtrado + orden) y render.

Notas:
- `sortTasks` devuelve una copia ordenada para evitar mutaciones del array original.

---

## `src/services/exportService.js`

Responsabilidad:
- Serializar la colección de tareas en JSON formateado listo para descarga.

Exportadas:
- `generateTasksJSON(tasks)`: `JSON.stringify(tasks, null, 2)`.

---

## `src/ui/tasksUI.js`

Responsabilidad:
- Renderizado de las tarjetas de tareas, manejo inline de edición y eliminación.

Funciones importantes:
- `renderTasks(container, tasks, currentUser)`: limpia el contenedor e inserta tarjetas; si está vacía llama a `tasksNull()`.
- `makeEditable(card, task)`: transforma la tarjeta en un pequeño formulario inline; guarda via `updateTaskApi` y actualiza la UI con la respuesta.
- `tasksNull(container)`: bloque HTML para estado vacío.
- `resetFiltersUI(filterStatus, sortTasks)`: limpia checkboxes y select.

Notas:
- Las acciones de editar/eliminar usan los endpoints de `src/api/tasksApi.js`.

---

## `src/ui/uiState.js`

Responsabilidad:
- Utilidades simples para mostrar/ocultar secciones y para mostrar errores en campos.

Exportadas:
- `showUserUI`, `hideUserUI`, `showEmpty`, `hideEmpty`, `showError`, `clearError`.

---

## `src/ui/notificationsUI.js`

Responsabilidad:
- Mostrar toasts temporales en `#notification-container` con tipos: `info|success|error|warning`.

Comportamiento:
- Añade elemento DOM, aplica clase segun tipo y lo elimina después de un timeout (animación de salida incluida).

---

## `src/ui/exportUI.js`

Responsabilidad:
- Disparar la descarga de un archivo JSON en el navegador.

Exportadas:
- `downloadJSONFile(content, fileName)`: crea `Blob`, genera URL y simula click para descargar.

---

## `src/utils/helpers.js`

Responsabilidad:
- Funciones pequeñas reutilizables:
  - `isValidInput(value)`: valida texto no vacío.
  - `getCurrentTimestamp()`: formatea fecha/hora en `es-ES`.
  - `getInitials(name)`: obtiene iniciales para avatar.
  - `getSelectedValues(checkboxes)`: extrae valores marcados.
  - `processTasks(tasks, estados, sort, filterFn, sortFn)`: compone filtrado + orden.

---

## Notas finales y recomendaciones

- El backend esperado es un servidor REST simple (por ejemplo `json-server`) con recursos `users` y `tasks` (ver `db.json`).
- Los adapters en `src/api/` lanzan errores en caso de respuestas no-ok; manejar `try/catch` en flujos asíncronos del frontend es recomendable.
- Para tests unitarios: las funciones puras en `src/services/` y `src/utils/` son buenas candidatas para mockear las APIs y probar la lógica.

---

Archivo generado automáticamente por la tarea de documentación. Si quieres un tono más "principiante" o ejemplos de uso concretos para cada función, dime y lo adapto.
