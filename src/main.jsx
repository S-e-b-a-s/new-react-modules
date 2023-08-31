import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import AsignacionMetas from "./routes/AsignacionMetas";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import SubirExcelMetas from "./routes/SubirExcelMetas";
import ErrorPage from "./routes/ErrorPage";
import AnalisisMetas from "./routes/AnalisisMetas";

const theme = createTheme({
    typography: {
        fontFamily: [
            "Inter",
            "-apple-system",
            "BlinkMacSystemFont",
            '"Segoe UI"',
            "Roboto",
            '"Helvetica Neue"',
            "Arial",
            "sans-serif",
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(","),
    },
    palette: {
        primary: {
            main: "#0076A8",
        },
        secondary: {
            main: "#59CBE8",
        },
        text: {
            primary: "#131313",
            secondary: "#999999",
        },
    },
});

const router = createBrowserRouter([
    {
        path: "/asignacion-metas",
        element: <AsignacionMetas />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/subir-excel-metas",
        element: <SubirExcelMetas />,
        errorElement: <ErrorPage />,
    },
    {
        path: "/analisis-entrega-metas",
        element: <AnalisisMetas />,
        errorElement: <ErrorPage />,
    },
    {
        path: "*",
        element: <ErrorPage />,
    },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AnalisisMetas />
        </ThemeProvider>
    </React.StrictMode>
);
