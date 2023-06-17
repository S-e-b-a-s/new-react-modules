import { Container, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import SnackbarAlert from "../components/SnackbarAlert";
import { useState } from "react";

const AnalisisMetas = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const handleSave = async () => {
        try {
            const response = await fetch("http://172.16.5.10:8000/goals/", {
                method: "GET",
            });

            console.log(response);
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

            if (response.status === 201) {
                setOpenSnackbar(true);
                setSnackbarSeverity("success");
                setSnackbarMessage("Archivo subido exitosamente!");
                // Handle successful response here
            }
        } catch (error) {
            console.error(error);
        }
    };
    handleSave();

    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenSnackbar(false);
    };

    const rows = [
        { id: 1, col1: "Hello", col2: "World" },
        { id: 2, col1: "DataGridPro", col2: "is Awesome" },
        { id: 3, col1: "MUI", col2: "is Amazing" },
    ];

    const columns = [
        { field: "col1", headerName: "Column 1", width: 150 },
        { field: "col2", headerName: "Column 2", width: 150 },
    ];

    return (
        <Container sx={{ height: "100vh", p: "15px" }}>
            <Typography sx={{ textAlign: "center", pb: "15px", color: "primary.main", fontWeight: "500" }} variant={"h4"}>
                Analisis de Metas
            </Typography>
            <DataGrid sx={{ height: "80%" }} rows={rows} columns={columns} />
            <SnackbarAlert open={openSnackbar} onClose={handleCloseSnackbar} severity={snackbarSeverity} message={snackbarMessage} />
        </Container>
    );
};
export default AnalisisMetas;
