import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Display from './routes/Display';
import Admin from './routes/Admin';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Display />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
