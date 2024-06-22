import MapViewDirections from 'react-native-maps-directions';
import React, { Component, useEffect, useRef, useState } from 'react';
import { Button, Dimensions, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import * as Location from 'expo-location'



// const { width, height } = Dimensions.get('window');
// const ASPECT_RATIO = width / height;
// const LATITUDE = 37.771707;
// const LONGITUDE = -122.4053769;
// const LATITUDE_DELTA = 0.0922;
// const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
// const GOOGLE_MAPS_APIKEY = 'AIzaSyAtHdjgyYkz6O23JWotCqN5ZxZcoq_xTmE';



const Map = (la, long) => {
    const initialLocation = 
        {
            // latitude: 37.798790,
            // longitude: -122.442753

            // if (la = null){
                latitude: 10.80188136335285,
                longitude: 106.66373554159944
            // } 
            // else {
            //     latitude: la,
            //     longitude:  long
            // }
           
        }
    const [myLocation, setMyLocation] = useState(initialLocation)
    const [pin, setPin] = useState({})
    const [region, setRegion] = useState({
        latitude: initialLocation.latitude,
        longitude: initialLocation.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const mapRef = useRef(null)
    const local = {
        latitude: '10.80188136335285',
        longitude:  '106.66373554159944'
    }
    useEffect(() => {
        setPin(initialLocation)
        getLocation()
    }, [])

    const getLocation = async() => {
        try{
            let { status } = await Location.requestForegroundPermissionsAsync()

            if(status !== 'granted'){ 
              console.warn('Permission to access location was denied')
              return
            }
            let location = await Location.getCurrentPositionAsync({})
            setMyLocation(location.coords)
            console.log(location);

        }catch(err){
            console.warn(err);
        }
    }

    const focusOnLocation =() => {
        if (myLocation.latitude && myLocation.longitude){
          const newRegion = {
            latitude: parseFloat(myLocation.latitude),
            longitude: parseFloat(myLocation.longitude),
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421
          }
          if(mapRef.current){
            mapRef.current.animateToRegion(newRegion, 500)
          }
        }
      }

    
    return (
        <View >
    
            <MapView style={styles.map} 
            
            // initialRegion={{  
            //     latitude: myLocation.latitude,
            //     longitude: myLocation.longitude,
            //     latitudeDelta: 0.0922,
            //     longitudeDelta: 0.0421,}}
                region={region}
                onRegionChangeComplete={setRegion}
                ref={mapRef}
                provider='google'>
            {/* <MapViewDirections
            origin={con[0]}
            destination={con[1]}
        
                apikey={GOOGLE_MAPS_APIKEY}
            /> */}

            { pin.latitude && pin.longitude &&
            <Marker
                coordinate={{
                latitude: parseFloat(pin.latitude),
                longitude: parseFloat(pin.longitude)
                }}
                title='Default location'
                description='I am here'
            />
            }
            
            </MapView>
            <View style={styles.buttonContainer}>
                <Button title='Get Location' onPress={focusOnLocation} />
            </View>
        </View>

        
    );
}

const styles = StyleSheet.create({
    // container:{
    //     flex: 1,
    //     backgroundColor: '#fff',
    //     alignItems: 'center',
    //     justifyContent: 'center'
    // },
    map:{
        width: Dimensions.get('window').width,
        height: 700
    },
    buttonContainer: {
      position: 'absolute',
      bottom: 20,
      width: '100%',
      alignItems: 'center',
    },
    markerImage: {
      width: 40,
      height: 40, 
      borderRadius: 20,
    }
})

export default Map;
