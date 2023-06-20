import { Container, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SnackbarAlert from "../components/SnackbarAlert";
import { useState, useEffect } from "react";

const AnalisisMetas = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [rows, setRows] = useState([]);

    useEffect(() => {
        const handleSave = async () => {
            try {
                const response = await fetch("http://172.16.5.10:8000/goals/", {
                    method: "GET",
                });

                if (!response.ok) {
                    if (response.status === 500) {
                        console.error("Lo sentimos, se ha producido un error inesperado.");
                        setOpenSnackbar(true);
                        setSnackbarSeverity("error");
                        setSnackbarMessage("Lo sentimos, se ha producido un error inesperado");
                        throw new Error(response.statusText);
                    } else if (response.status === 400) {
                        const data = await response.json();
                        console.error("Lo sentimos, se ha producido un error inesperado.");
                        setOpenSnackbar(true);
                        setSnackbarSeverity("error");
                        setSnackbarMessage(data.message);
                        throw new Error(response.statusText);
                    }

                    const data = await response.json();
                    console.error("Message: " + data.message + " Asesor: " + data.Asesor + " Error: " + data.error);
                    setOpenSnackbar(true);
                    setSnackbarSeverity("error");
                    setSnackbarMessage("Message: " + data.message + " Asesor: " + data.Asesor + " Error: " + data.error);
                    throw new Error(response.statusText);
                }

                if (response.status === 200) {
                    const data = await response.json();
                    const modifiedData = data.map((row) => {
                        return {
                            ...row,
                            created_at: row.created_at.substring(0, 10),
                            accepted_at: row.accepted_at === null ? "Sin Aceptar" : "Aceptada",
                        };
                    });
                    setRows(modifiedData);
                }
            } catch (error) {
                console.error(error);
            }
        };
        handleSave();
    }, []);

    const columns = [
        { field: "cedula", headerName: "Cedula", width: 140 },
        { field: "clean_desk", headerName: "Clean Desk", width: 140 },
        { field: "quality", headerName: "Calidad", width: 140 },
        { field: "result", headerName: "Resultado", width: 140 },
        { field: "total", headerName: "Total", width: 140 },
        { field: "created_at", headerName: "Fecha de Creación", width: 140 },
        { field: "accepted_at", headerName: "Estado de la Meta", width: 250 },
    ];

    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenSnackbar(false);
    };

    return (
        <Container
            sx={{
                height: "100vh",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
            }}
        >
            <Typography sx={{ textAlign: "center", pb: "15px", color: "primary.main", fontWeight: "500" }} variant={"h4"}>
                Analisis de Metas
            </Typography>
            <DataGrid sx={{ maxHeight: "600px" }} rows={rows} columns={columns} getRowId={(row) => row.cedula} />
            <SnackbarAlert open={openSnackbar} onClose={handleCloseSnackbar} severity={snackbarSeverity} message={snackbarMessage} />
        </Container>
    );
};
export default AnalisisMetas;
