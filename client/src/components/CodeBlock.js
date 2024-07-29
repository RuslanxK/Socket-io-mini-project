import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';


const socket = io('http://localhost:5000');

const CodeBlock = () => {
    const { id } = useParams();
    const [code, setCode] = useState('');
    const [solution, setSolution] = useState('');
    const [editorCode, setEditorCode] = useState('');
    const [isMentor, setIsMentor] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        
        axios.get(`http://localhost:5000/codeblocks/${id}`)
            .then(response => {
                setCode(response.data.code);
                setSolution(response.data.solution);
                setEditorCode(response.data.code);

            })
            .catch(error => console.error('Error fetching code block:', error));

        // Listen for role assignment
        socket.on('role', (role) => {
            setIsMentor(role === 'mentor');
            console.log('Role assigned:', role);
        });

        // Listen for code updates from other users
        socket.on('codeUpdate', (data) => {
            console.log('Code update received:', data);
         
                setEditorCode(data.code);
            
        });

        return () => {
            socket.off('role');
            socket.off('codeUpdate');
        };
    }, [id, isMentor]);


    useEffect(() => {
        // Check if the editor code matches the solution
        if (editorCode === solution) {
            setIsCorrect(true);
        } else {
            setIsCorrect(false);
        }
    }, [editorCode, solution]);



    const handleChange = (e) => {

        const newCode = e.target.value;
        setEditorCode(newCode);
        socket.emit('codeChange', { id, code: newCode });

        // Optionally, save to DB immediately if needed
        axios.put(`http://localhost:5000/codeblocks/${id}`, { code: newCode })
            .then(response => {
                console.log('Code updated in DB:', response.data);
            })
            .catch(error => console.error('Error updating code in DB:', error));

            if (newCode === solution) {
                setIsCorrect(true);
            } else {
                setIsCorrect(false);
            }
    };


    const renderHighlightedCode = (code) => {
        return { __html: hljs.highlight(code, { language: 'javascript' }).value };
    };

    return (
        <div>
            <h1>Code Block - I'm {isMentor ? 'Tom the mentor' : "Student"}</h1>
            <pre>
                <code dangerouslySetInnerHTML={renderHighlightedCode(solution)}/>
            </pre>

            <div style={{display: "flex", alignItems: "center"}}>
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

               { isCorrect ? <div style={{  marginLeft: "200px"}}>
                    <span style={{ fontSize: '60px'}}>Success</span>
                      <span style={{ fontSize: '120px'}} >😊</span>
                </div> : null }
                </div>
        </div>
    );
};

export default CodeBlock;
