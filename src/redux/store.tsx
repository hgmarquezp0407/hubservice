// redux/store.tsx

"use client";
import { configureStore } from "@reduxjs/toolkit";
import reducer from "./reducer";
// import modulesReducer from "./slices/modulesSlice";

const store = configureStore({
    reducer: {
        theme:   reducer,      // reducer existente — sin cambios
        // modules: modulesReducer,
    },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;



// "use client";
// import { configureStore } from "@reduxjs/toolkit";
// import reducer from "./reducer";

// const store = configureStore({
//   reducer: reducer,
// });

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;

// export default store;