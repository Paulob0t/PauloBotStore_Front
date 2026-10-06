<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:6366f1,50:8b5cf6,100:ec4899&height=240&section=header&text=PauloBot%20Store%20•%20Frontend&fontSize=42&fontAlignY=38&animation=fadeIn&desc=Modern%20eCommerce%20%26%20Vending%20POS%20SPA%20built%20with%20Angular%2022%20%26%20Tailwind%20CSS%20v4&descSize=16&descAlignY=62" width="100%" />

  <p align="center">
    <a href="https://github.com/Paulob0t/PauloBot_Store_Front">
      <img src="https://img.shields.io/badge/Angular-22%20Standalone-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 22" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    </a>
    <a href="https://vite.dev/">
      <img src="https://img.shields.io/badge/Vite-Bundler-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    </a>
    <a href="https://swagger.io/">
      <img src="https://img.shields.io/badge/OpenAPI-CodeGen-85EA2D?style=for-the-badge&logo=openapi-initiative&logoColor=black" alt="OpenAPI" />
    </a>
    <a href="https://podman.io/">
      <img src="https://img.shields.io/badge/Podman-PostgreSQL-892CA0?style=for-the-badge&logo=podman&logoColor=white" alt="Podman" />
    </a>
  </p>

  <p align="center">
    <strong>Plataforma frontend desacoplada de alto rendimiento para tiendas de autoservicio inteligente (Vending Machines) y punto de venta eCommerce.</strong>
  </p>
</div>

<br />

---

## 🌟 Características Principales

- ⚡ **Angular 22 Standalone Architecture:** Componentes independientes, carga diferida (*Lazy Loading*) y cero sobrecarga de `NgModules`.
- 🔄 **Gestión de Estado Reactiva con Signals:** Reactividad nativa ultrarrápida con `signal()`, `computed()` y `effect()` para carrito de compras, catálogo de productos y filtros.
- 🎨 **Estilizado Moderno con Tailwind CSS v4:** Motor de estilos ultra ligero con temas fluidos, animaciones suaves y diseño *Mobile-First*.
- 🛒 **Storefront Interactivo:**
  - **Hero Banner:** Bienvenida comercial con atención 24/7.
  - **Carrusel de Destacados:** Auto-desplazamiento suave con pausa interactiva al tocar o pasar el cursor.
  - **Carrusel Infinito de Categorías:** Navegación circular sin fin con scroll optimizado.
  - **Drawer de Carrito Reactivo:** Modificación instantánea de cantidades y cálculo de total en tiempo real.
- 📊 **Panel Administrativo Completo:**
  - Dashboard interactivo con métricas clave (KPIs) y gráficos de ventas de los últimos 7 días.
  - ABM completo de Productos, Categorías y Subcategorías.
  - Control de Cortes de Caja, Gestión de Usuarios y Consulta de Movimientos.
- 🔌 **Generación de Clientes API Type-Safe:** Integración con Swagger/OpenAPI mediante `ng-openapi-gen` para tipado estricto extremo con el Backend.

---

## 🏛️ Arquitectura del Sistema

```mermaid
flowchart TD
    subgraph Client ["🌐 Navegador / PWA"]
        UI["🖥️ UI Layer (Angular Standalone Components)"]
        StoreUI["🏪 Storefront (/store)"]
        AdminUI["📊 Admin Panel (/admin)"]
        HomeUI["🏠 Landing Portal (/)"]
    end

    subgraph State ["⚡ Reactive State Layer (Signals)"]
        CartSignal["🛒 CartService (Signals + Storage)"]
        ProdSignal["📦 ProductService"]
        CatSignal["🏷️ CategoryService"]
        AuthSignal["🔐 AuthService"]
    end

    subgraph ApiGen ["📡 Generated API Client (ng-openapi-gen)"]
        HttpServices["Type-Safe Services"]
        Models["TypeScript Models & DTOs"]
    end

    subgraph Backend ["🔙 REST Backend & Database"]
        API["🐍 Python FastAPI REST API (Port 8000)"]
        DB[("🐘 PostgreSQL (Podman / Port 5432)")]
    end

    HomeUI --> StoreUI & AdminUI
    StoreUI --> UI
    AdminUI --> UI

    UI --> CartSignal & ProdSignal & CatSignal & AuthSignal
    CartSignal & ProdSignal & CatSignal & AuthSignal --> HttpServices
    HttpServices --> Models
    HttpServices -->|JSON / HTTP REST| API
    API --> DB
```

---

## 📂 Estructura del Directorio

```text
PauloBot_Store_front/
├── public/                     # Recursos estáticos públicos (logos, iconos)
├── src/
│   ├── app/
│   │   ├── api/                # Clientes y DTOs generados por OpenAPI
│   │   │   ├── fn/             # Funciones de consulta a endpoints
│   │   │   ├── models/         # Interfaces de datos TypeScript
│   │   │   └── services/       # Servicios inyectables de API
│   │   ├── components/         # Componentes UI reutilizables
│   │   │   ├── banner/         # Hero banner del storefront
│   │   │   ├── carousel/       # Carrusel infinito de categorías & destacados
│   │   │   ├── cart-drawer/    # Drawer lateral de carrito de compras
│   │   │   └── header/         # Barra superior de navegación y búsqueda
│   │   ├── pages/              # Vistas y Rutas principales
│   │   │   ├── admin/          # Módulos del panel administrativo
│   │   │   │   ├── cash-register/  # Control y cortes de caja
│   │   │   │   ├── categories/     # Gestión de categorías y subcategorías
│   │   │   │   ├── dashboard/      # Dashboard con métricas y gráficas
│   │   │   │   ├── movements/      # Historial de ventas y movimientos
│   │   │   │   ├── products/       # Alta, edición y listado de productos
│   │   │   │   └── users/          # Administración de usuarios
│   │   │   ├── home/           # Pantalla de bienvenida / selector de portal
│   │   │   └── store/          # Catálogo principal de la tienda vending
│   │   ├── services/           # Servicios de estado reactivo (Signals)
│   │   ├── app.config.ts       # Configuración global de Angular & Providers
│   │   └── app.routes.ts       # Definición de rutas y Lazy Loading
│   ├── assets/                 # Imágenes y recursos multimedia
│   ├── main.ts                 # Punto de entrada de la aplicación
│   └── styles.css              # Configuración y directivas de Tailwind CSS v4
├── angular.json                # Configuración de compilación y dev-server
├── package.json                # Dependencias y scripts del proyecto
└── tsconfig.json               # Configuración del compilador TypeScript
```

---

## 🗺️ Mapa de Rutas de la Aplicación

| Ruta | Componente | Descripción |
| :--- | :--- | :--- |
| `/` | `HomeComponent` | Pantalla de inicio para seleccionar portal (Tienda o Admin). |
| `/store` | `StoreComponent` | Tienda interactiva con catálogo, filtros, carrusel y carrito. |
| `/login` | `LoginComponent` | Autenticación y acceso al panel de administración. |
| `/admin` | `DashboardComponent` | Panel de control con métricas en tiempo real y KPIs. |
| `/admin/productos` | `ProductListComponent` | Catálogo administrativo de inventario y productos. |
| `/admin/productos/nuevo`| `ProductFormComponent` | Formulario para agregar / editar productos con subida de imagen. |
| `/admin/categorias` | `CategoryListComponent`| Gestión integral de categorías comerciales. |
| `/admin/subcategorias`| `SubcategoryListComponent`| Control de subcategorías vinculadas. |
| `/admin/movimientos` | `MovementListComponent`| Auditoría y consulta de tickets y ventas realizadas. |
| `/admin/cortes-caja` | `CashRegisterComponent`| Control de aperturas, retiros y cortes de caja. |
| `/admin/usuarios` | `UserListComponent` | Gestión de cuentas y privilegios de usuarios. |
| `/admin/configuracion`| `CompanyConfigComponent`| Parámetros generales y datos de la empresa. |

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone git@github.com:Paulob0t/PauloBot_Store_Front.git
cd PauloBot_Store_Front
```

### 2. Instalar dependencias
```bash
npm install
# o si usas pnpm:
pnpm install
```

### 3. Iniciar el servidor de desarrollo
```bash
npm start
```
El frontend estará disponible en `http://localhost:4200/` con recarga en caliente automática (*HMR / Live-Reload*).

### 4. Regenerar servicios API TypeScript (OpenAPI)
Si actualizaste endpoints en el backend, puedes sincronizar los contratos de datos automáticamente:
```bash
npm run api:generate:remote
```

---

## 🛠️ Tech Stack

<div align="left">

| Tecnología | Descripción |
| :--- | :--- |
| **Angular 22** | Framework frontend de última generación con soporte nativo de Standalone Components y Signals. |
| **TypeScript 6.0** | Tipado estático robusto y contratos de interfaz estrictos. |
| **Tailwind CSS v4** | Utilidades CSS atómicas ultrarrápidas para diseño responsivo moderno. |
| **Vite / Angular Build** | Compilador y empaquetador ultrarrápido con soporte ESNext. |
| **OpenAPI / Swagger** | Generación automatizada de clientes de red HTTP mediante `ng-openapi-gen`. |
| **RxJS & Angular Signals** | Manejo de flujos asíncronos y reactividad fina sin fugas de memoria. |

</div>

---

<div align="center">
  <sub>Desarrollado con ❤️ y Clean Code por <a href="https://github.com/Paulob0t"><strong>Paulo Essau (Paulob0t)</strong></a></sub>
</div>
