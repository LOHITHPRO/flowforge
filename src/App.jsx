// App.jsx

import './App.css';
import Header from './components/header/Header';
import Draw from './components/draw/Draw';
import VMenu from './components/vmenu/vmenu';
import Type from './components/type/Type';

function App() {
  return (
    <div className="w-100">
      <Header />
      <VMenu />
      <div className="main-content">
        <Draw />
      </div>
      <Type />
    </div>
  );
}

export default App;
