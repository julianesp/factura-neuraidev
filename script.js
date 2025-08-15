// Variables globales
let rowCounter = 0;

// Función para formatear números como moneda colombiana
function formatCurrency(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "$0";
  }
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Función para agregar una nueva fila
function addRow(description = "", quantity = "", price = "") {
  try {
    rowCounter++;
    const tbody = document.getElementById("servicesBody");
    const row = document.createElement("tr");
    row.id = `row_${rowCounter}`;

    row.innerHTML = `
                    <td>
                        <input type="text" value="${description.toUpperCase()}" placeholder="Descripción del producto/servicio" 
                               onchange="calculateRow(${rowCounter})" onkeyup="calculateRow(${rowCounter})"
                               oninput="this.value = this.value.toUpperCase();">
                    </td>
                    <td class="text-center">
                        <input type="number" value="${quantity}" min="0" step="1" placeholder="0" 
                               onchange="calculateRow(${rowCounter})" oninput="calculateRow(${rowCounter})" onkeyup="calculateRow(${rowCounter})">
                    </td>
                    <td class="text-right">
                        <input type="number" value="${price}" min="0" step="100" placeholder="0" 
                               onchange="calculateRow(${rowCounter})" oninput="calculateRow(${rowCounter})" onkeyup="calculateRow(${rowCounter})">
                    </td>
                    <td class="text-right subtotal currency" id="subtotal_${rowCounter}">$0</td>
                    <td class="text-center">
                        <button class="btn btn-danger btn-small" data-row-id="${rowCounter}" title="Eliminar fila">
                            ✕
                        </button>
                    </td>
                `;

    tbody.appendChild(row);

    // Agregar event listener al botón de eliminar
    const deleteBtn = row.querySelector(".btn-danger");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", function () {
        removeRow(rowCounter);
      });
    }

    calculateRow(rowCounter);
    console.log(`Fila ${rowCounter} agregada exitosamente`);
  } catch (error) {
    console.error("Error al agregar fila:", error);
    alert("Error al agregar la fila. Por favor, intenta de nuevo.");
  }
}

// Función para calcular el subtotal de una fila
function calculateRow(rowId) {
  try {
    const row = document.getElementById(`row_${rowId}`);
    if (!row) {
      console.warn(`Fila ${rowId} no encontrada`);
      return;
    }

    const inputs = row.querySelectorAll("input");
    if (inputs.length < 3) {
      console.warn(`Inputs insuficientes en fila ${rowId}`);
      return;
    }

    const quantity = parseFloat(inputs[1].value) || 0;
    const price = parseFloat(inputs[2].value) || 0;
    const subtotal = quantity * price;

    const subtotalElement = document.getElementById(`subtotal_${rowId}`);
    if (subtotalElement) {
      subtotalElement.textContent = formatCurrency(subtotal);
    }

    calculateTotal();
  } catch (error) {
    console.error(`Error calculando fila ${rowId}:`, error);
  }
}

// Función para calcular el total general
function calculateTotal() {
  try {
    const subtotalElements = document.querySelectorAll('[id^="subtotal_"]');
    let total = 0;

    subtotalElements.forEach((element) => {
      const subtotalText = element.textContent.replace(/[^\d]/g, "");
      const subtotalValue = parseFloat(subtotalText) || 0;
      total += subtotalValue;
    });

    const totalElement = document.getElementById("totalAmount");
    if (totalElement) {
      totalElement.textContent = formatCurrency(total);
    }
  } catch (error) {
    console.error("Error calculando total:", error);
  }
}

// Función para eliminar una fila
function removeRow(rowId) {
  try {
    const row = document.getElementById(`row_${rowId}`);
    if (!row) {
      console.warn(`Fila ${rowId} no encontrada para eliminar`);
      return;
    }

    if (confirm("¿Estás seguro de que deseas eliminar esta fila?")) {
      row.remove();
      calculateTotal();
      console.log(`Fila ${rowId} eliminada exitosamente`);

      // Verificar si quedan filas
      const tbody = document.getElementById("servicesBody");
      if (tbody && tbody.children.length === 0) {
        console.log("No quedan filas en la tabla");
      }
    }
  } catch (error) {
    console.error(`Error eliminando fila ${rowId}:`, error);
    alert("Error al eliminar la fila: " + error.message);
  }
}

// Función para limpiar todas las filas
function clearAll() {
  try {
    const tbody = document.getElementById("servicesBody");
    if (!tbody) {
      console.error("No se encontró el tbody");
      return;
    }

    if (tbody.children.length === 0) {
      alert("No hay productos/servicios para eliminar");
      return;
    }

    if (
      confirm(
        "¿Estás seguro de que deseas eliminar todos los productos/servicios?"
      )
    ) {
      tbody.innerHTML = "";
      calculateTotal();
      console.log("Todas las filas eliminadas");
      alert("Todos los productos/servicios han sido eliminados");
    }
  } catch (error) {
    console.error("Error limpiando todas las filas:", error);
    alert("Error al limpiar. Por favor, recarga la página.");
  }
}

// Función para cargar datos de ejemplo
function loadSampleData() {
  try {
    // Limpiar primero
    document.getElementById("servicesBody").innerHTML = "";

    const sampleData = [
      ["DESAYUNO", 40, 12000],
      ["REFRIGERIO MAÑANA", 40, 6000],
      ["ALMUERZO", 40, 17000],
      ["REFRIGERIO TARDE", 40, 6000],
      ["semillas de chochos, San Pedro, Yoco Pita y Cascabel", 40, 25000],
    ];

    sampleData.forEach(([desc, qty, price]) => {
      addRow(desc, qty, price);
    });

    console.log("Datos de ejemplo cargados");
  } catch (error) {
    console.error("Error cargando datos de ejemplo:", error);
    alert("Error al cargar datos de ejemplo.");
  }
}

// Función para crear una nueva factura
function newInvoice() {
  try {
    if (
      confirm(
        "¿Deseas crear una nueva factura? Se perderán todos los datos actuales."
      )
    ) {
      // Incrementar número de factura
      const invoiceNumberInput = document.querySelector(".invoice-number");
      if (invoiceNumberInput) {
        const currentNumber = parseInt(invoiceNumberInput.value) || 1;
        invoiceNumberInput.value = currentNumber + 1;
      }

      // Actualizar fecha a hoy
      const today = new Date().toISOString().split("T")[0];
      const dateInput = document.getElementById("invoiceDate");
      if (dateInput) {
        dateInput.value = today;
      }

      // Limpiar campos opcionales del cliente (dirección y teléfono)
      const clientInputs = document.querySelectorAll(".client-input");
      if (clientInputs.length >= 5) {
        clientInputs[2].value = ""; // Dirección
        clientInputs[4].value = ""; // Teléfono
      }

      // Limpiar tabla de servicios
      const tbody = document.getElementById("servicesBody");
      if (tbody) {
        tbody.innerHTML = "";
        rowCounter = 0; // Resetear contador
      }
      calculateTotal();

      const newNumber = parseInt(invoiceNumberInput?.value) || 1;
      alert(`✅ Nueva factura #${newNumber} creada exitosamente`);
      console.log(`Nueva factura #${newNumber} creada`);
    }
  } catch (error) {
    console.error("Error creando nueva factura:", error);
    alert("Error al crear nueva factura: " + error.message);
  }
}

// Función para exportar datos a JSON
function exportToJSON() {
  try {
    const invoiceNumber =
      document.querySelector(".invoice-number")?.value || "1";
    const invoiceDate = document.querySelector(".invoice-date")?.value || "";

    const data = {
      invoice: {
        number: invoiceNumber,
        date: invoiceDate,
      },
      client: {
        name: document.querySelectorAll(".client-input")[0]?.value || "",
        event: document.querySelectorAll(".client-input")[1]?.value || "",
        address: document.querySelectorAll(".client-input")[2]?.value || "",
        nit: document.querySelectorAll(".client-input")[3]?.value || "",
        phone: document.querySelectorAll(".client-input")[4]?.value || "",
      },
      services: [],
      total: document.getElementById("totalAmount")?.textContent || "$0",
    };

    // Recopilar servicios
    const rows = document.querySelectorAll("#servicesBody tr");
    rows.forEach((row) => {
      const inputs = row.querySelectorAll("input");
      if (inputs.length >= 3) {
        const quantity = parseFloat(inputs[1].value) || 0;
        const price = parseFloat(inputs[2].value) || 0;
        data.services.push({
          description: inputs[0].value || "",
          quantity: quantity,
          price: price,
          subtotal: quantity * price,
        });
      }
    });

    // Crear y descargar archivo
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `factura_${data.invoice.number}_${
      data.invoice.date || "sin_fecha"
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log("Datos exportados exitosamente");
  } catch (error) {
    console.error("Error exportando datos:", error);
    alert("Error al exportar datos.");
  }
}

// Configuración inicial cuando se carga la página
function initializeApp() {
  try {
    console.log("Inicializando aplicación...");

    // Configurar fecha actual
    const today = new Date().toISOString().split("T")[0];
    const dateInput = document.getElementById("invoiceDate");
    if (dateInput) {
      dateInput.value = today;
    }

    // Configurar event listeners para botones
    const btnAddRow = document.getElementById("btnAddRow");
    const btnClearAll = document.getElementById("btnClearAll");
    const btnLoadSample = document.getElementById("btnLoadSample");
    const btnNewInvoice = document.getElementById("btnNewInvoice");
    const btnPrint = document.getElementById("btnPrint");
    const btnExport = document.getElementById("btnExport");

    if (btnAddRow) {
      btnAddRow.addEventListener("click", () => addRow());
      console.log("Event listener para agregar fila configurado");
    }

    if (btnClearAll) {
      btnClearAll.addEventListener("click", clearAll);
      console.log("Event listener para limpiar todo configurado");
    }

    if (btnLoadSample) {
      btnLoadSample.addEventListener("click", loadSampleData);
      console.log("Event listener para cargar datos de ejemplo configurado");
    }

    if (btnNewInvoice) {
      btnNewInvoice.addEventListener("click", newInvoice);
      console.log("Event listener para nueva factura configurado");
    }

    if (btnPrint) {
      btnPrint.addEventListener("click", function () {
        try {
          window.print();
          console.log("Función de impresión ejecutada");
        } catch (error) {
          console.error("Error al imprimir:", error);
          alert("Error al imprimir: " + error.message);
        }
      });
      console.log("Event listener para imprimir configurado");
    }

    if (btnExport) {
      btnExport.addEventListener("click", exportToJSON);
      console.log("Event listener para exportar configurado");
    }

    // Cargar datos de ejemplo inicialmente
    loadSampleData();

    console.log("✅ Aplicación inicializada correctamente");
    console.log("💡 Para debugging, escribe debugApp() en la consola");

    // Verificar que todos los botones tienen sus listeners
    setTimeout(() => {
      console.log("🔍 Verificando funcionalidad de botones...");
      const testButtons = [
        { id: "btnAddRow", name: "Agregar Producto" },
        { id: "btnClearAll", name: "Limpiar Todo" },
        { id: "btnLoadSample", name: "Cargar Ejemplo" },
        { id: "btnNewInvoice", name: "Nueva Factura" },
        { id: "btnPrint", name: "Imprimir" },
        { id: "btnExport", name: "Exportar" },
      ];

      testButtons.forEach((btn) => {
        const element = document.getElementById(btn.id);
        console.log(`- ${btn.name}:`, element ? "✅ OK" : "❌ ERROR");
      });
    }, 500);
  } catch (error) {
    console.error("Error inicializando aplicación:", error);
    alert("Error al inicializar la aplicación. Por favor, recarga la página.");
  }
}

// Ejecutar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 DOM cargado, inicializando aplicación...");
  initializeApp();
});

// Respaldo: ejecutar después de que se cargue la página
window.addEventListener("load", function () {
  console.log("📄 Página completamente cargada");
  // Solo ejecutar si no se ha inicializado antes
  const tbody = document.getElementById("servicesBody");
  if (tbody && tbody.children.length === 0) {
    console.log("🔄 Ejecutando inicialización de respaldo...");
    setTimeout(initializeApp, 100);
  }
});

// Función de debugging - puedes llamarla desde la consola
function debugApp() {
  console.log("=== DEBUG INFO ===");
  console.log("Row counter:", rowCounter);
  console.log(
    "Services body rows:",
    document.getElementById("servicesBody")?.children.length || 0
  );
  console.log(
    "Total amount:",
    document.getElementById("totalAmount")?.textContent || "N/A"
  );

  const buttons = {
    addRow: document.getElementById("btnAddRow"),
    clearAll: document.getElementById("btnClearAll"),
    loadSample: document.getElementById("btnLoadSample"),
    newInvoice: document.getElementById("btnNewInvoice"),
    print: document.getElementById("btnPrint"),
    export: document.getElementById("btnExport"),
  };

  console.log("Botones encontrados:");
  Object.keys(buttons).forEach((key) => {
    console.log(`- ${key}:`, buttons[key] ? "✅" : "❌");
  });
  console.log("==================");
}

// Hacer funciones disponibles globalmente para debugging
window.debugApp = debugApp;
window.addRow = addRow;
window.clearAll = clearAll;
window.newInvoice = newInvoice;
window.removeRow = removeRow;
