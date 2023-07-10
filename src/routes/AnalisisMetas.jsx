import { Container, Typography } from "@mui/material";
import { DataGrid, GridToolbar, GridActionsCellItem } from "@mui/x-data-grid";
import SnackbarAlert from "../components/SnackbarAlert";
import { useState, useEffect, useCallback } from "react";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

const AnalisisMetas = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [coordinator, setCoordinator] = useState("");
    const [rows, setRows] = useState([]);

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
            const response = await fetch(`https://insights-api.cyc-bpo.com/goals/`, {
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
                    if (row.quantity > 999) {
                        const formatter = new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                        });
                        const value = row.quantity;
                        const formattedValue = formatter.format(value);
                        row.quantity = formattedValue;
                    } else if (row.quantity < 1) {
                        row.quantity = row.quantity * 100 + "%";
                    }
                    return {
                        ...row,
                        last_update: row.last_update.substring(0, 10),
                        accepted: row.accepted == 0 ? "Rechazada" : row.accepted == 1 ? "Aceptada" : "En espera",
                        clean_desk: row.clean_desk === "" ? "En Espera" : row.clean_desk,
                        quality: row.quality === "" ? "En Espera" : row.quality,
                        result: row.result === "" ? "En Espera" : row.result,
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

    useEffect(() => {
        handleSave();
    }, []);

    const handleDeleteClick = (cedula) => () => {
        const handleDelete = async () => {
            const response = await fetch(`https://insights-api.cyc-bpo.com/goals/${cedula}`, {
                method: "DELETE",
            });
            if (response.status === 204) {
                setRows(rows.filter((row) => row.cedula !== cedula));
                setOpenSnackbar(true);
                setSnackbarSeverity("success");
                setSnackbarMessage("Registro eliminado correctamente");
                handleSave();
            } else {
                setOpenSnackbar(true);
                setSnackbarSeverity("error");
                setSnackbarMessage("Error al eliminar la meta: " + response.status + " " + response.statusText);
            }
        };
        handleDelete();
    };

    const columns = [
        { field: "cedula", headerName: "Cedula", width: 100 },
        // { field: "name", headerName: "Nombre", width: 140 },
        { field: "quantity", headerName: "Meta", width: 110, editable: true },
        { field: "clean_desk", headerName: "Clean Desk", width: 80, editable: true },
        { field: "quality", headerName: "Calidad", width: 80, editable: true },
        { field: "result", headerName: "Resultado", width: 80, editable: true },
        { field: "total", headerName: "Total", width: 80, editable: true },
        { field: "last_update", headerName: "Fecha de modificación", width: 155 },
        { field: "accepted", headerName: "Aprobación Meta", width: 125 },
        { field: "accepted_execution", headerName: "Aprobación Ejecución", width: 150 },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            width: 100,
            cellClassName: "actions",
            getActions: ({ id }) => {
                return [<GridActionsCellItem key={id} icon={<DeleteOutlineOutlinedIcon />} label="Delete" onClick={handleDeleteClick(id)} color="inherit" />];
            },
        },
    ];

    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenSnackbar(false);
    };

    const handleProcessRowUpdateError = useCallback((error) => {
        console.error(error);
        setOpenSnackbar(true);
        setSnackbarSeverity("error");
        setSnackbarMessage(error.message);
    }, []);

    const processRowUpdate = useCallback(async (newRow) => {
        // Format the quantity value
        if (newRow.quantity.includes("%")) {
            const value = parseFloat(newRow.quantity.replace("%", ""));
            newRow.quantity = value;
        }
        const formattedValue = newRow.quantity;
        const value = parseInt(formattedValue.replace(/\D/g, ""), 10);
        newRow.quantity = value;

        // Format the date value
        const fields = ["clean_desk", "quality", "result", "total"];
        fields.forEach((field) => {
            if (newRow[field] === "En Espera") {
                newRow[field] = "";
            }
        });

        // Format the accepted value
        const mapValues = (value) => {
            if (value === "Rechazada") return 0;
            if (value === "Aceptada") return 1;
            if (value === "En espera") return null;
            return value;
        };

        newRow.accepted = mapValues(newRow.accepted);
        newRow.accepted_execution = mapValues(newRow.accepted_execution);
        newRow.result = mapValues(newRow.result);

        // Make the HTTP request to save in the backend
        try {
            const response = await fetch(`https://insights-api.cyc-bpo.com/goals/${newRow.cedula}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newRow),
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
                handleSave();
                return data;
            }
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
                Análisis de Metas
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
