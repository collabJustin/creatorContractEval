const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const message = document.getElementById("message");
const xanoEndpoint = "https://xusa-koty-9h9b.n7d.xano.io/api:V7CzFpuo/analyze";

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

// Function to send parsed text to Xano
async function sendToXano(parsedText) {
    try {
        const response = await fetch(xanoEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ contract_text: parsedText }) // Key updated to "contract_text"
        });

        if (!response.ok) {
            console.error("Failed to communicate with the server:", response.statusText);
            throw new Error("Failed to communicate with the server.");
        }

        const result = await response.json();


        // Adjusted path to access message content
        const messageContent = result?.response?.result?.choices?.[0]?.message?.content;

        if (messageContent) {
            renderResult(messageContent); // Render the extracted content
        } else {
            console.error("Unexpected response structure:", result); // Log the full response for debugging
            throw new Error("Could not extract the response content.");
        }

        message.textContent = "Analysis complete!";
        message.style.color = "green";
    } catch (error) {
        console.error("Error:", error.message);
        message.textContent = "An error occurred while analyzing the document.";
        message.style.color = "red";
    }
}

// Function to render the extracted result inside a textarea
function renderResult(textContent) {
    // Create a textarea element
    const textarea = document.createElement("textarea");
    textarea.value = textContent;
    textarea.rows = 20;
    textarea.cols = 80;
    textarea.style.marginTop = "20px";
    textarea.style.width = "100%";
    textarea.style.fontSize = "16px";

    // Append the textarea to the page
    const container = document.body;
    container.appendChild(textarea);
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

        message.textContent = "Uploading to Xano...";
        await sendToXano(parsedText);
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
