import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";

let handLandmarker = undefined;
let runningMode = "IMAGE";
let webcamRunning = false;

const infoDiv = document.getElementById("info");
const enableWebcamButton = document.getElementById("webcamButton");
const video = document.getElementById("webcam");
const canvasElement = document.getElementById("output_canvas");
const canvasCtx = canvasElement.getContext("2d");
const scoreboard = document.getElementById("scoreboard");

const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: runningMode,
        numHands: 2
    });
};
createHandLandmarker();

const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

if (hasGetUserMedia()) {
    enableWebcamButton.addEventListener("click", enableCam);
} else {
    console.warn("getUserMedia() is not supported by your browser");
}

function enableCam() {
    if (!handLandmarker) {
        console.log("Wait! HandLandmarker not loaded yet.");
        return;
    }

    if (webcamRunning) {
        webcamRunning = false;
        enableWebcamButton.innerText = "Start Playing";
    } else {
        createRandomBlocks(Math.floor(Math.random() * 10) + 5); // Generates between 5-15 blocks
        webcamRunning = true;
        enableWebcamButton.innerText = "STOP TRACKING";
        infoDiv.style.display = "none";
        video.style.display = "none";
        scoreboard.style.display = "block";
        document.getElementById("dropZone").style.display = "block";
    }

    const constraints = { video: true };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}

let lastVideoTime = -1;
let results = undefined;
let grabbedBlock = null;
let score = 0;
// You can adjust or re‑enable smoothing if needed.
// For testing responsiveness on larger screens, it may be best to use the raw coordinates.
const alpha = 0.9;

async function predictWebcam() {
    // The canvas dimensions are set from the video stream.
    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;

    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await handLandmarker.setOptions({ runningMode: "VIDEO" });
    }

    let startTimeMs = performance.now();

    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = handLandmarker.detectForVideo(video, startTimeMs);
    }

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (results.landmarks) {
        for (const landmarks of results.landmarks) {
            drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
                color: "#000000",
                lineWidth: 10
            });
            // Optionally draw landmarks for debugging:
            // drawLandmarks(canvasCtx, landmarks, { color: "#000000", lineWidth: 2 });

            // Pick the index finger tip (landmark index 8).
            const indexFingerTip = landmarks[8];

            // IMPORTANT: Use the viewport dimensions so that the computed x and y match
            // where your blocks are placed (they use window.innerWidth/innerHeight).
            let x = (1 - indexFingerTip.x) * window.innerWidth;
            let y = indexFingerTip.y * window.innerHeight;

            // Optionally, you may choose to re-enable smoothing:
            // const smoothX = x * alpha + previousX * (1 - alpha);
            // const smoothY = y * alpha + previousY * (1 - alpha);
            // previousX = smoothX;
            // previousY = smoothY;
            // x = smoothX; y = smoothY;

            console.log("Finger coordinates:", x, y);

            const blocks = document.querySelectorAll(".random-block");

            // If nothing is grabbed, try to grab one close enough.
            if (!grabbedBlock) {
                blocks.forEach((block) => {
                    const blockRect = block.getBoundingClientRect();
                    const blockCenterX = blockRect.left + blockRect.width / 2;
                    const blockCenterY = blockRect.top + blockRect.height / 2;

                    const distance = Math.sqrt(
                        Math.pow(x - blockCenterX, 2) + Math.pow(y - blockCenterY, 2)
                    );

                    console.log("Distance:", distance);
                    if (distance < 20) { // threshold for grabbing
                        grabbedBlock = block;
                    }
                });
            }

            // If a block is grabbed, move it and check whether it entered the drop zone.
            if (grabbedBlock) {
                grabbedBlock.style.left = `${x - grabbedBlock.offsetWidth / 2}px`;
                grabbedBlock.style.top = `${y - grabbedBlock.offsetHeight / 2}px`;

                const dropZoneRect = document.getElementById("dropZone").getBoundingClientRect();
                const blockRect = grabbedBlock.getBoundingClientRect();

                const isInsideDropZone =
                    blockRect.left >= dropZoneRect.left &&
                    blockRect.right <= dropZoneRect.right &&
                    blockRect.top >= dropZoneRect.top &&
                    blockRect.bottom <= dropZoneRect.bottom;

                if (isInsideDropZone) {
                    // Scoreboard
                    score++;
                    document.getElementById("scoreboard-content-text").innerText = `${score}`;
                    // Release the block once it is inside the drop zone.
                    grabbedBlock = null;
                }
            }
        }
    } else {
        grabbedBlock = null;
    }

    canvasCtx.restore();

    if (webcamRunning) {
        window.requestAnimationFrame(predictWebcam);
    }
}

function createRandomBlocks(numBlocks) {
    const container = document.body;
    const dropZone = document.getElementById("dropZone");

    for (let i = 0; i < numBlocks; i++) {
        const block = document.createElement("div");
        block.className = "random-block";
        block.style.position = "absolute";
        block.style.width = "50px";
        block.style.height = "50px";
        block.style.backgroundColor = getRandomColor();

        // Ensure the block doesn't spawn inside the drop zone.
        let validPosition = false;
        while (!validPosition) {
            const left = Math.random() * (window.innerWidth - 50);
            const top = Math.random() * (window.innerHeight - 50);
            const dropZoneRect = dropZone.getBoundingClientRect();

            // Check if the block overlaps with the drop zone
            const blockRight = left + 50; // Block's right edge
            const blockBottom = top + 50; // Block's bottom edge
            if (
                blockRight < dropZoneRect.left || // Block is entirely left of the drop zone
                left > dropZoneRect.right || // Block is entirely right of the drop zone
                blockBottom < dropZoneRect.top || // Block is entirely above the drop zone
                top > dropZoneRect.bottom // Block is entirely below the drop zone
            ) {
                validPosition = true;
                block.style.left = `${left}px`;
                block.style.top = `${top}px`;
                //continue; // Invalid position; try again.
            }
        }
        container.appendChild(block);
    }
}

function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}  