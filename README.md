# Nuestro Calendario

Calendario web compartido para parejas. Prototipo funcional con almacenamiento local.

## Características

- 4 vistas: **Día, Semana, Mes y Año**.
- Eventos con título, descripción, **categoría con color**, fecha o rango de fechas, hora/rango horario opcional.
- **Recurrencias**: semanal, mensual o anual; cada N unidades; con o sin fecha de fin.
- **8 categorías por defecto** (Citas, Cumpleaños, Trabajo, Tareas del hogar, Compras, Comidas, Salud, Viajes/Ocio) totalmente editables: nombre, color e icono.
- **Dos modos**:
  - **Editor**: añadir, modificar y borrar eventos.
  - **Visualizador**: pantalla limpia con los eventos de hoy. Ideal para dejar abierto en una tablet.
- Responsive: PC, tablet y móvil (con barra inferior en móvil).
- Persistencia automática en `localStorage` (próximo paso: Firebase + login con Google para compartir entre tú y tu pareja).

## Arrancar el proyecto

Necesitas tener **Node.js 18+** instalado. Desde la carpeta del proyecto:

```bash
npm install
npm run dev
```

Se abrirá automáticamente en `http://localhost:5173`.

Para compilar la versión final (carpeta `dist/`):

```bash
npm run build
npm run preview   # para verla en local
```

## Estructura

```
src/
  App.jsx                     # Componente raíz: orquesta estado y vistas
  main.jsx                    # Punto de entrada
  index.css                   # Tailwind + estilos base
  lib/
    events.js                 # Lógica de eventos y recurrencias (puro JS)
    storage.js                # Persistencia (localStorage; se migrará a Firebase)
  data/
    defaults.js               # Categorías por defecto, paleta de colores
  components/
    Header.jsx                # Cabecera con navegación, vistas, modo
    MobileTabBar.jsx          # Barra inferior móvil
    MonthView.jsx             # Vista mensual (la más mimada)
    WeekView.jsx              # Vista semanal
    DayView.jsx               # Vista diaria
    YearView.jsx              # Vista anual (12 mini-meses)
    EventModal.jsx            # Modal de creación/edición de eventos
    CategoriesPanel.jsx       # Gestión de categorías
    ViewerMode.jsx            # Modo visualizador (solo lectura)
    icons.jsx                 # Iconos SVG inline (sin dependencias)
```

## Próximos pasos previstos

1. **Firebase Authentication** con Google: cada miembro de la pareja entra con su cuenta.
2. **Firestore** para sincronización en tiempo real entre dispositivos.
3. **Despliegue** en Vercel o Netlify.
4. **Relaciones entre eventos** (por ejemplo: vincular una compra a una comida del menú semanal).
5. Notificaciones push opcionales.

## Cómo migrar a Firebase (cuando llegue el momento)

Toda la persistencia está aislada en `src/lib/storage.js`. Habrá que reemplazar las funciones por suscripciones a Firestore y un `AuthContext` para el login. La UI no se toca.
