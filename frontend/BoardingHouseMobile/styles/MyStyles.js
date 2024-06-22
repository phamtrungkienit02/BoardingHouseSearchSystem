import { StyleSheet } from "react-native";


export default StyleSheet.create({
    container: {
        flex:1,
        marginTop: 30,
        // justifyContent: "center",
        // alignItems: "center"

    }, subject: {
        fontSize: 30,
        fontWeight: 'bold',
        color: 'blue'
    }, row: {
        flexDirection:"row",
    }, wrap: {
        flexWrap: "wrap"
    }, margin: {
        margin: 5
     }, mt15: {
        marginTop: 25
     }, m10: {
        margin: 10,
    }, image: {
        width: 130,
        height: 130,
        borderRadius: 20
    }, avatar: {
        width: 40,
        height: 40,
        borderRadius: 20
    }
});