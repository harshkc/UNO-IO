import "./App.css";
import {Route, Routes} from "react-router-dom";
import Homepage from "./components/Homepage";
import {SoundProvider} from "./context/SoundProvider";
import Room from "./components/Room";

const GameWithSoundProvider = () => {
  return (
    <SoundProvider>
      <Room />
    </SoundProvider>
  );
};

const App = () => {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/play' exact element={<Homepage />} />
        <Route path='/play/room=:roomid' element={<GameWithSoundProvider />} />
      </Routes>
    </div>
  );
};

export default App;
