import { useContext } from "react";
import { FlatList, View } from "react-native";
import { Text } from "react-native-paper";
import { MyUserContext } from "../../configs/Context";
import ChatItem from "./ChatItem";


function ChatList ({users}){
    const user = useContext(MyUserContext);
    console.info(users)

    return(

        <View>
            {users.map(u =>
            //  <FlatList 
            //     data={users}
            //     contentContainerStyle={{flex:1, paddingVertical:25}}
                // keyExtractor={item => Math.random()}
                // showsVerticalScrollIndicator={false}
                // renderItem={({item, index}) => 
                    <ChatItem key={Math.random()} 
                // item={item} index={index}
                 />
            // }
            // />)
            )}
           
            
       
        </View>
    )
}


export default ChatList;