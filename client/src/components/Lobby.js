import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Lobby = () => {
    const navigate = useNavigate();
    const [blocks, setBlocks] = useState([]);

    useEffect(() => {
        // Fetch the code blocks from the server
        axios.get('http://localhost:5000/codeblocks')
            .then(response => setBlocks(response.data))
            .catch(error => console.error('Error fetching code blocks:', error));
    }, []);

    return (
        <div>
            <h1>Choose Code Block</h1>
            <ul>
                {blocks.length > 0 ? (
                    blocks.map(block => (
                        <li key={block._id}>
                            <button onClick={() => navigate(`/codeblock/${block._id}`)}>
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