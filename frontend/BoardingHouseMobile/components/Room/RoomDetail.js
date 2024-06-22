import { useContext, useEffect, useState } from "react"
import MyStyles from "../../styles/MyStyles"
import {View, Text, ScrollView, Image, Dimensions, RefreshControl} from "react-native"
import APIs, { authApi, endpoints } from "../../configs/APIs";
import { ActivityIndicator, Button, Card, Chip, List, TextInput } from "react-native-paper";
import { isCloseToBottom } from "../../configs/Utils";
import moment from "moment/moment";
import "moment/locale/vi";
import Map from "./Map";
import MapView, { Marker } from "react-native-maps";
import { MyUserContext } from "../../configs/Context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";


const RoomDetail = ({route}) => {
    // const fields = [ {
    //     label: "comment",
    //     icon: "text",
    //     field: "content"
    // }]
    // const [newComment, setNewComment] = useState({});
    const [room, setRoom] = useState(null);
    const [comments, setComments] = useState(null);
    const [content, setContent] = useState("");
    const roomId = route.params?.roomId;
    const [loading, setLoading] = useState(false);
    const nav = useNavigation();
    const [page, setPage] = useState(1);

    const user = useContext(MyUserContext);

    const loadRoom = async () => {
        try {
            let res = await APIs.get(endpoints['room-details'](roomId));
            setRoom(res.data);
            // console.info(room);
        } catch (ex) {
            console.error(ex);
        }
    }

    const loadComments = async () => {
        if (page > 0) {
            setLoading(true);
            try {
                let url = `${endpoints['room_comments'](roomId)}?page=${page}`;
                
                let res = await APIs.get(url);
                // let res = await APIs.get(endpoints['room_comments'](roomId)?page=${page});

                if (page === 1)
                    setComments(res.data.results);
                else  
                    setComments(current => {
                        return [...current, ...res.data.results];
                    });

            
                if (res.data.next === null)
                    setPage(0);
                // if (res.data.next === null) {
                //     setPage(0); // No more data to load
                //   } else {
                //     setPage(page + 1); // Increment page for next load
                //   }
            } catch (ex) {
                console.error(ex);
            }  finally {
                setLoading(false);
            }
        }
    }
    // const change = (field, value) => {
    //     setNewComment(current => {
    //         return {...current, [field]: value}
    //     })
    // }

    const loadMore = ({nativeEvent}) => {
        if (!loading && page > 0 && isCloseToBottom(nativeEvent)) {
            // console.info(Math.random());
            setPage(page+1);
        }
    }

    const sendComment = async () => {
   
        // setErr(false);
        try {
            // let form = new FormData();
            const token = await AsyncStorage.getItem('token');
            
            let res = await authApi(token).post(endpoints['add_comments_room'](roomId),{
                // ...content
                'content': content

            });
            
            // if (res.status === 201){
            //     nav.navigate('Room');
            // }
                

        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    
    }

    useEffect(() => {
        loadRoom();
    }, [roomId])

    useEffect(() => {
        loadComments();
    }, [content, page])

    

    return (
        <View style={MyStyles.container}>
            <ScrollView onScroll={loadMore}>
                {room===null?<ActivityIndicator />:<>
                    <Image source={{uri: room.user.avatar}} style={MyStyles.avatar} />
                    <Card>
                        {/* <Card.Title title="Card Title" subtitle="Card Subtitle"  /> */}
                    
                        <Card.Cover source={{ uri: room.images[0].image }} />
                        <Card.Cover source={{ uri: room.images[1].image }} />
                        <Card.Cover source={{ uri: room.images[2].image }} />
                        <Card.Content>
                            <Text variant="titleLarge">Tiêu đề: {room.title}</Text>
                            <Text variant="bodyMedium">Mô tả: {room.description}</Text>
                            <Text variant="bodyMedium">Giá: {room.price}</Text>
                            <Text variant="bodyMedium">Tên: {room.name}</Text>
                            <Text variant="bodyMedium">Địa chỉ: {room.address}</Text>
                            <Text variant="bodyMedium">Diện tích: {room.area}</Text>
                            <Text variant="bodyMedium">Địa chỉ: {room.address}</Text>
                            <Text variant="bodyMedium">Số lượng người ở: {room.num_of_people}</Text>
                            <Text variant="bodyMedium">Danh mục: {room.category.name}</Text>
                        </Card.Content>
                        {/* <Card.Actions>
                        <Button>Cancel</Button>
                        <Button>Ok</Button>
                        </Card.Actions> */}
                    </Card>

                    <MapView style={{width: Dimensions.get('window').width, height:200}}
            
                        initialRegion={{  
                            latitude: parseFloat(room.latitude),
                            longitude: parseFloat(room.longitude),
                            latitudeDelta: 0,
                            longitudeDelta: 0,
                        }}
                        
                            provider='google'>

                    { room.latitude && room.longitude &&
                        <Marker
                            coordinate={{
                                latitude: parseFloat(room.latitude),
                                longitude: parseFloat(room.longitude),
                            }}
                            title={room.name}
                            description={room.district.name}
                        />} 
                    </MapView>
                   
                </>}
               

                <View>
                    <TextInput style={MyStyles.margin} multiline={true} label="Nội dung bình luận..." value={content} onChangeText={setContent}  />
                    <View style={[MyStyles.row, {justifyContent: "flex-end"}]}>
                       {user && <Button onPress={sendComment} style={MyStyles.margin} textColor="white" buttonColor='blue' icon="comment">Thêm bình luận</Button>}
                    </View>
                </View>
              
                {/* <View>
                    {loading && <ActivityIndicator/>}
                    {comments && <>
                        {Array.isArray(comments) && comments.map(c => <List.Item key={c.id}
                                title={c.content}
                                description={moment(c.created_date).fromNow()}
                                left={() => <Image source={{uri: c.user.avatar}} style={MyStyles.avatar} />}
                            />)}
                    </>}
                </View> */}
                <View>
                    <RefreshControl onRefresh={() => loadRooms()} />
                    {loading && <ActivityIndicator />}
                    {/* {comments===null?<ActivityIndicator />:<> */}
                    {/* </>}  */}
                    {/* {comments && <> */}
                        {Array.isArray(comments) && comments.map(c => 
                            

                                
                                <List.Item key={c.id}
                                    title={c.user.last_name +" "+ c.user.first_name}
                                    description={c.content}
                                    left={() => <Image source={{uri: c.user.avatar}} style={MyStyles.avatar} />}
                                    right={() => <Text>{moment(c.created_date).fromNow()}</Text>}
                                />
                        )} 
                    {/* </>} */}
                   
                </View>
                {loading && page > 1 && <ActivityIndicator />}
            </ScrollView>
        </View>  
    );
}
export default RoomDetail;