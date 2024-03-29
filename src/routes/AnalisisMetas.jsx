import { Container, Typography, Box } from "@mui/material";
import SnackbarAlert from "../components/SnackbarAlert";
import { useState, useEffect, useCallback, useRef } from "react";
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
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";

const AnalisisMetas = () => {
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [coordinator, setCoordinator] = useState("");
    const [rows, setRows] = useState([]);
    const [rowModesModel, setRowModesModel] = useState({});
    const [isLoading, setIsLoading] = useState(true); // Add a loading state
    const [yearsArray, setYearsArray] = useState([]); // Add a loading state
    const [open, setOpen] = useState(false);
    const [link, setLink] = useState();
    const handleClose = () => setOpen(false);
    const monthRef = useRef();
    const yearRef = useRef();
    const columnRef = useRef();

    // const fetchData = async () => {
    //     const response = await fetch("https://intranet.cyc-bpo.com/getSessionValue.php");
    //     const data = await response.text();

    //     if (data == "No ha accedido al sistema.") {
    //         window.location.href = "https://intranet.cyc-bpo.com/";
    //         return;
    //     } else if (data == "Acceso permitido.") {
    //         setIsLoading(true);
    //     } else {
    //         setCoordinator(data);
    //         setIsLoading(true);
    //     }
    // };
    // fetchData();

    // const fetchData = async () => {
    //     try {
    //         const response = await fetch("https://intranet.cyc-bpo.com/getSessionValue.php");
    //         const data = await response.json();
    //         console.log("data:", data);
    //         if (data.status === "error") {
    //             window.location.href = "https://intranet.cyc-bpo.com/";
    //             return;
    //         } else if (data.status === "success" && data.message === "Acceso permitido.") {
    //             setIsLoading(true);
    //             setLink("https://insights-api-dev.cyc-bpo.com/goals/");
    //         } else if (data.status === "success" && data.coordinator) {
    //             setCoordinator(data.coordinator);
    //             const encodedCoordinator = encodeURIComponent(data.coordinator);
    //             setIsLoading(true);
    //             setLink(`https://insights-api-dev.cyc-bpo.com/goals/?coordinator=${encodedCoordinator}/`);
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    // };

    const handleSave = async () => {
        try {
            // await fetchData();
            const response = await fetch("https://insights-api-dev.cyc-bpo.com/goals/", {
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
    }, []); // Add cedula and coordinator as dependencies to useEffect

    const handleDeleteClick = async (register_cedula) => {
        try {
            const response = await fetch(`https://insights-api-dev-dev.cyc-bpo.com/goals/${register_cedula}`, {
                method: "DELETE",
                body: JSON.stringify({ cedula: cedula }),
            });
            if (response.status === 204) {
                setRows(rows.filter((row) => row.cedula !== register_cedula));
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

    const handleChangeColumns = (columnType) => {
        if (columnType === "goal") {
            setColumns(goalColumns);
        } else {
            setColumns(executionColumns);
        }
    };

    const constColumns = [
        { field: "cedula", headerName: "Cédula", width: 100 },
        { field: "name", headerName: "Nombre", width: 100 },
        { field: "last_update", headerName: "Fecha de modificacion", width: 100 },
    ];

    const goalColumns = [
        { field: "quantity", headerName: "Meta", width: 140, editable: true },
        { field: "criteria", headerName: "Variable a Medir", width: 140, editable: true },
        { field: "accepted", headerName: "Aprobación Meta", width: 125 },
        { field: "accepted_at", headerName: "Fecha de Aprobación de Meta", width: 125 },
        {
            field: "goal_date",
            headerName: "Fecha de la meta",
            width: 150,
            sortComparator: (v1, v2) => {
                // Extraer el mes y el año de los valores
                const [mes1, año1] = v1.split("-");
                const [mes2, año2] = v2.split("-");
                // Crear un objeto con los nombres de los meses en español y sus números correspondientes
                const meses = {
                    ENERO: 1,
                    FEBRERO: 2,
                    MARZO: 3,
                    ABRIL: 4,
                    MAYO: 5,
                    JUNIO: 6,
                    JULIO: 7,
                    AGOSTO: 8,
                    SEPTIEMBRE: 9,
                    OCTUBRE: 10,
                    NOVIEMBRE: 11,
                    DICIEMBRE: 12,
                };
                // Convertir los meses a números
                const num1 = meses[mes1];
                const num2 = meses[mes2];
                // Comparar los años primero, y si son iguales, comparar los meses
                if (año1 < año2) {
                    return -1;
                } else if (año1 > año2) {
                    return 1;
                } else {
                    if (num1 < num2) {
                        return -1;
                    } else if (num1 > num2) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            },
        },
    ];

    const executionColumns = [
        { field: "clean_desk", headerName: "Clean Desk", width: 80, editable: true },
        { field: "quality", headerName: "Calidad", width: 80, editable: true },
        { field: "result", headerName: "Resultado", width: 80, editable: true },
        { field: "total", headerName: "Total", width: 80, editable: true },
        { field: "accepted_execution", headerName: "Aprobación Ejecución", width: 150 },
        { field: "accepted_execution_at", headerName: "Fecha de Aprobación de Ejecución", width: 150 },
        {
            field: "execution_date",
            headerName: "Fecha de la ejecución de la meta",
            width: 150,
            sortComparator: (v1, v2) => {
                // Extraer el mes y el año de los valores
                const [mes1, año1] = v1.split("-");
                const [mes2, año2] = v2.split("-");
                // Crear un objeto con los nombres de los meses en español y sus números correspondientes
                const meses = {
                    ENERO: 1,
                    FEBRERO: 2,
                    MARZO: 3,
                    ABRIL: 4,
                    MAYO: 5,
                    JUNIO: 6,
                    JULIO: 7,
                    AGOSTO: 8,
                    SEPTIEMBRE: 9,
                    OCTUBRE: 10,
                    NOVIEMBRE: 11,
                    DICIEMBRE: 12,
                };
                // Convertir los meses a números
                const num1 = meses[mes1];
                const num2 = meses[mes2];
                // Comparar los años primero, y si son iguales, comparar los meses
                if (año1 < año2) {
                    return -1;
                } else if (año1 > año2) {
                    return 1;
                } else {
                    if (num1 < num2) {
                        return -1;
                    } else if (num1 > num2) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            },
        },
    ];

    const initialColumns = [
        { field: "cedula", headerName: "Cédula", width: 100 },
        { field: "quantity", headerName: "Meta", width: 140, editable: true },
        { field: "clean_desk", headerName: "Clean Desk", width: 80, editable: true },
        { field: "quality", headerName: "Calidad", width: 80, editable: true },
        { field: "result", headerName: "Resultado", width: 80, editable: true },
        { field: "total", headerName: "Total", width: 80, editable: true },
        { field: "last_update", headerName: "Fecha de modificación", width: 155 },
        { field: "accepted", headerName: "Aprobación Meta", width: 125 },
        { field: "accepted_execution", headerName: "Aprobación Ejecución", width: 150 },
        {
            field: "goal_date",
            headerName: "Fecha de la meta",
            width: 150,
            sortComparator: (v1, v2) => {
                // Extraer el mes y el año de los valores
                const [mes1, año1] = v1.split("-");
                const [mes2, año2] = v2.split("-");
                // Crear un objeto con los nombres de los meses en español y sus números correspondientes
                const meses = {
                    ENERO: 1,
                    FEBRERO: 2,
                    MARZO: 3,
                    ABRIL: 4,
                    MAYO: 5,
                    JUNIO: 6,
                    JULIO: 7,
                    AGOSTO: 8,
                    SEPTIEMBRE: 9,
                    OCTUBRE: 10,
                    NOVIEMBRE: 11,
                    DICIEMBRE: 12,
                };
                // Convertir los meses a números
                const num1 = meses[mes1];
                const num2 = meses[mes2];
                // Comparar los años primero, y si son iguales, comparar los meses
                if (año1 < año2) {
                    return -1;
                } else if (año1 > año2) {
                    return 1;
                } else {
                    if (num1 < num2) {
                        return -1;
                    } else if (num1 > num2) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            },
        },
        {
            field: "execution_date",
            headerName: "Fecha de la ejecución de la meta",
            width: 150,
            sortComparator: (v1, v2) => {
                // Extraer el mes y el año de los valores
                const [mes1, año1] = v1.split("-");
                const [mes2, año2] = v2.split("-");
                // Crear un objeto con los nombres de los meses en español y sus números correspondientes
                const meses = {
                    ENERO: 1,
                    FEBRERO: 2,
                    MARZO: 3,
                    ABRIL: 4,
                    MAYO: 5,
                    JUNIO: 6,
                    JULIO: 7,
                    AGOSTO: 8,
                    SEPTIEMBRE: 9,
                    OCTUBRE: 10,
                    NOVIEMBRE: 11,
                    DICIEMBRE: 12,
                };
                // Convertir los meses a números
                const num1 = meses[mes1];
                const num2 = meses[mes2];
                // Comparar los años primero, y si son iguales, comparar los meses
                if (año1 < año2) {
                    return -1;
                } else if (año1 > año2) {
                    return 1;
                } else {
                    if (num1 < num2) {
                        return -1;
                    } else if (num1 > num2) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            },
        },
        // {
        //     field: "actions",
        //     type: "actions",
        //     headerName: "Acciones",
        //     width: 100,
        //     cellClassName: "actions",
        //     getActions: ({ id }) => {
        //         const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        //         if (isInEditMode) {
        //             return [
        //                 <GridActionsCellItem
        //                     icon={<SaveOutlinedIcon />}
        //                     label="Save"
        //                     key={id}
        //                     sx={{
        //                         color: "primary.main",
        //                     }}
        //                     onClick={handleSaveClick(id)}
        //                 />,
        //                 <GridActionsCellItem key={id} icon={<CancelOutlinedIcon />} label="Cancel" className="textPrimary" onClick={handleCancelClick(id)} />,
        //             ];
        //         }

        //         return [
        //             <GridActionsCellItem key={id} icon={<EditOutlinedIcon />} label="Edit" onClick={handleEditClick(id)} />,
        //             <GridActionsCellItem key={id} icon={<DeleteOutlineOutlinedIcon />} label="Delete" onClick={() => handleDeleteClick(id)} />,
        //         ];
        //     },
        // },
    ];

    const [columns, setColumns] = useState(initialColumns);

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
        const newRowWithCedula = { ...newRow, cedula: cedula };
        try {
            const response = await fetch(`https://insights-api-dev.cyc-bpo.com/goals/${newRow.cedula}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newRowWithCedula),
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

    function CustomToolbar() {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport
                    csvOptions={{
                        fileName: "Metas",
                        delimiter: ";",
                        utf8WithBom: true,
                    }}
                />
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

    const months = [
        { value: "enero", label: "ENERO" },
        { value: "febrero", label: "FEBRERO" },
        { value: "marzo", label: "MARZO" },
        { value: "abril", label: "ABRIL" },
        { value: "mayo", label: "MAYO" },
        { value: "junio", label: "JUNIO" },
        { value: "julio", label: "JULIO" },
        { value: "agosto", label: "AGOSTO" },
        { value: "septiembre", label: "SEPTIEMBRE" },
        { value: "octubre", label: "OCTUBRE" },
        { value: "noviembre", label: "NOVIEMBRE" },
        { value: "diciembre", label: "DICIEMBRE" },
    ];

    useEffect(() => {
        const YearSelect = () => {
            const currentYear = new Date().getFullYear();
            const years = [];
            for (let year = currentYear; year <= 2023; year++) {
                years.push({ value: year, label: year });
            }
            setYearsArray(years);
        };

        YearSelect();
    }, []);

    const handleFilter = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(
                `https://insights-api-dev.cyc-bpo.com/goals/?date=${monthRef.current.value}-${yearRef.current.value}&column=${columnRef.current.value}`,
                {
                    method: "GET",
                }
            );

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
                /* just wait he is going to sleep in the lunch time I think, after that he will be okay */
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
                        history_date: row.history_date.substring(0, 10),
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
                // Create a new columns array based on the initial columns but with the field name changed
                const updatedColumns = initialColumns.map((column) => {
                    if (column.field === "last_update") {
                        // Change the field and header name for 'last_update' column
                        return {
                            ...column,
                            field: "history_date",
                            headerName: "Fecha de modificación",
                        };
                    }
                    return column; // Keep other columns unchanged
                });

                // Update the 'columns' state with the modified columns
                setColumns(updatedColumns);
                setRows(modifiedData);
            }
        } catch (error) {
            console.error(error);
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
                    <Box component="form" sx={{ display: "flex", gap: "2rem", p: "1rem" }} onSubmit={handleFilter}>
                        <TextField required defaultValue="" sx={{ width: "9rem" }} size="small" variant="filled" select label="Mes" inputRef={monthRef}>
                            {months.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField required defaultValue="" sx={{ width: "9rem" }} size="small" variant="filled" select label="Año" inputRef={yearRef}>
                            {yearsArray.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField required defaultValue="" sx={{ width: "15rem" }} size="small" variant="filled" select label="Columna" inputRef={columnRef}>
                            <MenuItem value={"entrega"} key={1}>
                                Fecha de la Meta
                            </MenuItem>
                            <MenuItem value={"ejecucion"} key={2}>
                                Fecha de la Ejecución
                            </MenuItem>
                        </TextField>
                        <Button variant="outlined" size="small" type="submit">
                            Filtrar
                        </Button>
                        <Button onClick={handleChangeColumns()} variant="outlined" size="small" type="button">
                            Entrega
                        </Button>
                        <Button onClick={handleChangeColumns()} variant="outlined" size="small" type="button">
                            Ejecución
                        </Button>
                    </Box>
                    <DataGrid
                        rows={rows}
                        editMode="row"
                        columns={columns}
                        sx={{ maxHeight: "600px" }}
                        csvOptions={{
                            fileName: "customerDataBase",
                            delimiter: ";",
                            utf8WithBom: true,
                        }}
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
