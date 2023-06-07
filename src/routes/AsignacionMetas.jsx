import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SaveIcon from "@mui/icons-material/Save";
import { useState, useEffect } from "react";
import SnackbarAlert from "../components/SnackbarAlert";
import LoadingButton from "@mui/lab/LoadingButton";

export default function AsignacionMetas() {
    useEffect(() => {
        document.title = "Asignacion de Metas";
    }, []);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            // Create an array of objects with the campaign and value properties
            const metaAsignarArray = metaAsignar.map((value, index) => {
                const label = inputs[index].label;
                return { campaign: label, value: value };
            });

            // Convert the array to JSON format
            const metaAsignarJSON = JSON.stringify(metaAsignarArray);

            const response = await fetch("http://172.16.5.10:8000/goals/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: metaAsignarJSON,
            });

            setLoading(false);

            if (!response.ok) {
                setOpenSnackbar(true);
                setSnackbarSeverity("error");
                setSnackbarMessage("Ha ocurrido un error!");
                throw new Error(response.statusText);
            }

            if (response.status === 201) {
                setOpenSnackbar(true);
                setSnackbarSeverity("success");
                setSnackbarMessage("Metas subidas exitosamente!");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const inputs = [
        { label: "Metlife-Colsubsidio Monetaria" },
        { label: "Metlife-Serfinanza Bienvenida" },
        { label: "MetLife" },
        { label: "Metlife-Serfinanza Stock" },
        { label: "Claro Cartera" },
        { label: "Metlife - Cafam" },
        { label: "Liberty" },
        { label: "Falabella 1 - 30" },
        { label: "Banco Falabella 1-30" },
        { label: "Claro" },
        { label: "Falabella Castigo" },
        { label: "Falabella Juridico" },
        { label: "Falabella Peru" },
        { label: "Falabella Renegociados" },
        { label: "Pay-u" },
        { label: "Banco Falabella Renegociados" },
        { label: "Coomeva Mp" },
        { label: "Sura" },
        { label: "Falabella Precastigo" },
        { label: "Credibanco" },
    ];

    const [metaAsignar, setMetaAsignar] = useState(inputs.map(() => ""));

    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setOpenSnackbar(false);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100vh" }}>
            <Box sx={{ textAlign: "center", alignItems: "flex-end" }}>
                <Typography variant="h6" sx={{ color: "primary.main", fontSize: "30px" }}>
                    ASIGNACIÓN DE METAS
                </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "flex-end", width: "94%" }}>
                <LoadingButton loadingPosition="start" loading={loading} startIcon={<SaveIcon />} type="submit" form="meta-form">
                    Guardar
                </LoadingButton>
            </Box>
            <Box
                component="form"
                sx={{
                    display: "grid",
                    textAlign: "center",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gridGap: "15px",
                    p: "15px",
                    height: "70vh",
                }}
                id="meta-form"
                onSubmit={handleSave}
            >
                {inputs.map((input, index) => (
                    <Box key={index}>
                        <TextField
                            label={input.label}
                            sx={{ width: "70%" }}
                            variant="filled"
                            required={true}
                            autoComplete="off"
                            type="text"
                            onChange={(event) => {
                                const newValue = event.target.value;
                                setMetaAsignar((prevMetaAsignar) => {
                                    const updatedMetaAsignar = [...prevMetaAsignar];
                                    updatedMetaAsignar[index] = newValue;
                                    return updatedMetaAsignar;
                                });
                            }}
                        />
                    </Box>
                ))}
            </Box>
            <SnackbarAlert open={openSnackbar} onClose={handleCloseSnackbar} severity={snackbarSeverity} message={snackbarMessage} />
        </Box>
    );
}
