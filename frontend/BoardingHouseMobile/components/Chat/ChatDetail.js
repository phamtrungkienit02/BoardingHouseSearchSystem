import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { useCallback, useContext, useEffect, useLayoutEffect, useState } from "react";
import { View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { GiftedAvatar, GiftedChat } from "react-native-gifted-chat";
import { Text } from "react-native-paper";
import { MyUserContext } from "../../configs/Context";
import { app, database } from "../../configs/Firebase";
import MyStyles from "../../styles/MyStyles";

import { firebase } from '../../configs/Firebase';




// const ChatDetail = () => {
//     const [messages, setMessages] = useState([]);
//     const navigation = useNavigation();
//     const user = useContext(MyUserContext);


//     // useLayoutEffect(() => {
//     //     navigation.setOptions({
//     //       headerRight: () => (
//     //         <TouchableOpacity
//     //           style={{
//     //             marginRight: 10
//     //           }}
//     //           onPress={onSignOut}
//     //         >
//     //           <AntDesign name="logout" size={24} color={colors.gray} style={{marginRight: 10}}/>
//     //         </TouchableOpacity>
//     //       )
//     //     });
//     //   }, [navigation]);

//     useLayoutEffect(() => {

//         const collectionRef = collection(database, 'chats');
//         const q = query(collectionRef, orderBy('createdAt', 'desc'));

//         const unsubscribe = getDocs(q, querySnapshot => {
//         console.log('querySnapshot unsusbscribe');
//           setMessages(
//             querySnapshot.docs.map(doc => ({
//               _id: doc.data()._id,
//               createdAt: doc.data().createdAt.toDate(),
//               text: doc.data().text,
//               user: user
//             }))
//           );
//         });
//     return unsubscribe;
//       }, []);


//       const onSend = useCallback((messages = []) => {
//         setMessages(previousMessages =>
//           GiftedChat.append(previousMessages, messages)
//         );
//         // setMessages([...messages, ...messages]);
//         const { _id, createdAt, text, user } = messages[0];    
//         addDoc(collection(database, 'chats'), {
//           _id,
//           createdAt,
//           text,
//           user
//         });
//         //   addDoc(collectionRef, {
//         // _id,
//         // createdAt,
//         // text,
//         // user
//         // });
//       }, []);

//     return(
//         <View style={MyStyles.container}>
//             <GiftedChat    
//         //     messages={messages}
//         //   showAvatarForEveryMessage={false}
//         //   showUserAvatar={false}
//         //   onSend={messages => onSend(messages)}
//         //   messagesContainerStyle={{
//         //     backgroundColor: '#fff'
//         //   }}
//           textInputStyle={{
//             backgroundColor: '#fff',
//             borderRadius: 20,
//           }}/>
//         </View>
//     );

// }

const ChatDetail = () => {
    
    const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsubscribe = database.ref('messages').on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMessages(
          Object.keys(data).map((key) => ({
            _id: key,
            text: data[key].text,
            createdAt: new Date(data[key].createdAt),
            user: {
              _id: data[key].user._id,
              name: data[key].user.name,
              avatar: data[key].user.avatar,
            },
          }))
        );
      }
    });

    return unsubscribe;
  }, []);

  const onSend = (newMessages = []) => {
    const message = newMessages[0];
    firebase.database().ref('messages').push({
      _id: message._id,
      text: message.text,
      createdAt: message.createdAt.getTime(),
      user: message.user,
    });
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(newMessages) => onSend(newMessages)}
      user={{
        _id: 1,
        name: 'User Name',
        avatar: 'https://example.com/avatar.png',
      }}
    />
  );
};


export default ChatDetail;