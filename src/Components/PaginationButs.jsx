import { useEffect, useState, createContext, useContext, Suspense } from 'react'
import { HashRouter, Routes, Route, Link, NavLink } from "react-router-dom";

import { GlobalContext } from "/src/Components/GlobalContext.jsx"

const CardsPerPage = 50 ;

export function PaginationButs()
  {
  return (
        <div id="NavButs">
          <PrevBut />
          <MidBut />
          <NextBut />
        </div>
    ) ;
  }

function NextBut()
  {
  const {CurPoke, setCurPoke, MaxPokes, abortController} = useContext(GlobalContext);

  const ShowNext = () => 
    {console.log(CurPoke + CardsPerPage, MaxPokes)
    if (CurPoke + CardsPerPage < MaxPokes)
      {
      (abortController.current).abort ;
      setCurPoke(CurPoke + CardsPerPage)
      }
    }

  return <Link className="NavBut" id="NextBut" onClick={ShowNext} to="/">Next {'>'}</Link>
  }

function PrevBut()
  {
  const {CurPoke, setCurPoke, abortController} = useContext(GlobalContext);

  const ShowPrev = () => 
    {
    if (CurPoke - CardsPerPage >= 0)
      {
      (abortController.current).abort ;
      setCurPoke(CurPoke - CardsPerPage)
      }
    }

  return <Link className="NavBut" id="PrevBut" onClick={ShowPrev} to="/">{'<'} Prev </Link>
  }

function MidBut()
  {
  const {CurPoke, setCurPoke, MaxPokes} = useContext(GlobalContext);

  return <span>{CurPoke+1} / {CurPoke + CardsPerPage} of {MaxPokes}</span>
  }
