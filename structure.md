sigit/                    # Frontend con Next.tsx 15 y TypeScript
├── public/                   # Archivos públicos
│   ├── assets/                # Recursos estáticos
├── src/                      # Código fuente
│   ├── app/                   # Páginas de Next.js
│   │   ├── 403/               # 
│   │   │   └── page.tsx       # 
│   │   ├── 505/               # 
│   │   │   └── page.tsx       #  
│   │   ├── admin/              # Panel de administración del superadministrador
│   │   │   ├── home/            
│   │   │   |   └── page.tsx           
│   │   │   ├── cpumodels/            
│   │   │   |   └── page.tsx           
│   │   │   ├── equipmentcategories/            
│   │   │   |   └── page.tsx           
│   │   │   ├── equipmentmodels/        # Crud COMPLEJO EJEMPLO para usar         
│   │   │   |   └── page.tsx            
│   │   │   ├── settings/        # Carpeta que contiene todos los CRUD's de catálogo o de Administración      
│   │   │   |   ├── areas/        
│   │   │   |   |   └── page.tsx     
│   │   │   |   ├── branches/        
│   │   │   |   |   └── page.tsx     
│   │   │   |   ├── charges/            # Crud Simple Ejemplo
│   │   │   |   |   └── page.tsx     
│   │   │   |   ├── sites/        
│   │   │   |   |   └── page.tsx     
│   │   │   |   └── page.tsx/      # Menú que me permite acceder a los catálogos
│   │   │   ├── users/            
│   │   │   |   └── page.tsx         
│   │   │   ├── ...
│   │   │   └── layout.tsx/      # Diseño del panel de administración 
│   │   ├── api/                 # 
│   │   │   ├── auth/  
│   │   │   |   ├── login/   
│   │   │   |   |   └── route.ts/    
│   │   │   |   ├── logout/   
│   │   │   |   |   └── route.ts/    
│   │   │   |   ├── me/   
│   │   │   |   |   └── route.ts/    
│   │   │   |   └── refresh/   
│   │   │   |       └── route.ts/    
│   │   │   └── health/              # 
│   │   │       └── route.ts         # 
│   |   ├── components/          # Componentes compartidos y personalidas de los cruds
│   │   |   ├── Providers.tsx
│   │   |   ├── @spk-reusable-components/  # Componentes reutilizables
│   │   |   |   ├── reusable-advancedui/  # UI avanzada reutilizable
│   │   |   |   ├── reusable-apps/  # UI avanzada reutilizable
│   │   |   |   ├── reusable-dashboard/  # UI avanzada reutilizable
│   │   |   |   ├── reusable-pages/  # UI avanzada reutilizable
│   │   |   |   ├── reusable-plugins/  # UI avanzada reutilizable
│   │   |   |   ├── reusable-tables/  # UI avanzada reutilizable
│   │   |   |   ├── reusable-uielements/  # UI avanzada reutilizable
│   │   |   |   └── reusable-widgets/  # UI avanzada reutilizable
|   │   |   ├── layouts/          # Componente para volver al inicio
|   |   │   |   ├── backtotop/          # Componente para volver al inicio
│   │   |   |   |   └── backtotop.tsx           # Componente para volver al inicio
|   |   │   |   ├── header/                     # Encabezado de la aplicación
│   │   |   |   |   └── |header.tsx             # Componente de encabezado
│   │   |   |   ├── loader/                     # Loader de la aplicación
│   │   |   |   |   └── loader.tsx              # Componente de carga
│   │   |   |   ├── page-header/                # Encabezado de la página
│   │   |   |   |   └── page-header.tsx         # Componente de encabezado de página
│   │   |   |   ├── seo/                        # Componente SEO
│   │   |   |   |   └── seo.tsx                 # Componente SEO
│   │   |   |   ├── showcode/                   # Componente para mostrar código
│   │   |   |   |   └── showcode.tsx            # Componente para mostrar código
│   │   |   |   ├── sidebar/                    # Barra lateral de la aplicación
│   │   |   |   |   ├── menuloop.tsx            # Componente de bucle de menú
│   │   |   |   |   ├── nav.tsx                 # Componente de navegación
│   │   |   |   |   └── sidebar.tsx             # Componente de barra lateral
│   │   |   |   ├── switcher/                   # Componente para cambiar entre diferentes vistas
│   │   |   |   |   ├── switcher.tsx            # Componente de conmutador
│   │   |   |   ├── footer/                     # Pie de página de la aplicación
│   │   |   |   |   └── footer.tsx              # Componente de pie de página
│   │   |   |   └── conextapi.tsx               # Contexto de la API
|   │   |   ├── cpumodels/                      # 
│   |   |   |   ├── AddCPUModelModal.tsx        # 
│   |   |   |   └── ViewCPUModelModal.tsx       # 
|   │   |   ├── equipmentmodels/                # Componentes Ejemplo personalizado para cualquier CRUD
│   |   |   |   ├── AddCPUModelModal.tsx        # Componente para agregar un nuevo registro
│   |   |   |   └── ViewCPUModelModal.tsx       # Componente para VER el detalle de un registro de este crud
│   |   |   ├── ... 
│   │   ├── context/                            # Contexto de la aplicación 
│   │   │   ├── AuthContext.ts
│   │   │   └── UserAdminContext.ts 
│   │   ├── hooks/                              # Hooks personalizados
│   │   │   ├── useAdmin.ts
│   │   │   ├── useCrud.ts
│   │   │   └── useModuleErrorHandler.ts 
│   │   ├── interfaces/         
│   │   |   ├── auth.ts           
│   │   |   ├── general_interface.ts 
│   │   |   └── middleware.ts   
│   │   └── providers/              # Vacío aún     
│   │   ├── page.module.css         # Estilos de la página          
│   │   ├── globals.css             # Estilos globales de la aplicación         
│   │   ├── globals.scss            # Estilos globales de la aplicación (SCSS)        
│   │   ├── layout.tsx              # Diseño de la página (layout)        
│   │   ├── not-found.tsx           # Estilos de la página de error 404          
│   │   ├── page.module.css         # Estilos de la página          
│   │   └── page.tsx                # Página de inicio (página web)          
|   ├── redux/                  # Estado global con Redux (esto aún no lo he implementado), no he usado hasta el momento
|   |   ├── store.tsx           # Almacenamiento de Redux
|   |   ├── actions.tsx         # Acciones de Redux
|   |   └── store.tsx           # 
│   └── utils/          
│       ├── api.ts               # Funciones para llamadas a la API         
│       ├── themeUpdater.ts      #         
│       └──validators.ts        # Validaciones        
├── middleware.ts        # Middleware de Next.js
├── .env                 # Variables de entorno
├── .env.local           # Variables de entorno 
├── .env.test            # Variables de entorno para pruebas
├── .gitignore           # Archivos ignorados por Git
├── next.config.tsx      # Configuración de Next.js
├── package.json         # Dependencias y scripts de npm
├── package-lock.json    # Bloqueo de versiones de dependencias
├── README.md            # Documentación del proyecto
└── tsconfig.json        # Configuración de TypeScript