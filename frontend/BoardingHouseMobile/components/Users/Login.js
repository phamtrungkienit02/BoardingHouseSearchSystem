
import { KeyboardAvoidingView, Platform, ScrollView, View} from "react-native";
import MyStyles from "../../styles/MyStyles";
import { Button, Text, TextInput } from "react-native-paper";
import { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MyDispatchContext } from "../../configs/Context";

const Login = () => {
    const fields = [ {
        label: "Tên đăng nhập",
        icon: "text",
        field: "username"
    }, {
        label: "Mật khẩu",
        icon: "eye",
        field: "password",
        secureTextEntry: true
    }];
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();

    const change = (field, value) => {
        setUser(current => {
            return {...current, [field]: value}
        })
    }

    const login = async () => {
        setLoading(true);
        try {
            let res = await APIs.post(endpoints['login'], {
                ...user,
                // 'username': 'admin',
                // 'password': '123456',
                'client_id': 'y7WgKFC4MEkHiFsbFIcx3rTJ6FYLSB0RWTlZxNtN',
                'client_secret': 'EroQuTTUhn5vlCKxvS07k0FLMsdbOPXMD07qKPuD3HDBjKG5VuRdyyQykRM0BqvbDnaihxR5g3PeIlv4btvEdOG0xgXEzSNKbWqbC6HRLsWhkbDsgNwbnF9MZaUjVJNJ',

                // 'client_id': 'bamDZuS92vHQmEEoi8bzlqv90JZ1pVCsG2ZmSRvM',
                // 'client_secret': '7FB9XhqEJYqWzNYpyVJYqxeOkjaNRQWqmhtGp4cYtslD9m5TkKjd4ELaOqhXlqtjeMZluLDMuX1wBTQquhJTGsRW2pJQ3nbvkF0AmGWkwdepu7p9Gf5x6QyTsRErqzL6',


                // 'client_id': 'Vbe8euZZQJoWJ2UzW9wDThg4hJEZHHbhFmnfj7UR',
                // 'client_secret': 'cVm4w4hSdy4MtwbP4KuNgXkGPeQJ9yrQdBvXHGR6b3e97F2bYqQ81XJ49FEufzjcw4SKwpuOZQiCLsNelHY1MkuYTGBRcSqtWmSlebSUk27WfyDskCB2VeCQihnEKdZ2',
                'grant_type': 'password'
            });
            console.info(res.data);

            // if (res.status === 400)
            //     console.info(res.status)
            AsyncStorage.setItem('token', res.data.access_token);

            setTimeout(async () => {
                console.info('====info data=====')
                let user = await authApi(res.data.access_token).get(endpoints['current-user']);
                console.info(user.data);
                dispatch({
                    "type": "login",
                    "payload": user.data
                });
                nav.navigate("Home");
            }, 1000);
           
        //    setTimeout(async () => {
        //         let user = await authApi(res.data.access_token).get(endpoints['current-user']);
        //         console.info(user.data);

        //         dispatch({
        //             "type": "login",
        //             "payload": user.data
        //         });

        //         nav.navigate("Home");
        //    }, 100);
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    const register =() => {
        nav.navigate('Register');
    }

    return (
        <View style={MyStyles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView>
            <Text style={MyStyles.subject}>ĐĂNG NHẬP NGƯỜI DÙNG</Text>

            {fields.map(f => <TextInput value={user[f.field]} onChangeText={t => change(f.field, t)} key={f.field} style={MyStyles.margin} label={f.label} secureTextEntry={f.secureTextEntry} right={<TextInput.Icon icon={f.icon} />} />)}

            
            <Button loading={loading} onPress={login} style={MyStyles.margin} mode="contained" icon="account">ĐĂNG NHẬP</Button>
            <Button  onPress={register} style={MyStyles.margin} mode="contained" icon="account">ĐĂNG KÝ</Button>

            </ScrollView>
        </KeyboardAvoidingView>
    </View>
    );
}

export default Login;