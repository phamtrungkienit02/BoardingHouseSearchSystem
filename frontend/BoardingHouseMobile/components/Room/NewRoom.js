import { useEffect, useState } from "react";
import { Dimensions, Image, KeyboardAvoidingView, KeyboardAvoidingViewBase, Platform, ScrollView, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Button, Text, TextInput, TouchableRipple } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIs, { authApi, endpoints } from "../../configs/APIs";
import * as ImagePicker from 'expo-image-picker';

// 'title'
//                                 description=request.data.get('description'),
//                                 name=request.data.get('name'),
//                                 price=request.data.get('price'),
//                                 num_of_people=request.data.get('num_of_people'),
//                                 area=request.data.get('area'),
//                                 address=request.data.get('address'),
//                                 longitude=request.data.get('longitude'),
//                                 latitude=request.data.get('latitude'),
//                                 category_id=request.data.get('category'),
//                                 district_id=request.data.get('district'),

const NewRoom = () => {
    const fields = [{
        label: "Tiêu đề",
        Icon: "text",
        field: "title"
    }, {
        label: "Mô tả",
        icon: "text",
        field: "description"
    }, {
        label: "Tên phòng/nhà",
        icon: "text",
        field: "name"
    }, {
        label: "giá",
        icon: "text",
        field: "price"
    }, {
        label: "Số lượng người ở",
        icon: "text",
        field: "num_of_people"
    }, {
        label: "Diện tích",
        icon: "text",
        field: "area",
    }, {
        label: "Địa chỉ",
        icon: "text",
        field: "address",
    }];

    const [room, setRoom] = useState({});
    const [loading, setLoading] = useState(false);
    const [district, setDistrict] = useState([])
    const [category, setCategory] = useState([])
    const [dis, setDis] = useState('')
    const [cate, setCate] = useState('')
    const [errors, setErrors] = useState({});
  

    const loadDistrict = async () => {
        try {
            let res = await APIs.get(endpoints['districts']);
            setDistrict(res.data); 
            console.info(district);
        } catch (ex) {
            console.error(ex);
        }
    }
    const loadCategory = async () => {
      try {
          let res = await APIs.get(endpoints['categories']);
          setCategory(res.data); 
          console.info(category);
      } catch (ex) {
          console.error(ex);
      }
    }

    const [selectedLocation, setSelectedLocation] = useState({
        latitude: 10.80188136335285,
        longitude: 106.66373554159944,
      });
    

  const validate = () => {
        const newErrors = {};
      
        if (!room.title) {
          newErrors.title = 'Tiêu đề không được để trống';
        }
        if (!room.description) {
          newErrors.description = 'Mô tả không được để trống';
        }
        if (!room.name) {
          newErrors.name = 'Tên phòng/nhà không được để trống';
        }
        if (!room.price || room.price <= 0) {
          newErrors.price = 'Giá phải lớn hơn 0';
        }
        if (!room.num_of_people || room.num_of_people <= 0) {
          newErrors.num_of_people = 'Số lượng người ở phải lớn hơn 0';
        }
        if (!room.area || room.area <= 0) {
          newErrors.area = 'Diện tích phải lớn hơn 0';
        }
        if (!room.address) {
          newErrors.address = 'Địa chỉ không được để trống';
        }
        if (!dis) {
          newErrors.district = 'Vui lòng chọn quận/huyện';
        }
        if (!cate) {
          newErrors.category = 'Vui lòng chọn danh mục';
        }
        if (!room.images || room.images.length < 3) {
          newErrors.images = 'Vui lòng chọn ít nhất 3 hình ảnh';
        }
      
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
      };
    const handleMapPress = (event) => {
        setSelectedLocation({
          latitude: event.nativeEvent.coordinate.latitude,
          longitude: event.nativeEvent.coordinate.longitude,
          
        });
        console.info(selectedLocation.latitude, selectedLocation.longitude)
      };

      const picker = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("App", "Permissions Denied!");
        } else {
          let res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: 3, // Giới hạn chọn tối thiểu 3 hình ảnh
          });
      
          if (!res.canceled) {
            // Lưu trữ các hình ảnh đã chọn
            change('images', res.assets);
          }
        }
      };
      console.info(room)
      
    const change = (field, value) => {
      setRoom(current => {
          return {...current, [field]: value}
      })
    }
    
    const send = async () => {
   
      // setErr(false);
      setLoading(true);
      if (validate()) {
          
          try {
            let form = new FormData();

            for (let f in room)
                    if (f === 'images')
                      if (Array.isArray(room.images) && room.images.length >= 3) {
                        room.images.forEach((image, index) => {
                          form.append(`images[${index}]`, {
                            uri: image.uri,
                            name: image.fileName,
                            type: image.type
                          });
                        });
                      } else {
                        // Xử lý trường hợp không có đủ 3 hình ảnh
                        console.log('Vui lòng chọn ít nhất 3 hình ảnh');
                      }
                    else
                        form.append(f, room[f]);

              const token = await AsyncStorage.getItem('token');
              let res = await authApi(token).post(endpoints['rooms'], form, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
              
              if (res.status === 201)
                  nav.navigate('Post');
          } catch (ex) {
              console.error(ex);
          } finally {
              setLoading(false);
          }
    }
  
    }
    useEffect(() => {
      loadDistrict();
      loadCategory();
  }, [])

    
      return (
        <View style={{ flex: 1 }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView>
            <MapView style={{width: Dimensions.get('window').width, height:400}}
            
            initialRegion={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            onPress={handleMapPress}
          >
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
            />
          </MapView>

            {fields.map(f => <TextInput value={room[f.field]} onChangeText={t => change(f.field, t)} key={f.field} style={MyStyles.margin} label={f.label} secureTextEntry={f.secureTextEntry} right={<TextInput.Icon icon={f.icon} />} />)}


            <Picker
                selectedValue={district}
                onValueChange={(itemValue) => setDis(itemValue)}
                >
            <Picker.Item label="Chọn Quận/Huyện" value={dis} />
                {Array.isArray(district) && district.map((item) => (
                    <Picker.Item key={item.id} label={item.name} value={item.id} />
                ))}
            </Picker>    
            {dis !== "" && (
             <Text>Bạn đã chọn: {district.find((item) => item.id === dis).name}</Text>
             )}

            <Picker
                selectedValue={category}
                onValueChange={(itemValue) => setCate(itemValue)}
                >
            <Picker.Item label="Chọn danh mục" value={cate} />
                {Array.isArray(category) && category.map((item) => (
                    <Picker.Item key={item.id} label={item.name} value={item.id} />
                ))}
            </Picker>  
            {cate !== "" && (
             <Text>Bạn đã chọn: {category.find((item) => item.id === cate).name}</Text>
             )} 


                <TouchableRipple onPress={picker}>
                    <Text style={MyStyles.margin}>Chọn ảnh</Text>
                </TouchableRipple>

                {room.images && room.images.map(i =>
                       <Image key={i.id} style={[MyStyles.avatar, MyStyles.margin]} source={{uri: i.uri}} />
                )}


            
            <Button loading={loading} onPress={send} style={[MyStyles.margin, MyStyles.mt15]} mode="contained" icon="account">Gửi</Button>
            </ScrollView>
        </KeyboardAvoidingView>
        </View>
      );
    };
    
export default NewRoom