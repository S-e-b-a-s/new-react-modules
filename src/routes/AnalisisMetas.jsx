import { Container, Typography, Button, Box } from "@mui/material";
import SnackbarAlert from "../components/SnackbarAlert";
import { useState, useEffect, useCallback } from "react";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import {
    DataGrid,
    GridActionsCellItem,
    GridToolbarContainer,
    GridToolbarColumnsButton,
    GridToolbarFilterButton,
    GridToolbarExport,
    GridToolbarDensitySelector,
    GridToolbarQuickFilter,
    GridRowModes,
    GridRowEditStopReasons,
} from "@mui/x-data-grid";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import ModalAddMetas from "./ModalAddMetas";
import PropTypes from "prop-types";

const AnalisisMetas = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [coordinator, setCoordinator] = useState("");
    const [rows, setRows] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [isLoading, setIsLoading] = useState(true); // Add a loading state

    const [open, setOpen] = useState(false);
    const handleClose = () => setOpen(false);

    const fetchData = async () => {
        const response = await fetch("https://intranet.cyc-bpo.com/getSessionValue.php");
        const data = await response.text();
        console.log(data);

        if (data == "No ha accedido al sistema.") {
            window.location.href = "https://intranet.cyc-bpo.com/";
            return;
        } else if (data == "Acceso permitido.") {
            setIsLoading(true);
        } else {
            setCoordinator(data);
            setIsLoading(true);
        }
    };
    fetchData();

    const handleSave = async () => {
        try {
            const encodedCoordinator = encodeURIComponent(coordinator);
            const response = await fetch(`https://insights-api.cyc-bpo.com/goals/${encodedCoordinator}`, {
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
                        row.quantity = Math.round(row.quantity * 100) + "%";
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

    const handleDeleteClick = async (cedula) => {
        try {
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
        } catch (error) {
            console.error(error);
            setOpenSnackbar(true);
            setSnackbarSeverity("error");
            setSnackbarMessage("Error al eliminar la meta: " + error.message);
        }
    };

    const columns = [
        { field: "cedula", headerName: "Cedula", width: 100 },
        { field: "quantity", headerName: "Meta", width: 140, editable: true },
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
            headerName: "Acciones",
            width: 100,
            cellClassName: "actions",
            getActions: ({ id }) => {
                const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
                if (isInEditMode) {
                    return [
                        <GridActionsCellItem
                            icon={<SaveOutlinedIcon />}
                            label="Save"
                            key={id}
                            sx={{
                                color: "primary.main",
                            }}
                            onClick={handleSaveClick(id)}
                        />,
                        <GridActionsCellItem key={id} icon={<CancelOutlinedIcon />} label="Cancel" className="textPrimary" onClick={handleCancelClick(id)} />,
                    ];
                }

                return [
                    <GridActionsCellItem key={id} icon={<EditOutlinedIcon />} label="Edit" onClick={handleEditClick(id)} />,
                    <GridActionsCellItem key={id} icon={<DeleteOutlineOutlinedIcon />} label="Delete" onClick={() => handleDeleteClick(id)} />,
                ];
            },
        },
    ];

    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenSnackbar(false);
    };

    const handleSaveClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
    };

    const handleEditClick = (id) => () => {
        setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
    };

    const handleCancelClick = (id) => () => {
        setRowModesModel({
            ...rowModesModel,
            [id]: { mode: GridRowModes.View, ignoreModifications: true },
        });

        const editedRow = rows.find((row) => row.id === id);
        if (editedRow.isNew) {
            setRows(rows.filter((row) => row.id !== id));
        }
    };

    const handleProcessRowUpdateError = useCallback((error) => {
        console.error(error);
        setOpenSnackbar(true);
        setSnackbarSeverity("error");
        setSnackbarMessage(error.message);
    }, []);

    const processRowUpdate = useCallback(async (newRow) => {
        // const updatedRow = { ...newRow, isNew: false };
        // setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
        // console.log(updatedRow);
        // return updatedRow;
        // Format the quantity value
        if (newRow.quantity.includes("%")) {
            newRow.quantity = parseFloat(newRow.quantity.replace("%", "")) / 100;
        } else {
            const formattedValue = newRow.quantity;
            const value = parseInt(formattedValue.replace(/\D/g, ""), 10);
            newRow.quantity = value;
        }

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

    CustomToolbar.propTypes = {
        setRows: PropTypes.func.isRequired,
        setRowModesModel: PropTypes.func.isRequired,
    };

    function CustomToolbar(props) {
        // const { setRows, setRowModesModel } = props;

        const handleClick = () => {
            setOpen(true);
            // Old way to add a new row
            // const cedula = Math.floor(Math.random() * 100000) + 1;
            // setRows((oldRows) => [
            //     ...oldRows,
            //     { cedula: cedula, quantity: "", clean_desk: "", quality: "", result: "", total: "", last_update: "", accepted: "", accepted_execution: "", isNew: true },
            // ]);

            // setRowModesModel((oldModel) => ({
            //     ...oldModel,
            //     [cedula]: { mode: GridRowModes.Edit, fieldToFocus: "clean_desk" },
            // }));
        };

        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
                {/* <Button color="primary" startIcon={<AddCircleOutlineOutlinedIcon />} onClick={handleClick}>
                    Añadir registro
                </Button> */}
                <Box sx={{ textAlign: "end", flex: "1" }}>
                    <GridToolbarQuickFilter />
                </Box>
            </GridToolbarContainer>
        );
    }

    const handleRowModesModelChange = (newRowModesModel) => {
        setRowModesModel(newRowModesModel);
    };

    const handleRowEditStop = (params, event) => {
        if (params.reason === GridRowEditStopReasons.rowFocusOut) {
            event.defaultMuiPrevented = true;
        }
    };

    return (
        <>
            {isLoading ? (
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
                    <ModalAddMetas handleClose={handleClose} open={open} handleSave={handleSave} />
                    <Typography sx={{ textAlign: "center", pb: "15px", color: "primary.main", fontWeight: "500" }} variant={"h4"}>
                        Análisis de Metas
                    </Typography>
                    <DataGrid
                        rows={rows}
                        editMode="row"
                        columns={columns}
                        sx={{ maxHeight: "600px" }}
                        rowModesModel={rowModesModel}
                        onRowEditStop={handleRowEditStop}
                        processRowUpdate={processRowUpdate}
                        onRowModesModelChange={handleRowModesModelChange}
                        onProcessRowUpdateError={handleProcessRowUpdateError}
                        slots={{
                            toolbar: CustomToolbar,
                        }}
                        slotProps={{
                            toolbar: {
                                setRows,
                                setRowModesModel,
                            },
                        }}
                        getRowId={(row) => row.cedula}
                    />
                    <SnackbarAlert open={openSnackbar} onClose={handleCloseSnackbar} severity={snackbarSeverity} message={snackbarMessage} />
                </Container>
            ) : (
                (window.location.href = "https://intranet.cyc-bpo.com/")
            )}
        </>
    );
};
export default AnalisisMetas;
