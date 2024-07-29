import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Lobby from './components/Lobby';
import CodeBlock from './components/CodeBlock'

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<Lobby />} />
            <Route path="/codeblock/:id" element={<CodeBlock />} />

        </Routes>
    </Router>
);

export default App;