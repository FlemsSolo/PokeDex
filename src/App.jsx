import { useEffect, useState, createContext, useContext, Suspense, useRef } from 'react'
import { HashRouter, Routes, Route, Link, NavLink } from "react-router-dom";
import './App.css'

import { About } from "./Components/About.jsx"
import { GlobalContext } from "./Components/GlobalContext.jsx"
import { PokeGallery } from "./Components/PokeGallery.jsx"
import { PaginationButs } from "./Components/PaginationButs.jsx"

// ------------------------------------------------------------------------------------------

export function GlobalProvider({ children }) 
  {
  const [CurPoke, setCurPoke] = useState(0);
  const [MaxPokes, setMaxPokes] = useState(50);
  const abortController = useRef(new AbortController());

  const value = { CurPoke, setCurPoke, MaxPokes, setMaxPokes, abortController };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
    );
  }

// ------------------------------------------------------------------------------------------

function App() 
  {
  const openButtonRef = useRef(null);

  // Return focus to the opener when modal closes
  useEffect(() => 
    {
    if (!open && openButtonRef.current) 
      {
      openButtonRef.current.focus();
      }
  }, [open]); // Runs When open Changes

  return (
    <GlobalProvider> {/* Avoid Props Drilling */}
    <HashRouter>
        <div id="Menu">
          <Link className="NavBut" to="/gallery">PokeDex</Link>
          <Link className="NavBut" to="/about">About</Link>
        </div>

        <PokeSquare />
 
        <PaginationButs />
    </HashRouter>
    </GlobalProvider>
  );
  }

// ------------------------------------------------------------------------------------------

function PokeSquare()
  {
  return (
    <div id="PokeSquare">
      <Routes>
        <Route path="/" element={<PokeGallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/gallery" element={<PokeGallery />} />
      </Routes>
    </div>
    );
  }

// ------------------------------------------------------------------------------------------

export default App;