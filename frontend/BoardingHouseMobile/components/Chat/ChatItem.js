
import { List, Text } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { useContext } from "react";
import { MyUserContext } from "../../configs/Context";
import { Image, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";


export default function ChatItem({item, navigation}){
    const user = useContext(MyUserContext);

    const openChatRoom = () => {
        // navigation.navigate('ChatRoom', {'id': id});
        navigation.navigate('ChatRoom');
    }

    return (
       
        <View>
             <TouchableOpacity 
            //  onPress={() => openChatRoom(user.id)}
            //  onPress={op}
                
                >
              <List.Item  style={MyStyles.margin}  title={user.first_name +" "+ user.last_name} description='lastinf'
                        left={() => <Image style={MyStyles.avatar} source={{uri: user.avatar}}/>}  />
            </TouchableOpacity>
        </View>
    )
}