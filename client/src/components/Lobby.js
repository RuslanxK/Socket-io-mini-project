import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Lobby = () => {
    const navigate = useNavigate();
    const [blocks, setBlocks] = useState([]);
    const [isMentor, setIsMentor] = useState(null);

    useEffect(() => {
        // Fetch the code blocks from the server
        axios.get(`${process.env.SERVER_URL}/codeblocks`)
            .then(response => setBlocks(response.data))
            .catch(error => console.error('Error fetching code blocks:', error));
    }, []);

    const handleSelectBlock = (blockId) => {
        // Randomly assign roles (or implement your own logic)
        const role = Math.random() < 0.5 ? 'mentor' : 'student';
        setIsMentor(role === 'mentor');
        // Navigate to the code block page with the assigned role
        navigate(`/codeblock/${blockId}`, { state: { isMentor: role === 'mentor' } });
    };

    return (
        <div>
            <h1>Choose Code Block</h1>
            <ul>
                {blocks.length > 0 ? (
                    blocks.map(block => (
                        <li key={block._id}>
                            <button onClick={() => handleSelectBlock(block._id)}>
                                {block.title}
                            </button>
                        </li>
                    ))
                ) : (
                    <p>No code blocks available</p>
                )}
            </ul>
        </div>
    );
};

export default Lobby;
