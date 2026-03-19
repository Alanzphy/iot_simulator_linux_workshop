const http = require('http');

// Variable global para controlar el "Chaos Monkey"
let isChaosMode = false;

const server = http.createServer((req, res) => {
    // Evitamos problemas de CORS si luego quieres hacer un dashboard web
    res.setHeader('Access-Control-Allow-Origin', '*');

    // ---------------------------------------------------------
    // RUTA 1: EL FLUJO DE DATOS EN TIEMPO REAL (/stream)
    // ---------------------------------------------------------
    if (req.url === '/stream') {
        // Configuramos la cabecera para mantener la conexión abierta
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked'
        });

        // Generamos un nuevo dato cada 1.5 segundos
        const interval = setInterval(() => {
            // Generar timestamp con formato YYYY-MM-DD HH:mm:ss
            const now = new Date();
            const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
            
            const zonas = ['ZONA_NORTE', 'ZONA_SUR', 'ZONA_ESTE', 'ZONA_OESTE'];
            const zona = zonas[Math.floor(Math.random() * zonas.length)];

            let tmp, hum, estado;

            if (isChaosMode) {
                // MODO CAOS: Temperaturas altísimas, humedad casi nula
                tmp = Math.floor(Math.random() * (95 - 80 + 1)) + 80; // 80°C a 95°C
                hum = Math.floor(Math.random() * (10 - 0 + 1)) + 0;   // 0% a 10%
                estado = 'CRITICO';
            } else {
                // MODO NORMAL: Datos estables de un cultivo
                tmp = Math.floor(Math.random() * (30 - 18 + 1)) + 18; // 18°C a 30°C
                // Mantenemos la humedad entre 35 y 80, pero de vez en cuando (5% de las veces) 
                // hacemos que baje a 28 para que los scripts de los alumnos salten naturalmente.
                const trampa = Math.random();
                hum = trampa > 0.95 ? Math.floor(Math.random() * (29 - 25 + 1)) + 25 : Math.floor(Math.random() * (80 - 35 + 1)) + 35;
                estado = hum < 30 ? 'ALERTA_TEMPORAL' : 'NORMAL';
            }

            // Construimos la línea de texto final
            const dataLine = `${timestamp} | ${zona} | TMP: ${tmp}C | HUM: ${hum}% | ESTADO: ${estado}\n`;
            
            // Enviamos la línea a la terminal del alumno
            res.write(dataLine);

        }, 1500); // 1500 milisegundos = 1.5 segundos

        // Si el alumno cancela el comando (Ctrl+C), cerramos su intervalo para no saturar tu RAM
        req.on('close', () => {
            clearInterval(interval);
        });

    // ---------------------------------------------------------
    // RUTA 2: EL BOTÓN DEL PÁNICO (Solo para ti)
    // ---------------------------------------------------------
    } else if (req.url === '/chaos/activate') {
        isChaosMode = true;
        res.end('🔥 MODO CAOS ACTIVADO: Todos los sensores reportando valores criticos.\n');

    } else if (req.url === '/chaos/deactivate') {
        isChaosMode = false;
        res.end('✅ MODO CAOS DESACTIVADO: Los sensores vuelven a la normalidad.\n');

    // ---------------------------------------------------------
    // RUTA 3: RUTA POR DEFECTO
    // ---------------------------------------------------------
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Servidor de Sensores IoT. Para ver los datos, conectate usando: curl -sN http://tu-ip/stream\n');
    }
});

const PORT = 5111;
server.listen(PORT, () => {
    console.log(`Servidor IoT emitiendo datos en el puerto ${PORT}`);
    console.log(`Para probar el flujo, http://localhost:${PORT}/stream`);
});