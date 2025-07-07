// // // // Función para cargar listas de clientes y viajes
// // // async function cargarListas() {
// // //     // Viajes
// // //     const viajes = await fetch("/viajes").then(res => res.json());
// // //     const viajeList = document.getElementById("viaje-list");
// // //     const viajeSelect = document.getElementById("viaje-select");
// // //     viajeList.innerHTML = "";
// // //     viajeSelect.innerHTML = '<option value="">Seleccione un viaje</option>';
  
// // //     viajes.forEach(viaje => {
// // //       const li = document.createElement("li");
// // //       li.textContent = `${viaje.nombre} (${viaje.fecha_inicio} - ${viaje.fecha_fin})`;
// // //       viajeList.appendChild(li);
  
// // //       const option = document.createElement("option");
// // //       option.value = viaje.id;
// // //       option.textContent = viaje.nombre;
// // //       viajeSelect.appendChild(option);
// // //     });
  
// // //     // Clientes
// // //     const clientes = await fetch("/clientes").then(res => res.json());
// // //     const clienteList = document.getElementById("cliente-list");
// // //     const clienteSelect = document.getElementById("cliente-select");
// // //     clienteList.innerHTML = "";
// // //     clienteSelect.innerHTML = '<option value="">Seleccione un cliente</option>';
  
// // //     clientes.forEach(cliente => {
// // //       const li = document.createElement("li");
// // //       li.textContent = `${cliente.nombre} (DNI: ${cliente.dni}) - Puntos: ${cliente.puntos}`;
// // //       clienteList.appendChild(li);
  
// // //       const option = document.createElement("option");
// // //       option.value = cliente.id;
// // //       option.textContent = cliente.nombre;
// // //       clienteSelect.appendChild(option);
// // //     });
// // //   }
  
















// // // //   <!-- <section>
// // // //   <h2>Reservar Cliente en Viaje</h2>
// // // //   <form id="reserva-form">
// // // //     <!-- Campo de búsqueda de cliente -->
// // // //     <input type="text" id="busqueda-cliente" placeholder="Buscar por nombre o DNI" autocomplete="off" />
// // // //     <!-- Lista para mostrar los resultados -->
// // // //     <ul id="resultados-cliente" style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc; display: none;"></ul>
// // // //     <!-- Campo oculto para almacenar el cliente_id seleccionado -->
// // // //     <input type="hidden" id="cliente-id" name="cliente_id" required />
    
// // // //     <!-- Resto del formulario -->
// // // //     <select name="viaje_id" id="viaje-select" required>
// // // //       <option value="">Seleccione un viaje</option>
// // // //     </select>
// // // //     <input type="text" name="transporte" placeholder="Transporte asignado" required />
// // // //     <input type="text" name="hotel_asignado" placeholder="Hotel asignado" required />
// // // //     <button type="submit">Reservar</button>
// // // //   </form>
// // // // </section> -->









// // // <section>
// // //     <h2>Reservar Cliente en Viaje</h2>
// // //     <form id="reserva-form">
// // //       <!-- Buscador de clientes (NO se toca, queda igual) -->
// // //       <input type="text" id="busqueda-cliente" placeholder="Buscar por nombre o DNI" autocomplete="off" />
// // //       <input type="hidden" id="cliente-id" name="cliente_id" />
  
// // //       <ul id="resultados-cliente" style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc;"></ul>
  
// // //       <!-- Select para viajes -->
// // //       <select name="viaje_id" id="viaje-select" required>
// // //         <option value="">Seleccione un viaje</option>
// // //       </select>
  
// // //       <input type="text" name="transporte" placeholder="Transporte asignado" required />
// // //       <input type="text" name="hotel_asignado" placeholder="Hotel asignado" required />
  
// // //       <!-- Opción de pago -->
// // //       <div>
// // //         <label for="metodo-pago">Método de pago:</label>
// // //         <select name="metodo_pago" id="metodo-pago" required>
// // //           <option value="total">Pago total</option>
// // //           <option value="cuotas">Pago en cuotas</option>
// // //         </select>
// // //       </div>




// // <section>
// // <h2>Reservar Cliente en Viaje</h2>
// // <form id="reserva-form">
// //   <!-- Buscador de clientes -->
// //   <input type="text" id="busqueda-cliente" placeholder="Buscar por nombre o DNI" autocomplete="off" />
// //   <input type="hidden" id="cliente-id" name="cliente_id" />

// //   <ul id="resultados-cliente" style="max-height: 150px; overflow-y: auto; border: 1px solid #ccc;"></ul>

// //   <!-- Select para viajes -->
// //   <select name="viaje_id" id="viaje-select" required>
// //     <option value="">Seleccione un viaje</option>
// //   </select>

// //   <input type="text" name="transporte" placeholder="Transporte asignado" required />
// //   <input type="text" name="hotel_asignado" placeholder="Hotel asignado" required />

// //   <!-- Opción de pago -->
// //   <div>
// //     <label for="metodo-pago">Método de pago:</label>
// //     <select name="metodo_pago" id="metodo-pago" required>
// //       <option value="total">Pago total</option>
// //       <option value="cuotas">Pago en cuotas</option>
// //     </select>
// //   </div>

// document.addEventListener("DOMContentLoaded", () => {
//   const metodoPagoSelect = document.getElementById("metodo-pago");
//   const cantidadCuotasSelect = document.getElementById("cantidad-cuotas");
//   const opcionCuotasDiv = document.getElementById("opcion-cuotas");
//   const simuladorCuotasDiv = document.getElementById("simulador-cuotas");
//   const tablaCuotasBody = document.getElementById("tabla-cuotas");
//   const viajeSelect = document.getElementById("viaje-select");

//   // Mostrar/ocultar select de cuotas según el método de pago
//   metodoPagoSelect.addEventListener("change", () => {
//     if (metodoPagoSelect.value === "cuotas") {
//       opcionCuotasDiv.style.display = "block";
//       simuladorCuotasDiv.style.display = "block";
//       calcularCuotas(); // Realizar cálculo inicial
//     } else {
//       opcionCuotasDiv.style.display = "none";
//       simuladorCuotasDiv.style.display = "none";
//       tablaCuotasBody.innerHTML = ""; // Limpiar la tabla si no es pago en cuotas
//     }
//   });

//   // Recalcular cuotas al cambiar el número de cuotas o el viaje seleccionado
//   cantidadCuotasSelect.addEventListener("change", calcularCuotas);
//   viajeSelect.addEventListener("change", calcularCuotas);

//   // Función para calcular y mostrar cuotas
//   async function calcularCuotas() {
//     const viajeId = viajeSelect.value.split("-")[1]; // Obtener el ID del viaje seleccionado
//     if (!viajeId || metodoPagoSelect.value !== "cuotas") return;

//     try {
//       const response = await fetch(`/viajes/${viajeId}`);
//       if (!response.ok) throw new Error("Error al obtener el precio del viaje.");

//       const viaje = await response.json();
//       const precioTotal = parseFloat(viaje.precio);
//       const cantidadCuotas = parseInt(cantidadCuotasSelect.value, 10);

//       if (!precioTotal || !cantidadCuotas) return;

//       const valorCuota = precioTotal / cantidadCuotas;
//       const fechaActual = new Date();

//       // Limpiar la tabla antes de llenarla
//       tablaCuotasBody.innerHTML = "";

//       for (let i = 1; i <= cantidadCuotas; i++) {
//         const fechaCuota = new Date(fechaActual);
//         fechaCuota.setMonth(fechaCuota.getMonth() + i);

//         const row = document.createElement("tr");
//         row.innerHTML = `
//           <td>${i}</td>
//           <td>$${valorCuota.toFixed(2)}</td>
//           <td>${fechaCuota.toLocaleDateString()}</td>
//         `;
//         tablaCuotasBody.appendChild(row);
//       }
//     } catch (error) {
//       console.error("Error al calcular cuotas:", error);
//     }
//   }
// });















// ocument.addEventListener("DOMContentLoaded", () => {
//   const metodoPagoSelect = document.getElementById("metodo-pago");
//   const cantidadCuotasSelect = document.getElementById("cantidad-cuotas");
//   const opcionCuotasDiv = document.getElementById("opcion-cuotas");
//   const simuladorCuotasDiv = document.getElementById("simulador-cuotas");
//   const tablaCuotasBody = document.getElementById("tabla-cuotas");
//   const viajeSelect = document.getElementById("viaje-select");

//   // Mostrar/ocultar select de cuotas según el método de pago
//   metodoPagoSelect.addEventListener("change", () => {
//     if (metodoPagoSelect.value === "cuotas") {
//       opcionCuotasDiv.style.display = "block";
//       simuladorCuotasDiv.style.display = "block";
//       calcularCuotas(); // Realizar cálculo inicial
//     } else {
//       opcionCuotasDiv.style.display = "none";
//       simuladorCuotasDiv.style.display = "none";
//       tablaCuotasBody.innerHTML = ""; // Limpiar la tabla si no es pago en cuotas
//     }
//   });

//   // Recalcular cuotas al cambiar el número de cuotas o el viaje seleccionado
//   cantidadCuotasSelect.addEventListener("change", calcularCuotas);
//   viajeSelect.addEventListener("change", calcularCuotas);

//   // Función para calcular y mostrar cuotas
//   async function calcularCuotas() {
//     const viajeId = viajeSelect.value.split("-")[1]; // Obtener el ID del viaje seleccionado
//     if (!viajeId || metodoPagoSelect.value !== "cuotas") return;

//     try {
//       const response = await fetch(`/viajes/${viajeId}`);
//       if (!response.ok) throw new Error("Error al obtener el precio del viaje.");

//       const viaje = await response.json();
//       const precioTotal = parseFloat(viaje.precio);
//       const cantidadCuotas = parseInt(cantidadCuotasSelect.value, 10);

//       if (!precioTotal || !cantidadCuotas) return;

//       const valorCuota = precioTotal / cantidadCuotas;
//       const fechaActual = new Date();

//       // Limpiar la tabla antes de llenarla
//       tablaCuotasBody.innerHTML = "";

//       for (let i = 1; i <= cantidadCuotas; i++) {
//         const fechaCuota = new Date(fechaActual);
//         fechaCuota.setMonth(fechaCuota.getMonth() + i);

//         const row = document.createElement("tr");
//         row.innerHTML = `
//           <td>${i}</td>
//           <td>$${valorCuota.toFixed(2)}</td>
//           <td>${fechaCuota.toLocaleDateString()}</td>
//         `;
//         tablaCuotasBody.appendChild(row);
//       }
//     } catch (error) {
//       console.error("Error al calcular cuotas:", error);
//     }
//   }

//   // Cargar opciones iniciales de viajes
//   async function cargarViajes() {
//     try {
//       const response = await fetch("/viajes");
//       const viajes = await response.json();

//       viajeSelect.innerHTML = '<option value="">Seleccione un viaje</option>';
//       viajes.forEach((viaje) => {
//         const option = document.createElement("option");
//         option.value = `viaje-${viaje.id}`;
//         option.textContent = `${viaje.nombre} - $${viaje.precio}`;
//         viajeSelect.appendChild(option);
//       });
//     } catch (error) { 
//       console.error("Error al cargar viajes:", error);
//     }
//   }

//   cargarViajes();
// });