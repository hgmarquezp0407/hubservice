# Sistema de Gestión de Infraestructura Tecnológica - SUNAT


## 🚀 Características Principales


## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15.5.12 (App Router)
- **Lenguaje**: TypeScript 5
- **UI Framework**: React Bootstrap 2.10.7
- **Gráficos**: ApexCharts + React-ApexCharts
- **Estado & Fetching**: Custom hooks con fetch API
- **Notificaciones**: React-Toastify 10.0.6
- **Autenticación**: JWT + Cookie-based con httpOnly
- **Iconos**: Remix Icons

## 📋 Prerequisitos

- Node.js 18.x o superior
- npm, yarn, pnpm o bun
- Acceso al backend FastAPI (configurar en variables de entorno)

## 🔧 Instalación

### 1. Clonar el repositorio
```bash
git clone 
cd frontend
```

### 2. Instalar dependencias
```bash
npm install 
npm install --legacy-peer-deps
# or
yarn install
# or
pnpm install
# or
bun install
```

### 3. Configurar variables de entorno
Crear archivo `.env.local` en la raíz:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 4. Iniciar servidor de desarrollo
```bash

"dev": "next dev --turbopack -H 0.0.0.0 -p 3946",
"dev": "next dev --turbopack -H -p 3000",


npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 🔑 Componentes Principales

## 🚀 Build para Producción
```bash
# Crear build optimizado
npm run build

# Iniciar servidor de producción
npm run start
```


## 📄 Licencia

**Proprietary License - Software Privado**

© 2026 SUNAR Perú. Todos los derechos reservados.

Este proyecto es de uso interno y confidencial. Prohibida su distribución o reproducción sin autorización expresa.

## 👥 Contribuidores

[Listar contribuidores]

## 📞 Soporte

Para soporte técnico: [email/contacto]