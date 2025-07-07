const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));


const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Error al conectar con la base de datos:", err.message);
    } else {
        console.log("Base de datos SQLite conectada a ./database.db");
       
        initializeDatabase();
    }
});


function initializeDatabase() {
    db.serialize(() => {
        // Tabla: viajes
        db.run(`
            CREATE TABLE IF NOT EXISTS viajes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                descripcion TEXT,
                fecha_inicio TEXT NOT NULL,
                fecha_fin TEXT NOT NULL,
                transporte TEXT,
                capacidad INTEGER NOT NULL
            )
        `, (err) => {
            if (err) console.error("Error al crear tabla 'viajes':", err.message);
        });

        //  clientes
        db.run(`
            CREATE TABLE IF NOT EXISTS clientes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                dni TEXT UNIQUE NOT NULL,
                email TEXT,
                telefono TEXT,
                notas TEXT
            )
        `, (err) => {
            if (err) console.error("Error al crear tabla 'clientes':", err.message);
        });

        // reservas
        db.run(`
            CREATE TABLE IF NOT EXISTS reservas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente_id INTEGER,
                viaje_id TEXT, -- Cambiado a TEXT para guardar 'viaje-ID' o 'combo-ID'
                transporte TEXT,
                hotel_asignado TEXT,
                estado_pago TEXT DEFAULT 'pendiente',
                FOREIGN KEY(cliente_id) REFERENCES clientes(id)
                -- FOREIGN KEY(viaje_id) REFERENCES viajes(id) -- Se elimina FOREIGN KEY directo por el ID compuesto
            )
        `, (err) => {
            if (err) console.error("Error al crear tabla 'reservas':", err.message);
        });

        //  historial_puntos
        db.run(`
            CREATE TABLE IF NOT EXISTS historial_puntos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente_id INTEGER,
                descripcion TEXT,
                puntos INTEGER,
                fecha TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(cliente_id) REFERENCES clientes(id)
            )
        `, (err) => {
            if (err) console.error("Error al crear tabla 'historial_puntos':", err.message);
        });

        
        db.run(`
            CREATE TABLE IF NOT EXISTS combos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                destino TEXT NOT NULL,
                personas INTEGER NOT NULL,
                descuento REAL,
                tipo_descuento TEXT NOT NULL
            )
        `, (err) => {
            if (err) console.error("Error al crear tabla 'combos':", err.message);
        });

       
        db.run(`
            CREATE TABLE IF NOT EXISTS tipos_descuento (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT UNIQUE NOT NULL
            )
        `, (err) => {
            if (err) console.error("Error al crear tabla 'tipos_descuento':", err.message);
        });


        const addColumn = (tableName, columnName, columnType, defaultValue = null) => {
           
            db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
                if (err) {
                    console.error(`Error al verificar columnas de ${tableName}:`, err.message);
                    return;
                }
           
                const columnExists = Array.isArray(rows) && rows.some(col => col.name === columnName);
                
                if (!columnExists) {
                    const defaultValueSql = defaultValue !== null ? ` DEFAULT ${defaultValue}` : '';
                    db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}${defaultValueSql}`, (err) => {
                        if (err) {
                            console.error(`Error al agregar columna ${columnName} a ${tableName}:`, err.message);
                        } else {
                            console.log(`Columna '${columnName}' agregada a la tabla '${tableName}'.`);
                        }
                    });
                } else {
                    console.log(`La columna '${columnName}' ya existe en la tabla '${tableName}'.`);
                }
            });
        };

     
        addColumn('clientes', 'puntos', 'INTEGER', 0);
        
      
        addColumn('viajes', 'precio', 'REAL'); 

        addColumn('combos', 'precio', 'REAL');
    });
}


app.post("/viajes", (req, res) => {
    const { nombre, descripcion, fecha_inicio, fecha_fin, transporte, capacidad, precio } = req.body;

   
    if (!nombre || !fecha_inicio || !fecha_fin || !capacidad || precio === undefined || precio === null) {
        return res.status(400).send("Faltan campos obligatorios para crear el viaje (nombre, fechas, capacidad, precio).");
    }

    const query = `
        INSERT INTO viajes (nombre, descripcion, fecha_inicio, fecha_fin, transporte, capacidad, precio)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [nombre, descripcion, fecha_inicio, fecha_fin, transporte, capacidad, precio], function (err) {
        if (err) {
            console.error("Error al crear viaje:", err.message);
            res.status(500).send("Error al crear viaje.");
        } else {
            res.status(201).send("Viaje creado con éxito. ID: " + this.lastID);
        }
    });
});


app.get("/viajes", (req, res) => {
    const query = "SELECT * FROM viajes";
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error al obtener viajes:", err.message);
            res.status(500).send("Error al obtener viajes.");
        } else {
            res.status(200).json(rows);
        }
    });
});

app.get("/viajes/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM viajes WHERE id = ?";
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error("Error al obtener viaje por ID:", err.message);
            return res.status(500).json({ error: "Error al obtener viaje." });
        }
        if (!row) {
            return res.status(404).json({ message: "Viaje no encontrado." });
        }
        res.json(row);
    });
});



app.post("/clientes", (req, res) => {
    const { nombre, dni, email, telefono, notas } = req.body;

    if (!nombre || !dni) {
        return res.status(400).send("Nombre y DNI son campos obligatorios para el cliente.");
    }

    const checkQuery = "SELECT COUNT(*) AS count FROM clientes WHERE dni = ?";
    db.get(checkQuery, [dni], (err, row) => {
        if (err) {
            console.error("Error al verificar el DNI:", err.message);
            res.status(500).send("Error interno al verificar el DNI.");
        } else if (row.count > 0) {
            res.status(400).send("El DNI ya está registrado.");
        } else {
            const query = `
                INSERT INTO clientes (nombre, dni, email, telefono, notas, puntos)
                VALUES (?, ?, ?, ?, ?, 0)
            `; 
            db.run(query, [nombre, dni, email, telefono, notas], function (err) {
                if (err) {
                    console.error("Error al crear cliente:", err.message);
                    res.status(500).send("Error al crear cliente.");
                } else {
                    res.status(201).send("Cliente creado con éxito. ID: " + this.lastID);
                }
            });
        }
    });
});


app.get("/clientes", (req, res) => {
    const query = `
        SELECT id, nombre, dni, email, telefono, puntos
        FROM clientes
    `;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error al obtener clientes:", err.message);
            res.status(500).json({ error: "Error al obtener clientes" });
        } else {
            res.status(200).json(rows);
        }
    });
});

// Ruta para buscar clientes por nombre o DNI
app.get("/clientes/buscar", (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: "Debe proporcionar un término de búsqueda." });
    }

    const searchQuery = `
        SELECT id, nombre, dni
        FROM clientes
        WHERE nombre LIKE ? OR dni LIKE ?
        LIMIT 10
    `;

    db.all(searchQuery, [`%${query}%`, `%${query}%`], (err, rows) => {
        if (err) {
            console.error("Error al buscar clientes:", err.message);
            res.status(500).json({ error: "Error al buscar clientes." });
        } else {
            res.status(200).json(rows);
        }
    });
});

//  para crear una reserva
app.post("/reservas", (req, res) => {
    const { cliente_id, viaje_id, transporte, hotel_asignado } = req.body;

    if (!cliente_id || !viaje_id || !transporte || !hotel_asignado) {
        return res.status(400).send("Faltan campos obligatorios para crear la reserva.");
    }

    const reservaQuery = `
        INSERT INTO reservas (cliente_id, viaje_id, transporte, hotel_asignado)
        VALUES (?, ?, ?, ?)
    `;
    const updatePuntosQuery = `
        UPDATE clientes SET puntos = puntos + 10 WHERE id = ?
    `;
    const insertHistorial = `
        INSERT INTO historial_puntos (cliente_id, descripcion, puntos)
        VALUES (?, 'Reserva completada', 10)
    `;

    db.run(reservaQuery, [cliente_id, viaje_id, transporte, hotel_asignado], function (err) {
        if (err) {
            console.error("Error al crear reserva:", err.message);
            res.status(500).send("Error al crear reserva.");
        } else {
            // Actualizar puntos
            db.run(updatePuntosQuery, [cliente_id], (err) => {
                if (err) {
                    console.error("Error al actualizar puntos después de reserva:", err.message);
                    res.status(500).send("Reserva creada, pero error al actualizar puntos.");
                } else {
                    // Registrar historial
                    db.run(insertHistorial, [cliente_id], (err) => {
                        if (err) {
                            console.error("Error al registrar historial de reserva:", err.message);
                            res.status(500).send("Reserva creada, puntos otorgados, pero error al registrar historial.");
                        } else {
                            res.status(201).send("Reserva creada, puntos otorgados e historial actualizado.");
                        }
                    });
                }
            });
        }
    });
});

// obtener reservas con filtros
app.get("/reservas", (req, res) => {
    const { cliente, viaje, estado_pago } = req.query;

    let query = `
        SELECT 
            reservas.id AS id, 
            clientes.nombre AS cliente, 
            COALESCE(viajes.nombre, combos.nombre) AS viaje, 
            reservas.transporte AS transporte, 
            reservas.hotel_asignado AS hotel_asignado, 
            reservas.estado_pago AS estado_pago
        FROM reservas
        LEFT JOIN clientes ON reservas.cliente_id = clientes.id
        LEFT JOIN viajes ON (SUBSTR(reservas.viaje_id, 1, INSTR(reservas.viaje_id, '-') - 1) = 'viaje' AND CAST(SUBSTR(reservas.viaje_id, INSTR(reservas.viaje_id, '-') + 1) AS INTEGER) = viajes.id)
        LEFT JOIN combos ON (SUBSTR(reservas.viaje_id, 1, INSTR(reservas.viaje_id, '-') - 1) = 'combo' AND CAST(SUBSTR(reservas.viaje_id, INSTR(reservas.viaje_id, '-') + 1) AS INTEGER) = combos.id)
    `;
    
    const filters = [];
    const params = [];

    if (cliente) {
        filters.push("clientes.nombre LIKE ?");
        params.push(`%${cliente}%`);
    }

    if (viaje) {
        // Buscar tanto en nombres de viajes como de combos
        filters.push("(viajes.nombre LIKE ? OR combos.nombre LIKE ?)");
        params.push(`%${viaje}%`, `%${viaje}%`);
    }

    if (estado_pago) {
        filters.push("reservas.estado_pago = ?");
        params.push(estado_pago);
    }

    if (filters.length > 0) {
        query += ` WHERE ${filters.join(" AND ")}`;
    }

    query += " ORDER BY reservas.id DESC"; // Ordenar para ver las más recientes

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error("Error al obtener reservas con filtros:", err.message);
            res.status(500).json({ error: "Error al obtener reservas", detalle: err.message });
        } else {
            console.log("Reservas filtradas:", rows);
            res.status(200).json(rows);
        }
    });
});

// Ruta para canjear puntos de cliente
app.post("/clientes/canjear", (req, res) => {
    const { cliente_id, puntos_a_canjear } = req.body;

    if (!cliente_id || puntos_a_canjear === undefined || puntos_a_canjear <= 0) {
        return res.status(400).send("ID de cliente y puntos a canjear válidos son obligatorios.");
    }

    const checkPuntosQuery = `
        SELECT puntos FROM clientes WHERE id = ?
    `;
    const updatePuntosQuery = `
        UPDATE clientes SET puntos = puntos - ? WHERE id = ?
    `;
    const insertHistorialCanje = `
        INSERT INTO historial_puntos (cliente_id, descripcion, puntos)
        VALUES (?, 'Puntos canjeados', ?)
    `;

    db.get(checkPuntosQuery, [cliente_id], (err, row) => {
        if (err) {
            console.error("Error al verificar puntos:", err.message);
            res.status(500).send("Error al verificar puntos.");
        } else if (!row) {
            res.status(404).send("Cliente no encontrado.");
        } else if (row.puntos < puntos_a_canjear) {
            res.status(400).send("Puntos insuficientes.");
        } else {
            db.run(updatePuntosQuery, [puntos_a_canjear, cliente_id], (err) => {
                if (err) {
                    console.error("Error al canjear puntos:", err.message);
                    res.status(500).send("Error al canjear puntos.");
                } else {
                    db.run(insertHistorialCanje, [cliente_id, -puntos_a_canjear], (err) => {
                        if (err) {
                            console.error("Error al registrar historial de canje:", err.message);
                            res.status(500).send("Error al registrar historial de canje.");
                        } else {
                            res.status(200).send("Puntos canjeados con éxito y historial actualizado.");
                        }
                    });
                }
            });
        }
    });
});

// Ruta para crear un combo
app.post("/combos", (req, res) => {
    const { nombre, destino, personas, descuento, tipo_descuento, precio } = req.body;

    if (!nombre || !destino || !personas || !tipo_descuento || precio === undefined || precio === null) {
        return res.status(400).send("Faltan campos obligatorios para crear el combo (nombre, destino, personas, tipo de descuento, precio).");
    }

    const query = `
        INSERT INTO combos (nombre, destino, personas, descuento, tipo_descuento, precio)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [nombre, destino, personas, descuento, tipo_descuento, precio], function (err) {
        if (err) {
            console.error("Error al guardar combo:", err.message);
            res.status(500).send("Error al guardar combo.");
        } else {
            res.status(201).send("Combo guardado con éxito. ID: " + this.lastID);
        }
    });
});

//  para obtener todos los combos
app.get("/combos", (req, res) => {
    const query = "SELECT * FROM combos";
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error al obtener combos:", err.message);
            res.status(500).send("Error al obtener combos.");
        } else {
            res.status(200).json(rows);
        }
    });
});

//combo por ID
app.get("/combos/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM combos WHERE id = ?";
    db.get(query, [id], (err, row) => {
        if (err) {
            console.error("Error al obtener combo por ID:", err.message);
            return res.status(500).json({ error: "Error al obtener combo." });
        }
        if (!row) {
            return res.status(404).json({ message: "Combo no encontrado." });
        }
        res.json(row);
    });
});

// descuento
app.post("/tipos-descuento", (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).send("El nombre del tipo de descuento es obligatorio.");
    }

    const query = `
        INSERT INTO tipos_descuento (nombre)
        VALUES (?)
    `;

    db.run(query, [nombre], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE")) {
                res.status(400).send("El tipo de descuento ya existe.");
            } else {
                console.error("Error al guardar el tipo de descuento:", err.message);
                res.status(500).send("Error al guardar el tipo de descuento.");
            }
        } else {
            res.status(201).send("Tipo de descuento guardado con éxito. ID: " + this.lastID);
        }
    });
});

// obtener todos los tipos de descuento q hayan
app.get("/tipos-descuento", (req, res) => {
    const query = "SELECT nombre FROM tipos_descuento";
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("Error al obtener tipos de descuento:", err.message);
            res.status(500).send("Error al obtener tipos de descuento.");
        } else {
            
            res.status(200).json(rows.map(row => row.nombre)); 
        }
    });
});


// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});