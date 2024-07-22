const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const audioPlayback = document.getElementById('audioPlayback');

let mediaRecorder;
let audioChunks = [];
let socket;

startBtn.addEventListener('click', async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    socket = new WebSocket('ws://localhost:5000/audio');

    mediaRecorder.addEventListener('dataavailable', event => {
        audioChunks.push(event.data);
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(event.data);
        }
    });

    mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayback.src = audioUrl;
        audioChunks = [];
    });

    socket.addEventListener('message', event => {
        const audioBlob = new Blob([event.data], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPlayback.src = audioUrl;
        audioPlayback.play();
    });

    startBtn.disabled = true;
    stopBtn.disabled = false;
});

stopBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    socket.close();
    startBtn.disabled = false;
    stopBtn.disabled = true;
});
