import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper"
import MyStyles from "../../styles/MyStyles";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import RNPickerSelect from 'react-native-picker-select';
import { Picker } from "@react-native-picker/picker";

const NewPost = () => {
    const fields = [{
        label: "Tên bài viết",
        Icon: "text",
        field: "title"
    }, {
        label: "Mô tả",
        icon: "text",
        field: "description"
    },
    // {
    //     label: "Huyện",
    //     icon: "text",
    //     field: "district"
    // }
];

    const [post, setPost] = useState({});
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(false);
    const nav = useNavigation();
    const [district, setDistrict] = useState([])
    const [value, setValue] = useState('')
  

    const loadDistrict = async () => {
        try {
            let res = await APIs.get(endpoints['districts']);
            setDistrict(res.data); 
            console.info(district);
        } catch (ex) {
            console.error(ex);
        }
    }
    const change = (field, value) => {
        setPost(current => {
            return {...current, [field]: value}
        })
    }
    const send = async () => {
   
            setErr(false);
            setLoading(true);
            try {
                const token = await AsyncStorage.getItem('token');
             
                let res = await authApi(token).post(endpoints['posts'], {
                    ...post,
                    'district': value
                });
                
                if (res.status === 201)
                    nav.navigate('Post');
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        
    }

    useEffect(() => {
        loadDistrict();
    }, [])

    return (
        <View style={MyStyles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView>
            {fields.map(f => <TextInput value={post[f.field]} onChangeText={t => change(f.field, t)} key={f.field} style={MyStyles.margin} label={f.label} secureTextEntry={f.secureTextEntry} right={<TextInput.Icon icon={f.icon} />} />)}

            {/* <RNPickerSelect
                onValueChange={(value) => console.log(value)}
                key={district.id}
                items={district}
                /> */}

            <Picker
                selectedValue={district}
                onValueChange={(itemValue) => setValue(itemValue)}
                >
            <Picker.Item label="Chọn Quận/Huyện" value={value} />
                {Array.isArray(district) && district.map((item) => (
                    <Picker.Item key={item.id} label={item.name} value={item.id} />
                ))}
            </Picker>    
            {value !== "" && (
             <Text>Bạn đã chọn: {district.find((item) => item.id === value).name}</Text>
             )}
            
            <Button loading={loading} onPress={send} style={MyStyles.margin} mode="contained" icon="account">Gửi</Button>
            </ScrollView>
        </KeyboardAvoidingView>
    </View>
    )
}

export default NewPost 