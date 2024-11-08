document.addEventListener("DOMContentLoaded", () => {
    const tableBodyJugadores = document.querySelector("#jugadoresTable tbody");
    const tableBodyEquipos = document.querySelector("#equiposTable tbody");
    const equipoSelect = document.querySelector("#createEquipo");

    let equipos = [];  // Guardamos los equipos en una variable global

    function fetchJugadores() {
        fetch('http://localhost:8080/api/jugador')
            .then(response => response.json())
            .then(data => {
                tableBodyJugadores.innerHTML = '';
                data.forEach(jugador => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${jugador.id}</td>
                        <td>${jugador.nombre}</td>
                        <td>${formatearFecha(jugador.fechaNacimiento)}</td>
                        <td>${jugador.numeroCamiseta}</td>
                        <td>${jugador.posicion}</td>
                        <td>${jugador.equipo.nombre}</td>
                        <td>
                            <button class="btn btn-warning btn-sm mr-2" onclick="showEditForm(${jugador.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteJugador(${jugador.id})">Eliminar</button>
                        </td>
                    `;
                    tableBodyJugadores.appendChild(row);
                });
            })
            .catch(error => console.error('Error al obtener los jugadores:', error));
    }

    function fetchEquipos() {
        fetch('http://localhost:8080/api/equipo')
            .then(response => response.json())
            .then(data => {
                equipos = data;  // Guardamos los equipos en la variable
                tableBodyEquipos.innerHTML = '';
                data.forEach(equipo => {
                    const row = document.createElement("tr");
                    row.innerHTML = `
                        <td>${equipo.id}</td>
                        <td>${equipo.nombre}</td>
                        <td>${equipo.ciudad}</td>
                        <td>
                            <button class="btn btn-warning btn-sm mr-2" onclick="showEditEquipoForm(${equipo.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteEquipo(${equipo.id})">Eliminar</button>
                        </td>
                    `;
                    tableBodyEquipos.appendChild(row);
                });
                // Actualizar el select de equipos para la creación de jugadores
                actualizarSelectEquipos();
            })
            .catch(error => console.error('Error al obtener los equipos:', error));
    }

    window.showEditEquipoForm = function (id) {
        fetch(`http://localhost:8080/api/equipo/${id}`)
            .then(response => response.json())
            .then(equipo => {
                const editRow = document.createElement("tr");
                editRow.innerHTML = `
                    <td colspan="4">
                        <form id="editEquipoForm-${id}">
                            <input type="hidden" id="editEquipoId-${id}" value="${equipo.id}">
                            <div class="form-group">
                                <label for="editEquipoNombre-${id}">Nombre:</label>
                                <input type="text" class="form-control" id="editEquipoNombre-${id}" value="${equipo.nombre}" required>
                            </div>
                            <div class="form-group">
                                <label for="editEquipoCiudad-${id}">Ciudad:</label>
                                <input type="text" class="form-control" id="editEquipoCiudad-${id}" value="${equipo.ciudad}" required>
                            </div>
                            <button type="submit" class="btn btn-primary">Guardar cambios</button>
                        </form>
                    </td>
                `;
                const equipoRow = document.querySelector(`button[onclick="showEditEquipoForm(${id})"]`).closest("tr");
                if (equipoRow.nextSibling && equipoRow.nextSibling.classList.contains("edit-form-row")) {
                    equipoRow.nextSibling.remove();
                }
                editRow.classList.add("edit-form-row");
                equipoRow.parentNode.insertBefore(editRow, equipoRow.nextSibling);

                document.querySelector(`#editEquipoForm-${id}`).addEventListener("submit", function (event) {
                    event.preventDefault();
                    const nombre = document.querySelector(`#editEquipoNombre-${id}`).value;
                    const ciudad = document.querySelector(`#editEquipoCiudad-${id}`).value;

                    // Enviar los datos actualizados al servidor
                    fetch(`http://localhost:8080/api/equipo/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            nombre: nombre,
                            ciudad: ciudad
                        })
                    })
                        .then(() => {
                            fetchEquipos(); // Refrescar la lista de equipos
                        })
                        .catch(error => console.error('Error al actualizar el equipo:', error));
                });
            })
            .catch(error => console.error('Error al obtener los detalles del equipo:', error));
    };

    window.deleteEquipo = function (id) {
        console.log('Eliminando equipo con id:', id);  // Añade un log para verificar el id.
        fetch(`http://localhost:8080/api/equipo/${id}`, {
            method: 'DELETE',
        })
            .then(() => fetchEquipos())  // Refresca la lista de equipos después de eliminar.
            .catch(error => console.error('Error al eliminar el equipo:', error));
    };

    // Función para crear un equipo
    function crearEquipo(event) {
        event.preventDefault();  // Evitar que el formulario se envíe de la manera tradicional

        const nombre = document.querySelector("#createEquipoNombre").value;
        const ciudad = document.querySelector("#createEquipoCiudad").value;

        // Verificamos que los campos no estén vacíos
        if (!nombre || !ciudad) {
            alert("Por favor, ingrese todos los campos.");
            return;
        }

        // Crear el objeto equipo
        const nuevoEquipo = {
            nombre: nombre,
            ciudad: ciudad
        };

        // Enviar la solicitud POST al servidor
        fetch('http://localhost:8080/api/equipo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoEquipo)  // Convertimos el objeto a JSON
        })
            .then(response => response.json())
            .then(data => {
                console.log('Equipo creado:', data);
                fetchEquipos();  // Refrescar la lista de equipos
                document.querySelector("#createEquipoForm").reset();  // Limpiar el formulario después de crear el equipo
            })
            .catch(error => {
                console.error('Error al crear el equipo:', error);
                alert("Hubo un error al crear el equipo.");
            });
    }

    // Asociar la función de creación con el evento del formulario
    document.querySelector("#createEquipoForm").addEventListener("submit", crearEquipo);


    function actualizarSelectEquipos() {
        const equipoSelect = document.querySelector("#createEquipo");
        equipoSelect.innerHTML = '';  // Limpiar el contenido actual del select
    
        // Crear la opción predeterminada
        const opcionSeleccionar = document.createElement("option");
        opcionSeleccionar.value = "";
        opcionSeleccionar.textContent = "Seleccionar equipo";
        opcionSeleccionar.disabled = true;
        opcionSeleccionar.selected = true;  // Esta opción es la que estará seleccionada por defecto
        equipoSelect.appendChild(opcionSeleccionar);
    
        // Agregar los equipos como opciones
        equipos.forEach(equipo => {
            const option = document.createElement("option");
            option.value = equipo.id;
            option.textContent = equipo.nombre;
            equipoSelect.appendChild(option);
        });
    }
    

    function formatearFecha(fecha) {
        const date = new Date(fecha);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function formatearFecha2(fecha) {
        const date = new Date(fecha);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${year}-${month}-${day}`;
    }

    window.showEditForm = function (id) {
        fetch(`http://localhost:8080/api/jugador/${id}`)
            .then(response => response.json())
            .then(jugador => {
                const editRow = document.createElement("tr");
                let formatoFecha = new Date(jugador.fechaNacimiento);
                editRow.innerHTML = `
                    <td colspan="7">
                        <form id="editForm-${id}">
                            <input type="hidden" id="editId-${id}" value="${jugador.id}">
                            <div class="form-group">
                                <label for="editNombre-${id}">Nombre:</label>
                                <input type="text" class="form-control" id="editNombre-${id}" value="${jugador.nombre}" required>
                            </div>
                            <div class="form-group">
                                <label for="editFechaNacimiento-${id}">Fecha de Nacimiento:</label>
                                <input type="date" class="form-control" id="editFechaNacimiento-${id}" value="${formatearFecha2(formatoFecha)}" required>
                            </div>
                            <div class="form-group">
                                <label for="editNumeroCamiseta-${id}">Número de Camiseta:</label>
                                <input type="number" class="form-control" id="editNumeroCamiseta-${id}" value="${jugador.numeroCamiseta}" required>
                            </div>
                            <div class="form-group">
                                <label for="editPosicion-${id}">Posición:</label>
                                <input type="text" class="form-control" id="editPosicion-${id}" value="${jugador.posicion}" required>
                            </div>
                            <div class="form-group">
                                <label for="editEquipo-${id}">Equipo:</label>
                                <select class="form-control" id="editEquipo-${id}" required>
                                    ${equipos.map(equipo => `
                                        <option value="${equipo.id}" ${equipo.id === jugador.equipo.id ? 'selected' : ''}>${equipo.nombre}</option>
                                    `).join('')}
                                </select>
                            </div>
                            <button type="submit" class="btn btn-primary">Guardar cambios</button>
                        </form>
                    </td>
                `;
                const jugadorRow = document.querySelector(`button[onclick="showEditForm(${id})"]`).closest("tr");
                if (jugadorRow.nextSibling && jugadorRow.nextSibling.classList.contains("edit-form-row")) {
                    jugadorRow.nextSibling.remove();
                }
                editRow.classList.add("edit-form-row");
                jugadorRow.parentNode.insertBefore(editRow, jugadorRow.nextSibling);

                document.querySelector(`#editForm-${id}`).addEventListener("submit", function (event) {
                    event.preventDefault();
                    const nombre = document.querySelector(`#editNombre-${id}`).value;
                    let fechaNacimiento = new Date(document.querySelector(`#editFechaNacimiento-${id}`).value);
                    fechaNacimiento.setDate(fechaNacimiento.getDate());
                    fechaNacimiento = fechaNacimiento.toISOString().split('T')[0];
                    const numeroCamiseta = document.querySelector(`#editNumeroCamiseta-${id}`).value;
                    const posicion = document.querySelector(`#editPosicion-${id}`).value;
                    const equipoId = document.querySelector(`#editEquipo-${id}`).value;

                    fetch(`http://localhost:8080/api/jugador/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            nombre: nombre,
                            fechaNacimiento: fechaNacimiento,
                            numeroCamiseta: numeroCamiseta,
                            posicion: posicion,
                            equipo: { id: equipoId }
                        })
                    })
                        .then(() => {
                            fetchJugadores();
                        })
                        .catch(error => console.error('Error al actualizar el jugador:', error));
                });
            })
            .catch(error => console.error('Error al obtener el jugador:', error));
    };

    window.deleteJugador = function (id) {
        fetch(`http://localhost:8080/api/jugador/${id}`, {
            method: 'DELETE',
        })
            .then(() => fetchJugadores())
            .catch(error => console.error('Error al eliminar el jugador:', error));
    };

    // Función para crear un jugador
    function crearJugador(event) {
        event.preventDefault(); // Evitar que el formulario se envíe de la manera tradicional

        // Obtener los valores de los campos del formulario
        const nombre = document.querySelector("#createNombre").value;
        const fechaNacimiento = document.querySelector("#createFechaNacimiento").value;
        const numeroCamiseta = document.querySelector("#createNumeroCamiseta").value;
        const posicion = document.querySelector("#createPosicion").value;
        const equipoId = document.querySelector("#createEquipo").value;

        // Verificar que todos los campos estén llenos
        if (!nombre || !fechaNacimiento || !numeroCamiseta || !posicion || !equipoId) {
            alert("Por favor, ingrese todos los campos.");
            return;
        }

        // Crear el objeto jugador
        const nuevoJugador = {
            nombre: nombre,
            fechaNacimiento: fechaNacimiento,
            numeroCamiseta: numeroCamiseta,
            posicion: posicion,
            equipo: { id: equipoId }
        };

        // Enviar la solicitud POST al servidor para crear el jugador
        fetch('http://localhost:8080/api/jugador', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoJugador) // Convertimos el objeto a JSON
        })
            .then(response => response.json())
            .then(data => {
                console.log('Jugador creado:', data);
                fetchJugadores(); // Refrescar la lista de jugadores
                document.querySelector("#createForm").reset(); // Limpiar el formulario después de crear el jugador
                actualizarSelectEquipos()
            })
            .catch(error => {
                console.error('Error al crear el jugador:', error);
                alert("Hubo un error al crear el jugador.");
            });
    }

    // Asociar la función de creación con el evento del formulario
    document.querySelector("#createForm").addEventListener("submit", crearJugador);


    // Cargar jugadores y equipos al iniciar
    fetchEquipos();
    fetchJugadores();
});
