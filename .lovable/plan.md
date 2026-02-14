

## Plan: Control de acceso a listas, fondo de medusas y fix del error de build

### 1. Corregir error de build en GroupsPage.tsx
El error ocurre porque `getAllUsers()` es una funcion asincrona (retorna `Promise<User[]>`), pero se llama de forma sincrona con `.filter()`. Se cambiara a usar `useState` + `useEffect` para cargar los usuarios de forma asincrona.

### 2. Agregar campo `createdBy` y `sharedWith` a las listas
Se modificara la interfaz `ShoppingList` en `src/lib/db.ts` para incluir:
- `createdBy`: ID del usuario que creo la lista
- `sharedWith`: Array de IDs de usuarios invitados

### 3. Filtrar listas por acceso del usuario
En `src/hooks/useLists.ts` y `src/pages/Index.tsx`, las listas se filtraran para mostrar solo aquellas donde el usuario es creador o esta en `sharedWith`. Los administradores veran todas las listas.

### 4. Funcionalidad de invitar usuarios a una lista
Se agregara en `src/pages/ListView.tsx` un boton/sheet para que el creador de la lista pueda invitar usuarios (seleccionandolos de la lista de usuarios existentes) y revocar acceso.

### 5. Imagen de fondo de medusas
Se copiara la imagen `jellyfish.jpg` a `public/images/` y se aplicara como fondo fijo de la aplicacion en `src/index.css`, con un overlay oscuro semi-transparente para mantener la legibilidad del contenido glass.

### 6. Actualizar API y backend
Se ajustara `src/lib/api.ts` para enviar `createdBy` al crear listas, y se agregaran endpoints para compartir/dejar de compartir listas (`POST /lists/:id/share`, `DELETE /lists/:id/share/:userId`). Tambien se actualizaran las rutas del servidor en `server/routes/lists.js`.

---

### Detalles tecnicos

**Archivos a modificar:**
- `src/lib/db.ts` - Agregar campos `createdBy` y `sharedWith` a la interfaz
- `src/lib/api.ts` - Agregar funciones `shareList()` y `unshareList()`
- `src/hooks/useLists.ts` - Pasar `userId` para filtrar listas por acceso, agregar funciones `shareList`/`unshareList`
- `src/pages/GroupsPage.tsx` - Fix del error: cargar usuarios con `useEffect` async
- `src/pages/Index.tsx` - Filtrar listas visibles por usuario actual
- `src/pages/ListView.tsx` - Agregar UI para gestionar invitados de la lista
- `src/pages/AdminPage.tsx` - Fix similar si usa `getAllUsers()` de forma sincrona
- `src/index.css` - Agregar fondo con la imagen de medusas
- `server/routes/lists.js` - Agregar rutas de compartir/dejar de compartir
- `server/database.js` - Agregar tabla `list_shares` y campos relacionados

**Archivo nuevo:**
- `public/images/jellyfish.jpg` - Imagen de fondo copiada desde uploads

