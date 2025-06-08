import React from 'react'
import './header.css'

const Header = () => {
  return (
    <div>
      <nav className="navbar navbar-dark bg-dark fixed-top">
  <div className="container-fluid">
    <a className="navbar-brand fst-italic fw-bold font-monospace fs-3" href="#">FLOW <span className="text-danger">FORGE  </span></a>
    <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="offcanvas offcanvas-end text-bg-dark" tabIndex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
      <div className="offcanvas-header">
        <h5 className="offcanvas-title fst-italic" id="offcanvasDarkNavbarLabel">FORGER</h5>
        <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div className="offcanvas-body">
        <ul className="navbar-nav justify-center flex-grow-1 pe-3">
          <li className="nav-item text-center fs-3 ">
          <button type="button" className="btn btn-outline-info">NEW FLOW</button>
          </li>
          <li className="nav-item text-center fs-3">
          <button type="button" className="btn btn-outline-info">SAVE</button>
          </li>
          <li className="nav-item text-center fs-3">
          <button type="button" className="btn btn-outline-info">DOWNLOAD</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</nav>
    </div>
  )
}

export default Header