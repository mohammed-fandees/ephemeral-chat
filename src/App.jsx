
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Signup, Login, Chat } from "./pages";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path='/' element={<Chat />} />
      </Routes> 
    </Router>
  )
}

export default App;