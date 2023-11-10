const fetchData = async () => {
        try {
            const response = await fetch("https://intranet.cyc-bpo.com/getSessionValue.php");
            const data = await response.json();
            if (data.status === "error") {
                window.location.href = "https://intranet.cyc-bpo.com/";
                return;
            } else if (data.status === "success" && data.message === "Acceso permitido.") {
                setCedula(data.cedula);
                setLink(`https://insights-api-dev.cyc-bpo.com/goals/?cedula=${data.cedula}`);
                // You don't need to log cedula here anymore.
            } else if (data.status === "success" && data.coordinator) {
                setCoordinator(data.coordinator);
                const encodedCoordinator = encodeURIComponent(data.coordinator);
                setIsLoading(true);
                setCedula(data.cedula);
                setLink(`https://insights-api-dev.cyc-bpo.com/goals/?coordinator=${encodedCoordinator}&cedula=${data.cedula}`);
            }
        } catch (error) {
            console.error(error);
        }
    }