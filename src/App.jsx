import './App.css'
import Header from './components/header/header'

import Draw from './components/draw/draw'

function App() {
  return (
    <div>
      <div className='d-flex align-items-center'>
        <Header />
          <div>
            <Draw />
          </div>
      </div>
    </div>
  );
}

export default App;
