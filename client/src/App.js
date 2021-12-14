import "./App.css";
import {Route, Routes} from "react-router-dom";
import Homepage from "./components/Homepage";
import Room from "./components/Room";

const App = () => {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/play' element={<Homepage />} />
        <Route path='/play/:roomid' element={<Room />} />
      </Routes>
    </div>
  );
};

export default App;
