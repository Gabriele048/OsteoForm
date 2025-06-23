document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("templateSelect");

  // 1. Carica i nomi dei template dal backend
  fetch("/list-templates")
    .then((res) => res.json())
    .then((templates) => {
      templates.forEach((tpl) => {
        const option = document.createElement("option");
        option.value = tpl;
        option.textContent = tpl;
        select.appendChild(option);
      });
    })
    .catch((err) => {
      console.error("Errore nel caricamento dei template:", err);
    });

  // 2. Quando l'utente seleziona un template, lo carica e costruisce il form
  select.addEventListener("change", () => {
    const filename = select.value;
    if (!filename) return;

    fetch(`/templates/${filename}`)
      .then((res) => res.json())
      .then((template) => {
        generateForm(template);
      });
  });
});

// Costruisce il form dinamico
function generateForm(template) {
  const form = document.getElementById("dynamicForm");
  form.innerHTML = ""; // Pulisce il form

  // Titolo del template (opzionale)
  const title = document.createElement("h2");
  title.textContent = template.title;
  form.appendChild(title);

  template.fields.forEach((field) => {
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "1rem";

    const label = document.createElement("label");
    label.textContent = field.label;
    label.htmlFor = field.name;
    wrapper.appendChild(label);
    wrapper.appendChild(document.createElement("br"));

    let input;

    switch (field.type) {
      case "text":
      case "number":
        input = document.createElement("input");
        input.type = field.type;
        input.name = field.name;
        input.id = field.name;
        break;

      case "textarea":
        input = document.createElement("textarea");
        input.name = field.name;
        input.id = field.name;
        break;

      case "select":
        input = document.createElement("select");
        input.name = field.name;
        input.id = field.name;
        field.options.forEach(opt => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          input.appendChild(option);
        });
        break;

      case "checkbox":
        input = document.createElement("div");
        field.options.forEach(opt => {
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.name = field.name;
          checkbox.value = opt;
          checkbox.id = `${field.name}_${opt}`;

          const cbLabel = document.createElement("label");
          cbLabel.textContent = opt;
          cbLabel.htmlFor = checkbox.id;

          input.appendChild(checkbox);
          input.appendChild(cbLabel);
          input.appendChild(document.createElement("br"));
        });
        break;

      case "radio":
        input = document.createElement("div");
        field.options.forEach(opt => {
          const radio = document.createElement("input");
          radio.type = "radio";
          radio.name = field.name;
          radio.value = opt;
          radio.id = `${field.name}_${opt}`;

          const radioLabel = document.createElement("label");
          radioLabel.textContent = opt;
          radioLabel.htmlFor = radio.id;

          input.appendChild(radio);
          input.appendChild(radioLabel);
          input.appendChild(document.createElement("br"));
        });
        break;

      default:
        console.warn(`Tipo di campo non supportato: ${field.type}`);
        break;
    }

    if (input && field.type !== "checkbox" && field.type !== "radio") {
      if (field.required) input.required = true;
      wrapper.appendChild(input);
    } else {
      wrapper.appendChild(input);
    }

    form.appendChild(wrapper);
  });

  // Pulsante di salvataggio (in futuro per PDF)
  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Salva come PDF";
  submitBtn.type = "submit";
  form.appendChild(submitBtn);
}

document.getElementById("dynamicForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Crea un contenitore con i dati da convertire in PDF
  const form = e.target;
  const formData = new FormData(form);
  const output = document.createElement("div");
  output.style.padding = "20px";

  formData.forEach((value, key) => {
    if (output.querySelector(`[data-name="${key}"]`)) {
      output.querySelector(`[data-name="${key}"]`).textContent += `, ${value}`;
    } else {
      const p = document.createElement("p");
      p.innerHTML = `<strong>${key}:</strong> <span data-name="${key}">${value}</span>`;
      output.appendChild(p);
    }
  });

  // Opzioni di html2pdf
  const opt = {
    margin:       0.5,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
  };

  // Genera il PDF come blob e lo passa alla funzione downloadPDF
  html2pdf().set(opt).from(output).outputPdf('blob').then(function(pdfBlob) {
    downloadPDF(pdfBlob);
  });
});

function downloadPDF(blob) {
  const defaultName = "anamnesi.pdf";
  const fileName = prompt("Inserisci il nome del file PDF:", defaultName);
  if (!fileName) return;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

