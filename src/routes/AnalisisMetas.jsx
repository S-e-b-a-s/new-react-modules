import { Container, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import SnackbarAlert from "../components/SnackbarAlert";
import { useState, useEffect, useCallback } from "react";

const AnalisisMetas = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [coordinator, setCoordinator] = useState("");
    const [rows, setRows] = useState([]);

    useEffect(() => {
        // const fetchData = async () => {
        //     const response = await fetch("https://intranet.cyc-bpo.com/getSessionValue.php");
        //     const data = await response.text();
        //     console.log(data);
        //     if (data === "No ha accedido al sistema") {
        //         window.location.href = "https://intranet.cyc-bpo.com/";
        //     } else {
        //         setCoordinator(data);
        //     }
        // };
        // fetchData();

        const handleSave = async () => {
            try {
                //const encodedCoordinator = encodeURIComponent("FAVIAN SIERRA");
                const response = await fetch(`https://api.cyc-bpo.com/goals/`, {
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
                    console.log(data);
                    const modifiedData = data.map((row) => {
                        return {
                            ...row,
                            last_update: row.last_update.substring(0, 10),
                            accepted: row.accepted == 0 ? "Rechazada" : row.accepted == 1 ? "Aceptada" : "En espera",
                            clean_desk: row.clean_desk === "" ? "En Espera" : row.clean_desk,
                            quality: row.quality === "" ? "En Espera" : row.quality,
                            result: row.result === "0.00%" ? "En Espera" : row.result,
                            total: row.total === "" ? "En Espera" : row.total,
                            accepted_execution:
                                row.total == "" && row.accepted_execution == null
                                    ? ""
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
        { field: "clean_desk", headerName: "Clean Desk", width: 140, editable: true },
        { field: "quality", headerName: "Calidad", width: 140 },
        { field: "result", headerName: "Resultado", width: 140 },
        { field: "total", headerName: "Total", width: 140 },
        { field: "last_update", headerName: "Fecha de modificación", width: 140 },
        { field: "accepted", headerName: "Aprobación de la Meta", width: 185 },
        { field: "accepted_execution", headerName: "Aprobación de la Ejecución", width: 185 },
    ];

    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenSnackbar(false);
    };

    const handleProcessRowUpdateError = useCallback((error) => {
        setOpenSnackbar(true);
        setSnackbarSeverity("error");
        setSnackbarMessage(error.message);
    }, []);

    const processRowUpdate = useCallback(async (newRow) => {
        // Make the HTTP request to save in the backend
        try {
            const response = await fetch(`https://api.cyc-bpo.com/goals/${newRow.cedula}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    newRow,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                console.error(data);
                throw new Error(response.statusText);
            } else if (response.status === 200) {
                const data = await response.json();
                console.log(data);
                setOpenSnackbar(true);
                setSnackbarSeverity("success");
                setSnackbarMessage("Meta actualizada correctamente");
            }
            return response;
        } catch (error) {
            console.error(error);
        }
    }, []);

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
                processRowUpdate={processRowUpdate}
                onProcessRowUpdateError={handleProcessRowUpdateError}
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
