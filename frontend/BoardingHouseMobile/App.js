import { StatusBar } from 'expo-status-bar';
import React, { useContext, useReducer } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Room from './components/Room/Room';
import Login from './components/Users/Login';
import Register from './components/Users/Register';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import RoomDetail from './components/Room/RoomDetail';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import { MyDispatchContext, MyUserContext } from "./configs/Context";
import MyUserReducer from "./configs/Reducers";
import Profile from './components/Users/Profile';
import Map from './components/Room/Map';
import NewRoom from './components/Room/NewRoom';
import ChatDetail from './components/Chat/ChatDetail';
import ChatList from './components/Chat/ChatList';
import Chat from './components/Chat/Chat';
import ChatRoom from './components/Chat/ChatRoom';
import PostDetail from './components/Post/PostDetail';
import Post from './components/Post/Post';
import NewPost from './components/Post/NewPost';
import Search from './components/Room/Search';



const Stack = createStackNavigator();

const MyStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name='Room' component={Room} />
      <Stack.Screen name='RoomDetail' component={RoomDetail} />
      <Stack.Screen name='ChatRoom' component={ChatRoom} />
      <Stack.Screen name='Post' component={Post} />
      <Stack.Screen name='PostDetail' component={PostDetail} />
      <Stack.Screen name='NewPost' component={NewPost} />
      <Stack.Screen name='NewRoom' component={NewRoom} />
      <Stack.Screen name='Register' component={Register} />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();
const MyTab = () => {
  const user = useContext(MyUserContext);

  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={MyStack} options={{title: "Home", tabBarIcon: () => <Icon source="home" size={30} color="blue" />}} />
      <Tab.Screen name="Search" component={Search} options={{title: "Search", tabBarIcon: () => <Icon source="find" size={30} color="blue" />}} />
      <Tab.Screen name="Post" component={Post} options={{title: "Post", tabBarIcon: () => <Icon source="post" size={30} color="blue" />}} />
      <Tab.Screen name="Chat" component={Chat} options={{title: "Chat", tabBarIcon: () => <Icon source="chat" size={30}  color="blue" />}} />


      {user===null?<>
        {/* <Tab.Screen name="Register" component={Register} options={{title: "Đăng ký", tabBarIcon: () => <Icon source="account" size={30} color="blue" />}} /> */}
        <Tab.Screen name="Login" component={Login} options={{title: "Đăng nhập", tabBarIcon: () => <Icon source="login" size={30}  color="blue" />}} />

      </>:<>
        <Tab.Screen name="Profile" component={Profile} options={{title: user.username, tabBarIcon: () => <Icon source="login" size={30}  color="blue" />}} />

      </>}
      
    </Tab.Navigator>
  );
}



export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  return (
    <NavigationContainer>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch}>
        <MyTab/>
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
      {/* <MyStack/> */}
    </NavigationContainer>
  );
}
