const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/codeblocks')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const codeBlockSchema = new mongoose.Schema({
    title: String,
    code: String,
    solution: String
});

const CodeBlock = mongoose.model('CodeBlock', codeBlockSchema);

app.get('/codeblocks', async (req, res) => {
    try {
        const blocks = await CodeBlock.find();
        res.json(blocks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/codeblocks/:id', async (req, res) => {
    try {
        const block = await CodeBlock.findById(req.params.id);
        if (!block) {
            return res.status(404).json({ message: 'Code block not found' });
        }
        res.json(block);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/codeblocks/:id', async (req, res) => {
    try {
        const updatedBlock = await CodeBlock.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBlock) {
            return res.status(404).json({ message: 'Code block not found' });
        }
        res.json(updatedBlock);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

let mentorAssigned = false;
let mentorSocketId = null;


io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    if (!mentorAssigned) {
        mentorAssigned = true;
        mentorSocketId = socket.id;
        socket.emit('role', 'mentor');
    } else {
        socket.emit('role', 'student');
    }

    socket.on('codeChange', async (data) => {
        console.log('Code change received:', data);

        // Save the code change to the database
        try {
            await CodeBlock.findByIdAndUpdate(data.id, { code: data.code });
            // Broadcast the code update to all other clients
            socket.broadcast.emit('codeUpdate', data);
        } catch (error) {
            console.error('Error updating code block:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        if (socket.id === mentorSocketId) {
            mentorAssigned = false;
            mentorSocketId = null;
        }
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
