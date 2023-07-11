import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import { TextField } from "@mui/material";
import { useState } from "react";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "fit-content",
    bgcolor: "background.paper",
    boxShadow: 24,
    borderRadius: 8,
    py: 4,
    textAlign: "center",
};

const inputs = [
    { name: "cedula", label: "Cedula", type: "number", value: "", required: true },
    { name: "name", label: "Nombre", type: "text", value: "", required: true },
    { name: "job_title", label: "Cargo", type: "text", value: "", required: true },
    { name: "campaign", label: "Campaña", type: "text", value: "", required: true },
    { name: "coordinator", label: "Coordinador", type: "text", value: "", required: true },
    { name: "criteria", label: "Valor de la Variable a Medir", type: "text", value: "", required: true },
    { name: "quantity", label: "Meta", type: "text", value: "", required: true },
    { name: "result", label: "Resultado", type: "text", value: "", required: false },
    { name: "quality", label: "Calidad", type: "text", value: "", required: false },
    { name: "evaluation", label: "Evaluación", type: "text", value: "", required: false },
    { name: "clean_desk", label: "Clean Desk", type: "text", value: "", required: false },
    { name: "total", label: "Total", type: "text", value: "", required: false },
];

const ModalAddMetas = ({ handleClose, open }) => {
    const [inputValues, setInputValues] = useState(inputs.reduce((acc, input) => ({ ...acc, [input.name]: "" }), {}));

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setInputValues((prevValues) => ({ ...prevValues, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        // try {
        //     const response = await fetch(`https://insights-api.cyc-bpo.com/goals/`, {
        //         method: "POST",
        //     });
        //     if (response.status === 204) {
        //         setRows(rows.filter((row) => row.cedula !== cedula));
        //         setOpenSnackbar(true);
        //         setSnackbarSeverity("success");
        //         setSnackbarMessage("Registro eliminado correctamente");
        //         handleSave();
        //     } else {
        //         setOpenSnackbar(true);
        //         setSnackbarSeverity("error");
        //         setSnackbarMessage("Error al eliminar la meta: " + response.status + " " + response.statusText);
        //     }
        // } catch (error) {
        //     console.error(error);
        //     setOpenSnackbar(true);
        //     setSnackbarSeverity("error");
        //     setSnackbarMessage("Error al eliminar la meta: " + error.message);
        // }
    };

    return (
        <Modal closeAfterTransition open={open} onClose={handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
            <Fade in={open}>
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" color="primary.main" component="h2">
                        AÑADIR REGISTRO
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexWrap: "wrap", gap: "15px", p: "8px", justifyContent: "center" }}>
                        {inputs.map((input) => (
                            <TextField onChange={handleInputChange} key={input.name} label={input.label} type={input.type} name={input.name} required={input.required} />
                        ))}
                        <Button variant="contained" color="primary" type="submit">
                            Guardar
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Modal>
    );
};
export default ModalAddMetas;
