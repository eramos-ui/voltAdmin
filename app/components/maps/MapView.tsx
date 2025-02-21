import { useContext, useLayoutEffect, useRef } from "react";
import { PlacesContext, MapContext } from "../../context";

import { LoadingIndicator } from "../LoadingIndicator";
import { Map } from 'mapbox-gl';


export const MapView = () =>{
    const { isLoading , userLocation } = useContext(PlacesContext);
    const { setMap } = useContext(MapContext);
    const mapDiv =useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
       if ( !isLoading ){
        const map= new Map({
            container: mapDiv.current! , //container ID
            style:'mapbox://styles/mapbox/streets-v10',//style url
            center: userLocation, //starting position [lng,lat]
            zoom: 10,//starting zooom
        });
        
        setMap( map );
       }
    },[ isLoading ])

    if ( isLoading ) {
        return (<LoadingIndicator  message='cargando' />)
    }
    return (
        <div  ref={mapDiv} className="pt-20"
        style={{
            height:'100vh',
            left: 0,
            position:'fixed',
            top: 0,
            width:'100vw',
        }}>{/* {userLocation?.join (',') } */}
        </div>
    )
}
    