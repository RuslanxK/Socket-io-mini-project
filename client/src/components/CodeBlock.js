import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';

const socket = io('https://socket-io-mini-project-server.onrender.com');

const CodeBlock = () => {
    const { id } = useParams();
    const { state } = useLocation();
    const { isMentor } = state || {}; // Get the role from navigation state
    const [code, setCode] = useState('');
    const [solution, setSolution] = useState('');
    const [editorCode, setEditorCode] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_SERVER_URL}/codeblocks/${id}`)
            .then(response => {
                setCode(response.data.code);
                setSolution(response.data.solution);
                setEditorCode(response.data.code);
            })
            .catch(error => console.error('Error fetching code block:', error));

        // Listen for code updates from other users
        socket.on('codeUpdate', (data) => {
            console.log('Code update received:', data);
            setEditorCode(data.code);
        });

        return () => {
            socket.off('codeUpdate');
        };
    }, [id]);

    useEffect(() => {
        // Check if the editor code matches the solution
        setIsCorrect(editorCode === solution);
    }, [editorCode, solution]);

    const handleChange = (e) => {
        const newCode = e.target.value;
        setEditorCode(newCode);
        socket.emit('codeChange', { id, code: newCode });

        // Optionally, save to DB immediately if needed
        axios.put(`${process.env.REACT_APP_SERVER_URL}/${id}`, { code: newCode })
            .then(response => console.log('Code updated in DB:', response.data))
            .catch(error => console.error('Error updating code in DB:', error));

        setIsCorrect(newCode === solution);
    };

    const renderHighlightedCode = (code) => {
        return { __html: hljs.highlight(code, { language: 'javascript' }).value };
    };

    return (
        <div>
            <h1>Code Block - I'm {isMentor ? 'Tom the mentor' : 'the student'}</h1>
            <pre>
                <code dangerouslySetInnerHTML={renderHighlightedCode(solution)} />
            </pre>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <textarea
                    value={editorCode}
                    onChange={handleChange}
                    readOnly={isMentor}
                    placeholder="Your solution goes here..."
                    style={{
                        width: '50%',
                        height: '400px',
                        padding: '10px',
                        backgroundColor: isCorrect ? '#d4edda' : null,
                        caretColor: 'black',
                    }}
                />
                {isCorrect && (
                    <div style={{ marginLeft: '200px' }}>
                        <span style={{ fontSize: '60px' }}>Success</span>
                        <span style={{ fontSize: '120px' }}>😊</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeBlock;
