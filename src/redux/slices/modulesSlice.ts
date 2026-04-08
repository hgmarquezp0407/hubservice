// // redux/slices/modulesSlice.ts

// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// export interface Module {
//     id:               number;
//     code:             string;
//     name:             string;
//     icon:             string | null;
//     url_path:         string | null;
//     menu_order:       number;
//     parent_module_id: number | null;
// }

// export interface ModuleTree extends Module {
//     children: ModuleTree[];
// }

// interface ModulesState {
//     items:   Module[];       // lista plana del backend
//     tree:    ModuleTree[];   // árbol para el menú
//     status:  "idle" | "loading" | "succeeded" | "failed";
//     error:   string | null;
// }

// // Estado inicial

// const initialState: ModulesState = {
//     items:  [],
//     tree:   [],
//     status: "idle",
//     error:  null,
// };

// // Thunk — fetch módulos del backend

// export const fetchModules = createAsyncThunk(
//     "modules/fetchModules",
//     async (_, { rejectWithValue }) => {
//         try {
//             const res = await fetch("/api/auth/modules", {
//                 credentials: "include",
//                 cache:       "no-store",
//             });

//             if (!res.ok) {
//                 const err = await res.json();
//                 return rejectWithValue(err.detail || "Error al cargar módulos");
//             }

//             const data: Module[] = await res.json();
//             return data;
//         } catch {
//             return rejectWithValue("Sin conexión con el servidor");
//         }
//     }
// );

// // Helper — lista plana → árbol 

// function buildTree(modules: Module[]): ModuleTree[] {
//     const map = new Map<number, ModuleTree>();

//     // Inicializar todos los nodos
//     modules.forEach(m => map.set(m.id, { ...m, children: [] }));

//     const roots: ModuleTree[] = [];

//     map.forEach(node => {
//         if (node.parent_module_id === null) {
//             roots.push(node);
//         } else {
//             const parent = map.get(node.parent_module_id);
//             if (parent) {
//                 parent.children.push(node);
//             }
//         }
//     });

//     // Ordenar por menu_order en cada nivel
//     const sort = (nodes: ModuleTree[]) => {
//         nodes.sort((a, b) => a.menu_order - b.menu_order);
//         nodes.forEach(n => sort(n.children));
//     };
//     sort(roots);

//     return roots;
// }

// // Slice

// const modulesSlice = createSlice({
//     name: "modules",
//     initialState,
//     reducers: {
//         // Limpiar módulos al hacer logout
//         clearModules(state) {
//             state.items  = [];
//             state.tree   = [];
//             state.status = "idle";
//             state.error  = null;
//         },
//     },
//     extraReducers: (builder) => {
//         builder
//             .addCase(fetchModules.pending, (state) => {
//                 state.status = "loading";
//                 state.error  = null;
//             })
//             .addCase(fetchModules.fulfilled, (state, action: PayloadAction<Module[]>) => {
//                 state.status = "succeeded";
//                 state.items  = action.payload;
//                 state.tree   = buildTree(action.payload);
//             })
//             .addCase(fetchModules.rejected, (state, action) => {
//                 state.status = "failed";
//                 state.error  = action.payload as string;
//             });
//     },
// });

// export const { clearModules } = modulesSlice.actions;
// export default modulesSlice.reducer;