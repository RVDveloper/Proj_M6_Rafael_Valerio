//?nuevo

document.addEventListener('DOMContentLoaded', function () {
    const ccaaSelect = document.getElementById('ccaa');
    const provinciaSelect = document.getElementById('provincia');
    const poblacionSelect = document.getElementById('poblacion');
    const imageContainer = document.getElementById('image-container');
    const formulario = document.getElementById('formulario');
    const messagesContainer = document.getElementById('messages');
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');

    const infoButton = document.getElementById('infoButton');
        const infoModal = document.getElementById('infoModal');
        const closeButton = document.querySelector('.close');
    
        
        infoButton.addEventListener('click', function () {
            infoModal.style.display = 'flex';
        });
    
        
        closeButton.addEventListener('click', function () {
            infoModal.style.display = 'none';
        });
    
       
        window.addEventListener('click', function (event) {
            if (event.target === infoModal) {
                infoModal.style.display = 'none';
            }
        });


     // Conexión WebSocket
     const socket = new WebSocket('ws://colocartuip:8080'); // Cambia esta IP por la del servidor

     socket.addEventListener('open', function () {
         console.log('Conexión WebSocket abierta');
     });
 
     socket.addEventListener('message', function (event) {
         console.log('Mensaje recibido del servidor: ', event.data);
 
         alert('📩 Nuevo mensaje recibido: ' + event.data);
 
         const message = document.createElement('div');
         message.classList.add('message', 'received');
         message.textContent = event.data;
 
         messagesContainer.appendChild(message);
         messagesContainer.scrollTop = messagesContainer.scrollHeight;
     });
    
    
  
   
    



    // Obtener comunidades autónomas 
    async function getComunidadesAutonomas() {
        const response = await fetch('https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/ccaa.json');
        const data = await response.json();
        console.log("Comunidades autónomas:", data);
        await(response => response.json())

        data.forEach(comunidad => {
            let options = document.createElement('option');
            options.value = comunidad.code;
            options.textContent = comunidad.label;
            ccaaSelect.appendChild(options);
        });
    }

    getComunidadesAutonomas();

    // Obtener provincias
    async function getProvincias() {
        const response = await fetch('https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/provincias.json');
        const data = await response.json();
        console.log("Provincias:", data);
        provinciaSelect.innerHTML = "";

        let options = document.createElement('option');
        options.text = "Selecciona una Provincia";
        provinciaSelect.appendChild(options);

        console.log("La comunidad elegida es ", ccaaSelect.value);
        data.forEach(provincia => {
            if (provincia.parent_code == ccaaSelect.value) {
                let option = document.createElement('option');
                option.value = provincia.code;
                option.textContent = provincia.label;
                provinciaSelect.appendChild(option);
            }
        });
    }

    ccaaSelect.addEventListener('change', function () {
        getProvincias();
    });

    // Obtener poblaciones
    async function getPoblaciones() {
        const response = await fetch('https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/poblaciones.json');
        const data = await response.json();
        console.log("Poblaciones:", data);
        poblacionSelect.innerHTML = "";

        let options = document.createElement('option');
        options.text = "Selecciona una Población";
        poblacionSelect.appendChild(options);

        console.log("La provincia elegida es ", provinciaSelect.value);
        data.forEach(poblacion => {
            if (poblacion.parent_code == provinciaSelect.value) {
                let option = document.createElement('option');
                option.value = poblacion.code;
                option.textContent = poblacion.label;
                poblacionSelect.appendChild(option);
            }
        });
    }

    provinciaSelect.addEventListener('change', function () {
        getPoblaciones();
    });

    // Manejar el envío del formulario
    formulario.addEventListener('submit', function (event) {
        event.preventDefault();

        const nombreCompleto = document.getElementById('nombre').value;
        const ccaa = ccaaSelect.options[ccaaSelect.selectedIndex]?.text || "";
        const provincia = provinciaSelect.options[provinciaSelect.selectedIndex]?.text || "";
        const poblacion = poblacionSelect.options[poblacionSelect.selectedIndex]?.text || "";
        const mensajePersonalizado = document.getElementById('mensaje').value;

        if (poblacion) {
            fetch(`https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=images&titles=${encodeURIComponent(poblacion)}&gimlimit=10&prop=imageinfo&iiprop=url`)
                .then(response => response.json())
                .then(data => {
                    console.log("Imágenes de Wikimedia:", data);
                    imageContainer.innerHTML = '';
                    
                    if (data.query && data.query.pages) {
                        Object.values(data.query.pages).forEach(page => {
                            const imgUrl = page.imageinfo[0].url;
                            const imgBox = document.createElement('div');
                            imgBox.className = 'image-box';
                            const img = document.createElement('img');
                            img.src = imgUrl;
                            imgBox.appendChild(img);
                            imageContainer.appendChild(imgBox);
                        });
                    } else {
                        imageContainer.innerHTML = '<p>No se encontraron imágenes para esta población.</p>';
                    }

                    // Crear el mensaje a enviar por WebSocket
                    const mensaje = {
                        nombreCompleto: nombreCompleto,
                        ccaa: ccaa,
                        provincia: provincia,
                        poblacion: poblacion,
                        mensajePersonalizado: mensajePersonalizado
                    };

                    // Enviar el mensaje por WebSocket
                    socket.send(JSON.stringify(mensaje));
                    console.log("Mensaje enviado al servidor:", mensaje);
                    alert('✅ Mensaje enviado correctamente a todos los usuarios.');
                    const message = document.createElement('div');
                    message.classList.add('message', 'sent');
                    message.textContent = mensaje;

                    messagesContainer.appendChild(message);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight; 
                })
                .catch(error => console.error('Error cargando imágenes:', error));
        }
    });



    // Obtener imágenes 
    async function getImages() {
        const response = await fetch('https://raw.githubusercontent.com/frontid/ComunidadesProvinciasPoblaciones/refs/heads/master/poblaciones.json');
        const data = await response.json();
        console.log("Poblaciones:", data);
        data.forEach(poblacion => {
            getImages(poblacion.label);
        });
    }

    messageForm.addEventListener('submit', function (event) {
        event.preventDefault();
        
        const messageText = messageInput.value.trim();
        if (messageText === "") return;

        socket.send(messageText);
        console.log('📤 Mensaje enviado:', messageText);

        const message = document.createElement('div');
        message.classList.add('message', 'sent');
        message.textContent = messageText;

        messagesContainer.appendChild(message);
        messagesContainer.scrollTop = messagesContainer.scrollHeight; 
        messageInput.value = "";
    });
    socket.addEventListener('message', function (event) {
        event.data.text().then(text => {
            console.log('📩 Mensaje recibido:', text);
            
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'received');
            messageElement.textContent = text;
    
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
    });

    socket.addEventListener('close', function () {
        console.log('⚠️ Conexión cerrada');
    });




    document.getElementById('climateForecast').addEventListener('click', async function () {
        const poblacion = document.getElementById('poblacion').options[document.getElementById('poblacion').selectedIndex]?.text || "";
        
        if (!poblacion) {
            alert('Por favor, selecciona una población');
            return;
        }
    
        const url = `https://weather-api167.p.rapidapi.com/api/weather/forecast?place=${encodeURIComponent(poblacion)},ES&cnt=3&units=standard&type=three_hour&mode=json&lang=es`;
    
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': '1b41bbe0a6msh3133953603d1c81p17bdf5jsn2980d7e0d7fe',
                'x-rapidapi-host': 'weather-api167.p.rapidapi.com',
                'Accept': 'application/json'
            }
        };
    
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status}`);
            }
    
            const data = await response.json();
            console.log(data); // Verifica la estructura de los datos en la consola
    
            const climaContainer = document.getElementById('clima-container');
            climaContainer.innerHTML = "";
    
            if (!data || !data.list || data.list.length === 0) {
                throw new Error("No se encontraron datos de clima.");
            }
    
            data.list.slice(0, 3).forEach(prevision => {
                const fecha = prevision.dt_txt; 
                const temperatura = (prevision.main.temprature - 273.15).toFixed(1); // Kelvin a Celsius
                const descripcion = prevision.weather[0].description;
                const icono = prevision.weather[0].icon;
                const iconUrl = icono; 
    
                const previsionElement = document.createElement('div');
                previsionElement.classList.add('prevision');
                previsionElement.innerHTML = `
                    <p><strong>${fecha}</strong></p>
                    <p>${descripcion}, 🌡️ ${temperatura}°C</p>
                    <img src="${iconUrl}" alt="${descripcion}" />
                `;
    
                climaContainer.appendChild(previsionElement);
            });
    
        } catch (error) {
            console.error('Error obteniendo el clima:', error);
            document.getElementById('clima-container').innerHTML = '<p>Error al obtener el clima.</p>';
        }
    });
    
    document.getElementById("getLocation").addEventListener("click", obtenerUbicacion);

function obtenerUbicacion() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } else {
        mostrarNotificacion("Geolocalización no soportada en tu navegador.");
    }
}

function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    console.log(`Ubicación obtenida: Latitud ${lat}, Longitud ${lon}`);

    
    obtenerDireccionYClima(lat, lon);
}

function error(err) {
    console.error(`Error al obtener ubicación (${err.code}): ${err.message}`);
    mostrarNotificacion("No se pudo obtener la ubicación. Asegúrate de permitir el acceso.");
}

async function obtenerDireccionYClima(lat, lon) {
    try {
        
        const direccion = await obtenerDireccionExacta(lat, lon);

        
        const clima = await obtenerClimaActual(direccion.ciudad);

        
        mostrarNotificacion(`Estás en: ${direccion.direccion}\nClima actual: ${clima}`);
    } catch (error) {
        console.error('Error obteniendo la dirección y el clima:', error);
        mostrarNotificacion("Error al obtener la dirección y el clima.");
    }
}

async function obtenerDireccionExacta(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
    }

    const data = await response.json();
    console.log("Datos de geocodificación inversa:", data);

    if (data.address) {
        
        const direccion = construirDireccionExacta(data.address);
        const ciudad = data.address.city || data.address.town || data.address.village || "Desconocido";

        return { direccion, ciudad };
    } else {
        throw new Error("No se pudo determinar la dirección.");
    }
}

function construirDireccionExacta(address) {
    
    const calle = address.road || "";
    const numero = address.house_number || "";
    const barrio = address.neighbourhood || address.suburb || "";
    const ciudad = address.city || address.town || address.village || "";
    const provincia = address.state || "";
    const codigoPostal = address.postcode || "";

    
    let direccion = "";
    if (calle && numero) direccion += `${calle} ${numero}, `;
    if (barrio) direccion += `${barrio}, `;
    if (ciudad) direccion += `${ciudad}, `;
    if (provincia) direccion += `${provincia}, `;
    if (codigoPostal) direccion += `${codigoPostal}`;

    
    direccion = direccion.replace(/,\s*$/, "");

    return direccion || "Dirección no disponible";
}

async function obtenerClimaActual(ciudad) {
    
    const lugarFormateado = encodeURIComponent(`${ciudad},ES`); 
    const url = `https://weather-api167.p.rapidapi.com/api/weather/current?place=${lugarFormateado}&units=metric&lang=es&mode=json`;

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': '1b41bbe0a6msh3133953603d1c81p17bdf5jsn2980d7e0d7fe',
            'x-rapidapi-host': 'weather-api167.p.rapidapi.com',
            Accept: 'application/json'
        }
    };

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
    }

    const data = await response.json();
    console.log("Datos del clima actual:", data);

    if (data.main && data.summery) {
        const temperatura = data.main.temprature; 
        const descripcion = data.summery.split(",")[0]; 
        return `${temperatura}°C, ${descripcion}`;
    } else {
        throw new Error("No se pudo obtener el clima actual.");
    }
}

function mostrarNotificacion(mensaje) {
    
    const toast = document.createElement('div');
    toast.textContent = mensaje;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    toast.style.backgroundColor = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '1000';
    toast.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    toast.style.whiteSpace = 'pre-line'; 

    
    document.body.appendChild(toast);

    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 7000);
}

});
