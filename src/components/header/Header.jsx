import React from 'react'
import './header.css'

const header = () => {
  return (
    <div>
      <nav class="navbar navbar-dark bg-dark fixed-top">
  <div class="container-fluid">
    <a class="navbar-brand fst-italic fw-bold font-monospace fs-3" href="#">FLOW <span class="text-danger">FORGE  </span></a>
    <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
      <div class="offcanvas-header">
        <h5 class="offcanvas-title fst-italic" id="offcanvasDarkNavbarLabel">FORGER</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
        <ul class="navbar-nav justify-center flex-grow-1 pe-3">
          <li class="nav-item text-center fs-3 ">
          <button type="button" class="btn btn-outline-info">NEW FLOW</button>
          </li>
          <li class="nav-item text-center fs-3">
          <button type="button" class="btn btn-outline-info">SAVE</button>
          </li>
          <li class="nav-item text-center fs-3">
          <button type="button" class="btn btn-outline-info">DOWNLOAD</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</nav>
    </div>
  )
}

export default header