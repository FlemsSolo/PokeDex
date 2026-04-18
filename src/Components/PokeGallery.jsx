import { useEffect, useState, createContext, useContext, Suspense, useRef } from 'react'
import { createPortal } from 'react-dom';

import { GlobalContext } from "/src/Components/GlobalContext.jsx"

// ------------------------------------------------------------------------------------------

  // Ensure a modal root exists (create if not present)
  function ensureModalRoot() 
    {
    let modalRoot = document.getElementById('modal-root');
    if (!modalRoot) 
      {
      modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
      }

    return modalRoot;
    }

// ------------------------------------------------------------------------------------------

  function Modal({ children, onClose, ariaLabel }) 
    {
    const elRef = useRef(null);
    if (!elRef.current) elRef.current = document.createElement('div');
    console.log(elRef.current);

    // ------------------------------------------------------------------

    useEffect(() => 
      {
      // Make Sure We Have A Place For The Modal
      const modalRoot = ensureModalRoot();

      // make modalRoot visible for portals
      modalRoot.classList.remove('sr-only');
      modalRoot.setAttribute('aria-hidden', 'false');
      modalRoot.appendChild(elRef.current);

      return () => 
        {
        modalRoot.removeChild(elRef.current);

        // if modalRoot is empty, hide it again
        if (modalRoot.children.length === 0) 
          {
          modalRoot.classList.add('sr-only');
          modalRoot.setAttribute('aria-hidden', 'true');
          }
        };
      }, []); // Runs Only On First Render

    // ------------------------------------------------------------------

    // Close on Escape
    // The useEffect Hook allows you to 
    // perform side effects in your components.
    useEffect(() => 
      {
      function onKey(e) 
        {
        if (e.key === 'Escape') onClose();
        }

      document.addEventListener('keydown', onKey);

      return () => document.removeEventListener('keydown', onKey);
      }, [onClose]); // Runs When onClose Changes

    // ------------------------------------------------------------------

    /*
    CreatePortal is a React API that allows you to render a component's 
    children into a different part of the DOM, outside of the parent 
    component's hierarchy. This is useful for creating UI elements like 
    modals and tooltips that need to visually break out of their parent 
    container.
    */
    return createPortal(
      <div className="modal-backdrop" role="presentation" onClick={onClose}>
        <div
          className="modal" role="dialog" aria-modal="true"
          aria-label={ariaLabel || 'Modal dialog'}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>,
      elRef.current
      );
    }

// ------------------------------------------------------------------------------------------

export   
function PokeCard({src, i, setClickedPoke, setOpen}) 
  {
  // useRef dont cause a re-render when it changes
  const openButtonRef = useRef(null);

    return (
        <div key={i} 
        className='CardClass' 
        ref={openButtonRef} // Can We Do This On An Array Of Images ?
        onClick={()=>{setClickedPoke(i); setOpen(true);}} 
        style={{backgroundColor: getTypeColor(src.types[0].type.name)}} >
          <div style={{textAlign:"right"}}>#<span>{src.id}</span></div>
          
          <img
            key={i}
            src={src.img}
            alt={'Fetched '+i}
            style={{ width: "96px", height: "96px", borderRadius: 8 }}
          />

          <div><span className='pokeName'>{src.name}</span></div>
        </div>

    ) ;
  }

// ------------------------------------------------------------------------------------------

export   
function PokeGallery(props) 
  {
  const {CurPoke, setCurPoke, MaxPokes, setMaxPokes, abortController} = 
    useContext(GlobalContext);
  const [open, setOpen] = useState(false);
  const [clickedPoke, setClickedPoke] = useState();

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const LeImg = images[clickedPoke] ;

  // ------------------------------------------------------------------

    useEffect(() => // Manage side effects
    {
    let isSubscribed = true; // Might Be Called Twice !!?

    const awaitPokies = async () =>
      {
      if (isSubscribed)
        {
        const pokeList = await FetchAllPokes(CurPoke, setMaxPokes, abortController) ;

        if (pokeList === null) return () => { isSubscribed = false; }; // cancel any future Fetch

        setImages(pokeList);
        setLoading(false);
        }
      }

    awaitPokies().catch(console.error) ;

    return () => { isSubscribed = false; }; // cancel any future Fetch
    }, [CurPoke]); // ReRender Every Time CurPoke Changes

  // ------------------------------------------------------------------

  if (loading) return <h2>Please Wait …</h2>;

  {/* Items In map() Always Need A Key */}
  return (
    <>
      { 
      images.map((src, i) => 
        (
        <PokeCard src={src} i={i} setClickedPoke={setClickedPoke} setOpen = {setOpen} />            
        ))
      }
        
      { 
      open && (
        <Modal 
          onClose={() => setOpen(false)} ariaLabel="Example modal">
            
          {/* Children Of Modal */}
          <div style={{backgroundColor: getTypeColor(LeImg.types[0].type.name), padding: '12px' }}>
            <h1 style={{ fontSize: '56px', lineHeight: '58px', textAlign: 'left', marginTop: '0' }}> {LeImg.name}</h1>
            <img src={LeImg.img} style={{ width: '90%' }} />  
            <div style={{ fontSize: '18px', textAlign: 'left', backgroundColor: 'rgba(0, 0, 0, 0.08)', margin: 'auto', padding: '4px', lineHeight:'24px', width: '80%' }}>
              <div><b>Height:</b> {LeImg.height}, <b>weight:</b> {LeImg.weight}</div>
              <div><b>Type:</b> {LeImg.TypeStr}</div>
              <div><b>Abilities:</b> {LeImg.AbilStr}</div>
            </div>
            <div style={{ marginTop: '12px', textAlign: 'center' }}>
              <button onClick={() => setOpen(false)} style={{ marginTop: '12px', background: 'none' }}>Close</button>
            </div>
          </div>
        </Modal>
      )}

    </>
    );
  }

// ------------------------------------------------------------------------------------------
// External Scripts
// ------------------------------------------------------------------------------------------
  async function 
  fetchPokemonList(CurPoke, abortController) 
    {
    try 
      {
      const Url = 'https://pokeapi.co/api/v2/pokemon/?offset='+CurPoke+'&limit=50' ;
      const response = await fetch(Url, {method: 'get', signal: (abortController.current).signal});

      if (!response.ok) 
        {
        console.log("HTTP Error:", response.status);
        return null;
        }

      const  data = await response.json();
      return data;        
      } 
    catch (err) 
      {
      console.error("Failed to fetch images", err);
      }
    }

// ------------------------------------------------------------------------------------------

async function 
FetchAllPokes(CurPoke, setMaxPokes, abortController) 
  {
  const getPokemon = await fetchPokemonList(CurPoke, abortController); 

  if (getPokemon === null) // If This Goes Wrong We Can't Fetch Any Pokie !!?
    {
    console.error("Can't Fetch Pokies ??!") ;
    return null ;
    }

  setMaxPokes(getPokemon.count) ;

  let CallArr = [] ;
  for( let poke of getPokemon.results) 
    {
    const Url = poke.url ;
    let MaPromise = fetch(Url, {method: 'get', signal: (abortController.current).signal}) // Fetch Returns A Promise
    CallArr.push(MaPromise) 
    }

  const TheLot = await Promise.all(CallArr); // Wait for all promises to resolve asyncroniously
  //console.log("TheLot", TheLot) ;

  const pokemonList = []
  for( let poke of TheLot) 
    {
    let pokeDetails = await poke.json(); //console.log("pokeDetails", pokeDetails)

    if (pokeDetails.abilities.length === 0)
      pokeDetails.abilities = [{ability: { name:'NoAbil', url:'' }}]

    // Extract Only The Data We Need By Destructuring PokeDetails
    let 
    { 
      id,
      name: name,
      abilities: abilities,
      sprites: 
        { 
        other: {
          "official-artwork": { front_default: img }
        }
      },
      types, width, height, weight
    } = pokeDetails;

    name = name.charAt(0).toUpperCase()+name.slice(1)

// ------------------------------------------------------------------------------------------

    let effect;
    /*if (abUrl !== '')
      {
      let pokeAbility = await fetchPokeAbility(abortController, abUrl);//console.log("pokeAbility", pokeAbility, "id", id) ;
      let { effect_entries: effects } = pokeAbility; // Effect Is An Ability
      
      effects.forEach( ef => 
        {
        ef.language.name === 'en' && (effect = ef.short_effect);
        });
      }
    else
      effect = "None" ;*/

    img = (img === null ? './images/PokemonLogo.jpg' : img) ;

    // Make Abilities String
    let AbilStr = "" ;
    for (let Abil in abilities)
      {
      AbilStr += abilities[Abil].ability.name
      if (Abil < abilities.length - 1)
        AbilStr += ", "
      }

    // Make Types String
    let TypeStr = "" ;
    for (let Type in types)
      {
      TypeStr += types[Type].type.name
      if (Type < types.length - 1)
        TypeStr += ", "
      }

    pokemonList.push({ id, name, abilities, AbilStr, effect, img, types, TypeStr, width, height, weight });
    }

  console.log("Pokies Fetched !!?", pokemonList)
  return await Promise.all(pokemonList)
  }

// ------------------------------------------------------------------------------------------

const fetchPokeAbility = async (abortController, abUrl) => 
  {
  const response = await fetch(abUrl, {method: 'get', signal: (abortController.current).signal});
  //console.log("response", response) ;
  const data = await response.json();//console.log("data", data) ;
  return data;
  }

// ------------------------------------------------------------------------------------------

function 
getTypeColor(type) 
  {  // Ref : https://github.com/justingolden21/pokemon-types-css
  const colors = 
    {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC",
    }

  return colors[type]
  }

// ------------------------------------------------------------------------------------------
