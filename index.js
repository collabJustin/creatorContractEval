const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const message = document.getElementById("message");

// Function to parse PDF using PDF.js
async function parsePdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((item) => item.str).join(' ') + '\n';
    }

    return text.trim();
}

// Function to render parsed text to a textarea
function renderToTextarea(parsedText) {
    const textarea = document.createElement("textarea");
    textarea.textContent = parsedText;
    textarea.style.width = "100%";
    textarea.style.height = "300px";
    textarea.style.marginTop = "20px";
    document.body.appendChild(textarea);
}

// Function to handle file upload
async function handleFileUpload(file) {
    if (file.type !== "application/pdf") {
        message.textContent = "Only PDF files are supported.";
        message.style.color = "red";
        return;
    }

    message.textContent = "Parsing PDF...";
    message.style.color = "blue";

    try {
        const parsedText = await parsePdf(file);
        console.log("Parsed Text:", parsedText);
        message.textContent = "PDF parsed successfully!";
        message.style.color = "green";

        // Render parsed text to a textarea
        renderToTextarea(parsedText);

        // Commented out Xano API call functionality
        // message.textContent = "Uploading to Xano...";
        // await sendToXano(parsedText);
    } catch (error) {
        console.error("Error:", error);
        message.textContent = "Failed to parse the PDF.";
        message.style.color = "red";
    }
}

// Event listener for file input
fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) handleFileUpload(file);
});

// Drag-and-drop functionality
dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragover");
    const file = event.dataTransfer.files[0];
    if (file) handleFileUpload(file);
});
