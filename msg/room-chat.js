const myIdDisplay = document.getElementById('my-id');
const statusDisplay = document.getElementById('status');
const chatBox = document.getElementById('chat-box');
const messageField = document.getElementById('message-field');
const sendBtn = document.getElementById('send-btn');

let peer
let connections = {};

function initRoom(){

    peer = new Peer('panchatantraAparatchik');

    peer.on('open', (id) => {
        myIdDisplay.innerText = id;

        // You are the host - generate a shareable link
        const shareLink = `${window.location.origin}${window.location.pathname}?room=${id}`;
        statusDisplay.innerHTML = `Hosting. Share this link: <br><small>${shareLink}</small>`;

        messageField.disabled = false;
        sendBtn.disabled = false;
    }
    );
    // Handle incoming connections
    peer.on('connection', (conn) => {
        setupConnection(peer, conn);
    }
    );

    peer.on('error', (err) => {
        throw new Error(err);
    }
    );
}

function joinRoom() {

    peer = new Peer();

    peer.on('open', (id) => {
        myIdDisplay.innerText = id;

        connectToPeer('panchatantraAparatchik');

        messageField.disabled = false;
        sendBtn.disabled = false;
    }
    );
    // Handle incoming connections
    peer.on('connection', (conn) => {
        setupConnection(conn);
    }
    );

    peer.on('error', (err) => {
        throw new Error(err);
    }
    );
}

function connectToPeer(targetId) {
    const conn = peer.connect(targetId);
    setupConnection(conn);
}

function setupConnection(conn) {
    if (connections[conn.peer])
        return;
    // Avoid duplicates

    conn.on('open', () => {
        connections[conn.peer] = conn;
        addMessage(`System: ${conn.peer.substring(0, 5)} joined.`, 'system');

        conn.on('data', (data) => {
            // Handle Mesh: If we receive a list of other peers, connect to them too
            if (data.type === 'peer-list') {
                data.peers.forEach(pId => {
                    if (pId !== peer.id)
                        connectToPeer(pId);
                }
                );
            } else {
                addMessage(`${conn.peer.substring(0, 4)}: ${data}`, 'peer');
            }
        }
        );

        // Inform the new person about everyone else already in the chat
        conn.send({
            type: 'peer-list',
            peers: Object.keys(connections)
        });
    }
    );

    conn.on('close', () => {
        addMessage("System: A friend left.", 'system');
        delete connections[conn.peer];
    }
    );
}

function sendMessage() {
    const msg = messageField.value;
    if (msg) {
        Object.values(connections).forEach(conn => conn.send(msg));
        addMessage(`You: ${msg}`, 'self');
        messageField.value = "";
    }
}

sendBtn.addEventListener('click', sendMessage);

messageField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter')
        sendMessage();
}
);

function addMessage(text, type) {
    const div = document.createElement('div');
    div.classList.add('msg', type);
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

window.addEventListener('beforeunload', () => {
    peer.destroy();
}
);
