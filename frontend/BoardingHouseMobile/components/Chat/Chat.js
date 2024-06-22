import { ActivityIndicator, Text } from "react-native-paper";
import ChatList from "./ChatList";
import { View } from "react-native";
import { useContext, useEffect, useState } from "react";
import MyStyles from "../../styles/MyStyles";
import { MyUserContext } from "../../configs/Context";
import { userRef } from "../../configs/Firebase";
import { getDocs } from "firebase/firestore";


export default function Chat() {
    const [users, setUsers] = useState([1,2,3])
    const user = useContext(MyUserContext);

    useEffect(() => {
        if(user)
            getUsers();
    },[])

    const getUsers = async () => {
        const q = query(userRef, where('id', '!=', user))

        const querySnapshot = await getDocs(q);
        let data = []
        querySnapshot.forEach(doc=>{
            data.push({...doc.data()});
        })

        console.info('user', data)
        setUsers(data)
    }

    return (
        <View style={MyStyles.container}>
        {users.length > 0? (
            <ChatList users={users}/>
        ):(
            <ActivityIndicator/>
        )}
        </View>
    )

}