import { Container, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import SnackbarAlert from "../components/SnackbarAlert";
import { useState, useEffect } from "react";

const AnalisisMetas = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [coordinator, setCoordinator] = useState("");
    const [rows, setRows] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("https://intranet.cyc-bpo.com/getSessionValue.php");
            const data = await response.text();
            console.log(data);
            if (data === "No ha accedido al sistema") {
                window.location.href = "https://intranet.cyc-bpo.com/";
            } else {
                setCoordinator(data);
            }
        };
        fetchData();

        const handleSave = async () => {
            try {
                const encodedCoordinator = encodeURIComponent("FAVIAN SIERRA");
                const response = await fetch(`https://api.cyc-bpo.com/goals/?coordinator=${encodedCoordinator}`, {
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
                            accepted: row.accepted == 0 ? "Rechazada" : row.accepted == 1 ? "Aceptada" : "En espera",
                            clean_desk: row.clean_desk === "" ? "En Ejecución" : row.clean_desk,
                            quality: row.quality === "" ? "En Ejecución" : row.quality,
                            result: row.result === "0.00%" ? "En Ejecución" : row.result,
                            total: row.total === "" ? "En Ejecución" : row.total,
                            accepted_execution:
                                row.total == null && row.accepted_execution == null
                                    ? "En ejecucion"
                                    : row.accepted_execution == 0
                                    ? "Rechazada"
                                    : row.accepted_execution == 1
                                    ? "Aceptada"
                                    : "En espera",
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
        { field: "campaign", headerName: "Campaña", width: 140 },
        { field: "clean_desk", headerName: "Clean Desk", width: 140 },
        { field: "quality", headerName: "Calidad", width: 140 },
        { field: "result", headerName: "Resultado", width: 140 },
        { field: "total", headerName: "Total", width: 140 },
        { field: "created_at", headerName: "Fecha de Creación", width: 140 },
        { field: "accepted", headerName: "Estado de la Meta", width: 140 },
        { field: "accepted_execution", headerName: "Estado de la Ejecucion de la Meta", width: 140 },
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
            <DataGrid
                sx={{ maxHeight: "600px" }}
                rows={rows}
                columns={columns}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        quickFilterProps: { debounceMs: 500 },
                    },
                }}
                getRowId={(row) => row.cedula}
            />
            <SnackbarAlert open={openSnackbar} onClose={handleCloseSnackbar} severity={snackbarSeverity} message={snackbarMessage} />
        </Container>
    );
};
export default AnalisisMetas;
